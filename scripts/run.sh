#!/usr/bin/env bash
set -euo pipefail

IMAGE="${1:-ghcr.io/OWNER/vulnerable-treasures:latest}"
NAME="vt"
PORT="${PORT:-3000}"

if docker ps -a --format '{{.Names}}' | grep -qx "$NAME"; then
  echo "Container '$NAME' exists. Removing..."
  docker rm -f "$NAME" >/dev/null || true
fi

echo "Starting $IMAGE on port $PORT..."
docker run -d --name "$NAME" -p "$PORT:3000" "$IMAGE"
echo "Open http://localhost:$PORT"
