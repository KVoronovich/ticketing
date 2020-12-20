FROM node:alpine

# workaround for 503 error in browser
ENV CI=true 

WORKDIR /app
COPY ./package.json .
RUN npm install --only=prod
COPY . .

CMD ["npm", "start"]