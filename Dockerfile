# Use Node.js official image (Alpine version for small image size)
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (this helps with caching)
COPY package*.json ./

# Install dependencies (including dev dependencies for types)
RUN npm install

# Debug step: Ensure that the packages are installed correctly
RUN ls node_modules
RUN ls node_modules/@types

# Copy all other application files
COPY . .

# Run the TypeScript build
RUN npm run build

# Expose the application port
EXPOSE 8080

# Command to start the application
CMD ["npm", "start"]
