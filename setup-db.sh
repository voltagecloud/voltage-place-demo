#!/bin/bash
cd python-backend

# prisma py fetch
prisma py generate --schema=schema.prisma
prisma db push
prisma db seed