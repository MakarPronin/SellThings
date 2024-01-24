# Use the official Node.js image as the base image
FROM node:alpine

RUN npm install -g pm2

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

EXPOSE 4003

# Define the command to run your app using nodemon
CMD ["npm", "run", "docker-start"]