# SportsBro Deployment Guide

This guide will walk you through the steps required to deploy the SportsBro application in a production environment.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account (or another MongoDB provider)
- A hosting provider for the frontend (e.g., Vercel, Netlify)
- A hosting provider for the backend (e.g., Heroku, Railway, DigitalOcean)

## 1. Prepare the Backend

### 1.1 Set Up Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=5003
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback

# Frontend URL for redirects
FRONTEND_URL=https://your-frontend-url.com

# Admin token for secure access to admin endpoints
ADMIN_TOKEN=your_secure_admin_token
```

Make sure to replace all placeholders with your actual values.

### 1.2 Build the Backend

```bash
cd backend
npm install
npm run build
```

This will create a `dist` directory with the compiled TypeScript code.

## 2. Prepare the Frontend

### 2.1 Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=https://your-backend-url.com/api
```

### 2.2 Build the Frontend

```bash
npm install
npm run build
```

This will create a `dist` directory with the built frontend assets.

## 3. Deploy the Backend

### Option 1: Deploy to Heroku

1. Create a new Heroku app
2. Connect your GitHub repository or use the Heroku CLI to deploy
3. Set the environment variables in the Heroku dashboard
4. Deploy the application

```bash
heroku login
heroku create your-backend-app-name
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

### Option 2: Deploy to Railway

1. Create a new project in Railway
2. Connect your GitHub repository
3. Set the environment variables in the Railway dashboard
4. Deploy the application

### Option 3: Deploy to DigitalOcean App Platform

1. Create a new app in DigitalOcean App Platform
2. Connect your GitHub repository
3. Set the environment variables in the DigitalOcean dashboard
4. Deploy the application

### Option 4: Deploy with Docker

The SportsBro application can be containerized for easy deployment across different environments.

#### 4.1 Create Dockerfiles

**Backend Dockerfile (backend/Dockerfile)**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5003

CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile (Dockerfile)**

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration (nginx.conf)**

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5003/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 4.2 Create Docker Compose Configuration

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:5003/api

  backend:
    build: ./backend
    ports:
      - "5003:5003"
    environment:
      - PORT=5003
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
      - FRONTEND_URL=${FRONTEND_URL}
      - ADMIN_TOKEN=${ADMIN_TOKEN}
```

#### 4.3 Deploy with Docker Compose

```bash
docker-compose up -d
```

#### 4.4 Deploy to Kubernetes

If you need to scale your application, you can use Kubernetes to orchestrate your Docker containers.

1. Create Kubernetes deployment manifests for both frontend and backend
2. Use Kubernetes ConfigMaps and Secrets for environment variables
3. Set up Kubernetes Services and Ingress for routing
4. Deploy to a Kubernetes cluster using `kubectl apply`

#### 4.5 Deploy to AWS ECS

For AWS users, you can deploy your Docker containers to Amazon ECS (Elastic Container Service):

1. Push your Docker images to Amazon ECR (Elastic Container Registry)
2. Set up ECS Task Definitions for your containers
3. Create ECS Services to run and maintain your tasks
4. Configure Application Load Balancer for routing traffic

## 4. Deploy the Frontend

### Option 1: Deploy to Vercel

1. Push your code to GitHub
2. Create a new project in Vercel
3. Connect your GitHub repository
4. Set the environment variables in the Vercel dashboard
5. Deploy the application

### Option 2: Deploy to Netlify

1. Push your code to GitHub
2. Create a new site in Netlify
3. Connect your GitHub repository
4. Set the environment variables in the Netlify dashboard
5. Deploy the application

## 5. Update Configuration

### 5.1 Update Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Credentials" 
4. Edit your OAuth 2.0 Client ID
5. Add your production redirect URI: `https://your-backend-url.com/api/auth/google/callback`
6. Add your production JavaScript origins: `https://your-frontend-url.com`

### 5.2 Update MongoDB Network Access

1. Go to MongoDB Atlas
2. Go to Network Access
3. Add the IP addresses of your backend server (or allow all IP addresses with `0.0.0.0/0`)

## 6. Test the Deployment

1. Visit your frontend URL
2. Test the login functionality
3. Test the Google OAuth login
4. Test the admin login with your admin token
5. Test creating and joining teams
6. Test profile updates

## 7. Maintenance and Monitoring

### 7.1 Backend Logs

You can view logs for your backend application through your hosting provider's dashboard or CLI.

### 7.2 Database Backups

Set up regular backups of your MongoDB database through MongoDB Atlas.

### 7.3 Security Updates

Regularly update your dependencies to ensure security vulnerabilities are patched.

### 7.4 Container Monitoring

If using Docker, set up container monitoring with tools like:

- Docker Stats
- Prometheus and Grafana
- Datadog
- New Relic

### 7.5 Automated Deployments

Set up CI/CD pipelines for automated deployments:

- GitHub Actions
- GitLab CI/CD
- Jenkins
- CircleCI

## 8. Troubleshooting

### 8.1 CORS Issues

If you encounter CORS issues, ensure that your backend has the correct CORS configuration with your frontend URL:

```javascript
const allowedOrigins = ['https://your-frontend-url.com'];
```

### 8.2 Environment Variables

Ensure all environment variables are correctly set on both frontend and backend.

### 8.3 Google OAuth Issues

- Verify the correct redirect URIs are set in Google Cloud Console
- Ensure the client ID and client secret are correct in your backend .env file
- Check that the JavaScript origins are correctly set in Google Cloud Console

### 8.4 Docker Container Issues

- Check container logs: `docker logs <container_id>`
- Ensure ports are correctly mapped
- Verify environment variables are being passed correctly
- Check for networking issues between containers

## 9. Production Optimizations

### 9.1 Set Up a CDN

Consider setting up a CDN for your frontend assets to improve load times.

### 9.2 Enable Compression

Enable gzip or Brotli compression on your backend server.

### 9.3 Implement Caching

Implement caching for API responses where appropriate.

### 9.4 Container Optimization

- Use multi-stage builds for smaller container images
- Implement container health checks
- Set resource limits for containers
- Use container orchestration for auto-scaling

## 10. Scaling

### 10.1 Database Scaling

As your application grows, consider scaling your MongoDB Atlas instance.

### 10.2 Backend Scaling

Consider using multiple instances of your backend server behind a load balancer if needed.

### 10.3 Container Orchestration

For large-scale deployments, use container orchestration tools like:

- Kubernetes
- Amazon ECS
- Google Kubernetes Engine (GKE)
- Azure Kubernetes Service (AKS)

These tools can automatically scale your application based on demand, provide high availability, and ensure efficient resource utilization.

---

For any additional questions or issues with deployment, please refer to the documentation for your specific hosting providers or create an issue in the GitHub repository. 