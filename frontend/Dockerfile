FROM node:24-bookworm-slim

WORKDIR /app
COPY server.mjs ./
COPY src ./src
COPY public ./public

USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
