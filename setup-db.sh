#!/bin/bash
echo "Running Setup DB"

prisma py generate --schema=schema.prisma
