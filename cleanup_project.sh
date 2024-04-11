#!/bin/bash

# Kill the CockroachDB process
pkill -f 'cockroach'

# Wait a bit to ensure the process has been terminated
sleep 2

# Remove the CockroachDB data directory
rm -rf ./Backend/cockroach-data

echo "Cleanup completed."
