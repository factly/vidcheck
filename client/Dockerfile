# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /app

# install app dependencies
COPY package.json /app
COPY yarn.lock /app
RUN npm install -g react-scripts && yarn

# start app
CMD ["yarn", "start"]
