FROM node:alpine

# Add application sources
ADD producer.js .

# Install the dependencies
RUN npm install

# Run script uses standard ways to run the application
CMD node producer.js
