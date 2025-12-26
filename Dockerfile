FROM node:20.15.1-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321

CMD ["yarn", "start"]
