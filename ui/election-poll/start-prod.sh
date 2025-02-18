#!/bin/bash

# Start Nginx in background
nginx

# Start SSH port forwarding
ssh -N -R 0.0.0.0:8989:localhost:80 ubuntu@3.84.6.19 &

# Keep container running and handle signals
trap 'kill $(jobs -p)' INT TERM
tail -f /dev/null
