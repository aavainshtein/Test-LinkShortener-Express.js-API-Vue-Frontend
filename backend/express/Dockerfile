# --- Этап сборки (Build Stage) ---
FROM node:18-alpine AS build

WORKDIR /app

COPY ./backend/express/package.json ./package.json
COPY ./backend/express/yarn.lock ./yarn.lock

COPY ./shared ./shared/

RUN yarn install --frozen-lockfile

COPY ./backend/express/prisma ./prisma/
COPY ./backend/express/src ./src/
COPY ./backend/express/tsconfig.json ./tsconfig.json

RUN yarn run build

# --- Этап продакшена (Production Stage) ---
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist 
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

ENV NODE_ENV production

EXPOSE 3000

CMD ["yarn", "start"]
