FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV CONTRATA_IA_DATA_DIR=/data/contrata-ia
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY scripts/start-pilot.mjs ./scripts/start-pilot.mjs
RUN mkdir -p /data/contrata-ia && chown -R node:node /app /data/contrata-ia
USER node
EXPOSE 3000
VOLUME ["/data/contrata-ia"]
CMD ["node", "scripts/start-pilot.mjs"]
