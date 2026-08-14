#!/bin/sh
set -e

if [ ! -f /var/www/html/.env ]; then
    echo "Warning: no .env file found in the container. Mount one or inject config via environment variables before running in production."
fi

exec "$@"
