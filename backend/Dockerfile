FROM node:18-alpine

# Required for Prisma engines on Alpine Linux
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the entire backend source code
COPY . .

# Generate the Prisma client for Alpine
RUN npx prisma generate

# Expose the API port
EXPOSE 3001

# Execute as non-root user instead of default root
USER node

# Start the application correctly
CMD ["npm", "start"]
