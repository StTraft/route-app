FROM node:8

WORKDIR /app

COPY src ./src
COPY .env .env
COPY .babelrc .babelrc
COPY package*.json ./

RUN npm install --quiet

CMD ["npm", "start", "-e", "production"]

EXPOSE 3000