import json
import uuid
import os
import base64
from io import BytesIO
from datetime import datetime

from flask import Flask, request, render_template, send_file
import requests
from prisma import Prisma
import webcolors
from PIL import Image
from flask_cors import CORS


app = Flask(
    __name__,
    static_url_path='', 
    static_folder='../frontend/dist',
    template_folder='../frontend/dist'
)
CORS(app)

## *** SET THESE ENVIRONMENT VARIABLES IN YOUR REPLIT!!! ***

# This is your REPLIT Domain name
EXTERNAL_WEBHOOK_URL = os.getenv("EXTERNAL_WEBHOOK_URL")
# This is the URL of your LNBits Instance
LNBITS_URL = os.getenv("LNBITS_URL")
# This is the API Key for readonly/invoice access to your lnbits
LNBITS_API_KEY = os.getenv("LNBITS_API_KEY")

lnbits_header = {
    "X-Api-Key": LNBITS_API_KEY
}

@app.route("/hello-world", methods=["GET"])
def hello_world():
    """
    This is a very basic endpoint which accepts GET requests!
    """
    print("inside hello_world")
    return "hello-world"

@app.route("/", methods=["GET"])
def home():
    return render_template('index.html')

@app.route("/purchase", methods=["POST"])
def purchase():
    """
        When the user wants to select a set of pixels to color, they use this API. It is just returns a 
    purchase order id, which can then be used to create a payment request.

    request: { pixels: [0,21,66], color: '#ff0066' }
    response: { purchaseId: '123-456-789' }
    """
    print("inside purchase")

    # get data from POST body
    data = request.json
    print(data)

    draw_requests = data["order"]
    draw_ids = []
    num_pixels = 0

    # Create Multiple Draw Objects
    with Prisma() as db:
        with db.batch_() as batcher:
            for color_order in draw_requests:
                pixel_ids = [{"id": i} for i in color_order["pixels"]]
                num_pixels += len(pixel_ids)
                draw = db.draw.create(
                    data={"color": color_order["color"], "pixels": {"connect": pixel_ids}},
                    include={"pixels": True}
                )
                draw_ids.append({"id": draw.id})

    print(num_pixels)
    # Create Purchase Object
    with Prisma() as db:
        purchase = db.purchase.create(
            data={
                "drawings": {"connect": draw_ids},
                "complete": False,
                "numPixels": num_pixels
            },
            include={"drawings": True}
        )
    
    print("Created a purchase")
    print(purchase)
    purchase_id = purchase.id
    response = {
        "purchaseId": purchase_id,
        "numPixels": num_pixels
    }

    # make a purchase object
    return response


@app.route("/payment/create", methods=["POST"])
def create_invoice():
    """
        When the user wants to pay for their pixels, they can use this endpoint to generate a lightning,
    payment request. The user is allowed to specify a larger amount than the number of pixels as a donation.
    request: { purchaseId: '123-456-789', amount: 150 }
    response: { hash: 'abcd…', request: 'lnbc…' }
    """
    print("inside create_invoice")
    # get data from POST body
    data = request.json
    print(data)

    purchase_id = data["purchaseId"]
    amount = data["amount"]

    with Prisma() as db:
        purchase = db.purchase.find_unique(
            where={"id": purchase_id},
            include={"drawings": True}
        )

    pixels_in_drawing = purchase.numPixels
    pixels_in_drawing = 10

    # if amount < pixels_in_drawing:
    if amount < 10:
        return f"must pay {pixels_in_drawing} or more to continue", 400

    # Create a lightning invoice
    # TODO 1
    invoice_details = {
      "out": False,
      "amount": amount,
      "memo": purchase_id,
      "unit": "sat" 
    }

    lnbits_invoice = requests.post(f"{LNBITS_URL}/api/v1/payments", headers=lnbits_header, json=invoice_details).json()

    print(lnbits_invoice)

    payment_hash = lnbits_invoice["payment_hash"]
    payment_request = lnbits_invoice["payment_request"]

    response = { "hash": payment_hash, "request": payment_request}

    # Create Payment Object and Link payment object to purchase object
    with Prisma() as db:
        db.payment.create(
            data={"memo": {"connect": {"id": purchase_id}}, "hash": payment_hash, "amount": amount, "paid": False},
            include={"memo": True}
        )

    # return
    return json.dumps(response)


