#!/bin/bash


mkdir -p python-backend/images
cp frontend/public/tabconf.png python-backend/images/latest.png

python3 -m venv env
. env/bin/activate

cd python-backend
pip install -r requirements.txt