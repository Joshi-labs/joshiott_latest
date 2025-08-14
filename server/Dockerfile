# Dockerfile for HLS Streaming Server

# Stage 1: Use an official Node.js runtime as a parent image.
# 'alpine' is a lightweight version of Linux, which makes our final image smaller and more secure.
FROM node:20-alpine

# Stage 2: Set the working directory inside the container.
# All subsequent commands will run from this directory.
WORKDIR /app

# Stage 3: Copy package.json and package-lock.json.
# This is done first to leverage Docker's layer caching. If these files don't change,
# Docker won't re-run 'npm install' on subsequent builds, making them much faster.
COPY package*.json ./

# Stage 4: Install application dependencies inside the container.
RUN npm install

# Stage 5: Copy the rest of your application's source code into the container.
# This includes your index.js file.
COPY index.js .

# Stage 6: Expose the port that the application runs on.
# This tells Docker which port to make available to the host machine.
EXPOSE 8080

# Stage 7: Define the default command to run when the container starts.
CMD [ "node", "index.js" ]
