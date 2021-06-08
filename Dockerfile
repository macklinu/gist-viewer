FROM mhart/alpine-node:14.16.0
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn
COPY . /app/
EXPOSE 3000
CMD ["yarn", "dev"]
