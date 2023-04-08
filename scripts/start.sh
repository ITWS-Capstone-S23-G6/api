#!/bin/bash

# Check if Docker image exists
if docker image ls | grep api > /dev/null; then
  echo "Found existing 'api' image. Removing..."
  # Remove existing Docker image
  docker image rm -f api
fi

# Build Docker image
docker build . -t api

# Run Docker container
docker run -p 4000:4000 api
