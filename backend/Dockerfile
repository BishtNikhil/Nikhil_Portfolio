# Use the official lightweight Node.js 20 image (Alpine Linux for small footprint).
# https://hub.docker.com/_/node
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install ONLY production dependencies to keep the container extra small
RUN npm install --only=production

# Copy the rest of the application code into the container
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]
