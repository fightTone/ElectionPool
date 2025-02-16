FROM node:18-alpine

WORKDIR /app

# Install necessary packages including SSH
RUN apk add --no-cache bash openssh-client

# Copy your application files
COPY package*.json ./
RUN npm install
COPY . .

# Create .ssh directory
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

EXPOSE 3000

# Keep container running
CMD ["tail", "-f", "/dev/null"]