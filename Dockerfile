FROM alpine:3.24@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf AS base
RUN apk add --no-cache nodejs
WORKDIR /app

FROM base AS build
RUN apk add --no-cache npm
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit
COPY . .
RUN npm test && npm run build

FROM base
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY package.json vite.config.js ./
RUN addgroup -S app && adduser -S -G app app && mkdir records && chown app:app records
USER app
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:5173/', {method:'HEAD'}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--host", "0.0.0.0", "--port", "5173", "--strictPort", "--configLoader", "runner"]
