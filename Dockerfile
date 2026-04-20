FROM node:18

WORKDIR /app

# Copy the entire project context (frontend and backend)
COPY . .

# Install dependencies for the backend
RUN cd backend && npm install

# Install dependencies for the frontend and build static assets
RUN cd frontend && npm install && npm run build

# Cloud Run defaults mapping to 8080
EXPOSE 8080

# Start the combined server
CMD ["node", "backend/server.js"]
