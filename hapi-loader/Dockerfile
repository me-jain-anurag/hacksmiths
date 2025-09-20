# Use a lightweight Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files first
# This allows Docker to cache the npm install step if the dependencies don't change
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the hapi-loader application code
# This includes your scripts, data, and the pipeline runner
COPY . .

# Make the main pipeline script executable
RUN chmod +x run-pipeline.sh

# Set the default command for the container to run our pipeline script
CMD ["./run-pipeline.sh"]

