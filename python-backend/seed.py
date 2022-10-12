from prisma import Prisma
import code
from datetime import datetime

import webcolors
from PIL import Image

def main() -> None:
    img = Image.open("../frontend/public/tabconf.png")
    img = img.convert("RGB")
    colors_rgb = list(img.getdata())
    colors_hex = [webcolors.rgb_to_hex(rgb) for rgb in colors_rgb]

    index = 0
    count = len(colors_hex)
    with Prisma() as db:
        if db.pixel.count() != 0:
            print("The DB has already been seeded!")
            return
        # with db.batch_() as batcher:
        batcher = db.batch_()
        for i in colors_hex:
            if index % 10000 == 0:
                print(f"adding pixel: {index}/{count}")
                batcher.commit()
            batcher.pixel.create(data={"color": i})
            index = index + 1
        batcher.commit()

if __name__ == "__main__":
    main()
