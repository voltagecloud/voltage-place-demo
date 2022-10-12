FROM phusion/baseimage:jammy-1.0.1

RUN apt update && apt install -y python3.10-venv

ENV APPDIR /app
WORKDIR /app
COPY frontend /app/frontend
COPY python-backend /app/python-backend
COPY *.sh /app/
RUN ls /app
WORKDIR /app/frontend


ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app/python-backend
RUN /app/setup-backend.sh 
RUN /app/setup-db.sh

ENTRYPOINT /app/start.sh