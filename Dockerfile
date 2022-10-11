FROM phusion/baseimage:jammy-1.0.1

RUN apt update && apt install -y python3.10-venv

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
ENV NODE_VERSION=18.10.0

ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
RUN npm install -g yarn
RUN yarn --version



ENV APPDIR /app
WORKDIR /app
COPY frontend /app/frontend
COPY python-backend /app/python-backend
COPY *.sh /app/
RUN ls /app
WORKDIR /app/frontend
RUN /app/setup-frontend.sh 


ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app/python-backend
RUN /app/setup-backend.sh 
RUN /app/setup-db.sh
ENV EXTERNAL_WEBHOOK_URL addme
ENV LNBITS_URL addme
ENV LNBITS_API_KEY addme
ENTRYPOINT /app/start.sh