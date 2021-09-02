#!/usr/bin/env bash

set -euo pipefail

export DOCKER_BUILDKIT=1


function composeDown() {
  ./with-env.sh docker-compose down
}

./with-env.sh docker-compose build

# Start the docker containers
./with-env.sh docker-compose up -d --force-recreate --remove-orphans
# cleanup
trap \
  "./with-env.sh docker-compose down" SIGINT SIGTERM ERR EXIT

go run cmd/main.go loadgen --server-address="http://localhost:4040" &


start=$(date +%s)
sleep 5m

# TODO(eh-am): use docker-compose exec
docker exec benchmark_client_1 ./benchmark-main promquery
  'rate(pyroscope_http_request_duration_seconds_count{handler="/ingest", code="200"}[5m])' \
  --prometheus-address=http://prometheus:9090
