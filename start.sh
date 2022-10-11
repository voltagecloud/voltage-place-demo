#!/bin/bash
. env/bin/activate
cd python-backend
flask run -h 0.0.0.0 -p 8080