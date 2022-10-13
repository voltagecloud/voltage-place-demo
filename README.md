# voltage-place

## Setup

Add these three secrets:
EXTERNAL_WEBHOOK_URL (leave blank for now)
LNBITS_API_KEY (lnbits invoice key: abc123...)
LNBITS_URL (https://7578059e5c.d.voltageapp.io)

in Shell:
cd python-backend
./setup-backend.sh
./setup-db.sh

Now click Run! (which runs start.sh)

Now grab the url of the running site and add it as the EXTERNAL_WEBOOK_URL









## Cheating (LOOK AWAY!)

```
import os 
import request

LNBITS_API_KEY = os.getenv("LNBITS_API_KEY")

lnbits_header = {
    "X-Api-Key": LNBITS_API_KEY
}
```
    
TODO 1
```python
    invoice_details = {
        "out": False,
        "amount": amount,
        "memo": purchase_id,
        "unit": "sat",
        "webhook": f"{EXTERNAL_WEBHOOK_URL}/webhook"
    }
    lnbits_invoice = requests.post(
        f"{LNBITS_URL}/api/v1/payments", headers=lnbits_header, json=invoice_details
    ).json()
    print(lnbits_invoice)
    payment_hash = lnbits_invoice["payment_hash"]
    response = {
        "hash": payment_hash,
        "request": lnbits_invoice["payment_request"]
    }
```


TODO 2

```python
    lnbits_invoice_status = requests.get(
        f"{LNBITS_URL}/api/v1/payments/{payment_hash}", headers=lnbits_header
    ).json()
    
    is_paid_now = lnbits_invoice_status["paid"]
```