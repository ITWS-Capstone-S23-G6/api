# api
API for Applicant Tracker

## Requirements
docker

checkout https://docs.docker.com/get-docker/ on configuring docker on your machine

## Usage

### Make project root directory
E.g. `mkdir applicant-tracker`

### Clone repository inside root directory
`cd applicant-tracker && git clone https://github.com/ITWS-Capstone-S23-G6/api.git`

### Build docker image
`docker build . -t api`

### Run built docker image
`docker run -p 4000:4000 api`
