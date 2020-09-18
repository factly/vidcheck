# pull official base image
FROM node:14.10.1-alpine3.10

# set working directory
WORKDIR /app

# install app dependencies
COPY package.json yarn.lock /app/
RUN yarn global add react-scripts && yarn

# start app
CMD ["yarn", "start"]
