# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Create a directory for logs
RUN mkdir -p logs

# Expose port 8880
EXPOSE 8880

# Define the command to run the application
CMD ["node", "src/app.js"]