FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache git

# Install dependencies
COPY package.json yarn.lock ./

RUN yarn install

# Copy the code
COPY . .

# Compile TypeScript
RUN yarn build

CMD [ "yarn", "start" ]
