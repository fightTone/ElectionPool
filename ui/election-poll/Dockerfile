FROM node:18-alpine as builder

WORKDIR /app

# Install essential packages
RUN apk add --no-cache bash

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy and build app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files and nginx config
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]