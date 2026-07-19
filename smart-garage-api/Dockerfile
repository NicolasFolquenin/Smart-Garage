FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Copia as pastas de forma explícita
COPY models/ ./models/
COPY config/ ./config/
# Copia o restante dos arquivos
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]