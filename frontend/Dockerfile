FROM node:18

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install
EXPOSE 5173

CMD ["sh", "-c", "yarn && yarn dev --host"]