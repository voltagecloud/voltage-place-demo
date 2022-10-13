#!/bin/bash
prisma db push
prisma db seed

gunicorn backend:app --bind 0.0.0.0:8080