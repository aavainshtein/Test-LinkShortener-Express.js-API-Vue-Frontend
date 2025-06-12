# --- Этап сборки (Build Stage) ---
FROM node:18-alpine AS build

WORKDIR /app

COPY ./backend/express/package.json ./package.json
COPY ./backend/express/yarn.lock ./yarn.lock
COPY ./backend/express/prisma ./prisma/
COPY ./backend/express/src ./src/
COPY ./backend/express/tsconfig.json ./tsconfig.json
COPY ./backend/express/entrypoint.sh ./entrypoint.sh 

COPY ./shared ./shared/

RUN yarn install --frozen-lockfile


RUN chmod +x ./entrypoint.sh 

RUN yarn prisma generate
RUN yarn run build

# --- Этап продакшена (Production Stage) ---
FROM node:18-alpine AS production

WORKDIR /app
RUN apk update && apk add postgresql-client && rm -rf /var/cache/apk/*

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist 
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/entrypoint.sh ./entrypoint.sh 
RUN chmod +x ./entrypoint.sh 

ENV NODE_ENV production

EXPOSE 3000

CMD ["yarn", "start"]
