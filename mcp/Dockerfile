# Dockerfile for PineScript Validator MCP Server

# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy necessary project files
COPY dist/ ./dist/
COPY v6/ ./v6/
COPY test-comprehensive-validator.js ./
COPY mcp/validator-server.js ./mcp/

# Command to run the MCP server
CMD ["node", "./mcp/validator-server.js"]
