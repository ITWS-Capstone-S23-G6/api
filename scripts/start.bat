@echo off

REM Check if Docker image exists
for /f "tokens=*" %%a in ('docker image ls ^| findstr api') do set output=%%a
if defined output (
  echo Found existing 'api' image. Removing...
  REM Remove existing Docker image
  docker image rm -f api
)

REM Build Docker image
docker build . -t api

REM Run Docker container
docker run -p 4000:4000 api
