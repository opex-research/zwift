# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Accept environment variables from build arguments
ARG REACT_APP_GO_BACKEND_URL
ARG REACT_APP_PYTHON_BACKEND_URL

# Set environment variables so npm run build can use them
ENV REACT_APP_GO_BACKEND_URL=$REACT_APP_GO_BACKEND_URL
ENV REACT_APP_PYTHON_BACKEND_URL=$REACT_APP_PYTHON_BACKEND_URL

COPY package.json package-lock.json ./
RUN npm install -g npm@latest
RUN npm ci --fetch-retries=5 --fetch-retry-factor=2 --fetch-retry-mintimeout=1000 --fetch-timeout=600000
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
