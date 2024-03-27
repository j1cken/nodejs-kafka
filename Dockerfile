FROM node:alpine

# Add application sources
ADD producer.js .
ADD package.json .

# Install the dependencies
RUN npm install

# Run script uses standard ways to run the application
CMD node producer.js
