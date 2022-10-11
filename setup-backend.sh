#!/bin/bash
echo "Running Setup Backend"

mkdir -p images
cp $APPDIR/frontend/public/tabconf.png $APPDIR/python-backend/images/latest.png

# python3 -m venv $HOME/voltage-place-demo/env
# . $HOME/voltage-place-demo/env/bin/activate

# cd python-backend
pip install -r requirements.txt