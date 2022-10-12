#!/bin/bash
prisma db push
prisma db seed
mkdir -p /data/images

[ ! -d /app/python-backend/images/ ] && \
    ln -sfn /data/images /app/python-backend/images
    cp -n $APPDIR/frontend/public/tabconf.png $APPDIR/python-backend/images/latest.png


gunicorn backend:app --bind 0.0.0.0:8080