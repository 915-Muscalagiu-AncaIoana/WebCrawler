# syntax=docker/dockerfile:1
FROM node:16-alpine3.15

# set the working dir for container
WORKDIR /Frontend-Web-Crawler-Project

# copy the json file first
COPY ./package.json /Frontend-Web-Crawler-Project

# install npm dependencies
RUN npm install

# copy other project files
COPY . .

# build the folder
CMD [ "npm", "run", "start" ]