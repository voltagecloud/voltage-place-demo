#!/bin/bash
cd python-backend

# prisma py fetch
. $HOME/voltage-place-demo/env/bin/activate
prisma py generate --schema=schema.prisma
prisma db push
prisma db seed