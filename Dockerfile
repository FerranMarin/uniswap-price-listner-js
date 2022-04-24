FROM node:16 as builder

COPY . /opt/app
WORKDIR /opt/app


RUN npm run build

FROM builder  as production

# Todo remove not needed files
ENTRYPOINT ["node", "build/main/cli.js", "listen"]