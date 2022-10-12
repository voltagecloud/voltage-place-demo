# voltage-place

## Setup

Add these three secrets:
EXTERNAL_WEBHOOK_URL (https://voltage.place)
LNBITS_API_KEY (abc123...)
LNBITS_URL (https://851ac819d2.d.voltageapp.io)

in Shell:
cd python-backend
./setup-backend.sh
./setup-db.sh

Now click Run! (which runs start.sh)








## Cheating (LOOK AWAY!)

    
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