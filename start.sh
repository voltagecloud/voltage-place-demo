#!/bin/bash
# . env/bin/activate
# cd python-backend
# flask run -h 0.0.0.0 -p 8080
gunicorn backend:app --bind 0.0.0.0:8080