FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install --save express-session
RUN npm install --save-dev @types/express-session

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 5003

# Start the application
CMD ["node", "dist/index.js"]
