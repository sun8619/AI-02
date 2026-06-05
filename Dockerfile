FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY index.html app.js styles.css server.mjs ./

EXPOSE 4173

CMD ["npm", "start"]
