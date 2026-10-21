# ==============================================================================
# Stage 1: Build & Compile
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

COPY apps/ ./apps/
COPY libs/ ./libs/

ARG APP_NAME
RUN npx nest build ${APP_NAME}

# ==============================================================================
# Stage 2: Production Run
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

ARG APP_NAME
ENV TARGET_APP=${APP_NAME}

COPY --from=builder /usr/src/app/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}

COPY --from=builder /usr/src/app/libs/contracts/src/proto/ ./libs/contracts/src/proto/

CMD ["sh", "-c", "if [ -f dist/apps/${TARGET_APP}/main.js ]; then exec node dist/apps/${TARGET_APP}/main.js; else exec node dist/apps/${TARGET_APP}/src/main.js; fi"]