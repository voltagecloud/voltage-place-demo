# voltage-place


## Frontend Setup

It should already be built and ready.
Ask Adrien if there are questions.
https://68e894d726.d.voltageapp.io/tipjar/1


## Python Backend

```bash
cd python-backend
# Create/Setup Python Virtual Environment
python -m venv env
. env/bin/activate
pip install -r requirements.txt


# Sqlite DB Setup
prisma py fetch
prisma db push
prisma db seed


# Start the API Server
flask run -h 0.0.0.0
```