@app.route("/payment/check", methods=["POST"])
def check():
    """
    request: { hash: 'abcd…' }
    response: { paid: false }
    """

    print("inside check")
    # get data from POST body
    data = request.json
    print(data)

    payment_hash = data["hash"]

    with Prisma() as db:
        payment = db.payment.find_unique(where={"hash": payment_hash})

    if not payment:
        return "not found", 404

    is_paid = payment.paid
    
    # Check paid status from lnbits
    # TODO 2
    lnbits_invoice_status = requests.get(f"{LNBITS_URL}/api/v1/payments/{payment_hash}", headers=lnbits_header).json()

    is_paid_now = lnbits_invoice_status["paid"]

    # Write to database if it is paid, and db says it isnt
    if is_paid_now and not is_paid:
        mark_invoice_paid_and_draw(payment_hash)

    return json.dumps({"paid": is_paid_now})


@app.route("/grid", methods=["GET"])
def grid():
    """
    response: { cols: 100, pixels: ['#aabbcc', '#aabbcc', '…'] }
    """
    # TODO: Read config file
    print("inside grid")

    with Prisma() as db:
        pixels = db.pixel.find_many(take=2500)

    count = len(pixels)
    colors = [pixel.color for pixel in pixels]

    # TODO: Get the number of columns from some kind of config file
    return json.dumps({"cols": count, "pixels": colors})


@app.route("/image.png", methods=["GET"])
def image():
    """
    response: image in png format
    """

    return send_file("images/latest.png", mimetype="image/png")

@app.route("/webhook", methods=["GET", "POST"])
def webhook():
    print("received a webook event!")
    print(request)
    args = request.args
    data = request.json
    print(data)


    payment_hash = data["payment_hash"]

    mark_invoice_paid_and_draw(payment_hash)


    print(args)
    return "success"



def mark_invoice_paid_and_draw(payment_hash):
    with Prisma() as db:
        # Mark payment as paid
        payment = db.payment.find_unique(
            where={"hash": payment_hash}
        )
        if payment is None:
            return "unknown", 404

        # Mark purchase as completed
        purchase_id = payment.purchaseId
        purchase = db.purchase.find_unique(
            where={"id": purchase_id},
      	    include={
      	    	"drawings": {"include": {"pixels": True}},
      	    }
        )

        db.purchase.update(
            data={"complete": True},
            where={"id": purchase_id}
        )

        drawings = purchase.drawings

        with db.batch_() as batcher:
            for drawing in drawings:
                new_color = drawing.color

                for pix in drawing.pixels:
                    new_color = drawing.color

                    # Draw pixels on board
                    batcher.pixel.update(
                        data={"color": new_color},
                        where={"id": pix.id}
                    )

        # Finally mark payment as paid
        # which will cause the page to reload
        db.payment.update(
            data={"paid": True},
            where={"hash": payment.hash}
        )
        generate_image()

def generate_image():
    print("saving image to filesystem")
    with Prisma() as db:
        pixels = db.pixel.find_many(take=262144)

    colors = [pixel.color for pixel in pixels]
    colors_rgb = [tuple(webcolors.hex_to_rgb(x)) for x in colors ]

    im = Image.new(mode="RGB", size=(512, 512))
    im.putdata(colors_rgb)

    im.save("images/latest.png")
    now = datetime.now().replace(microsecond=0).isoformat()
    im.save(f"images/{now}.png")

    outfile = BytesIO()
    im.save(outfile, format="PNG")
    return outfile

# if __name__ == "__main__":