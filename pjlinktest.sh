#!/bin/bash

# IP and port of the projector
IP="192.168.45.185"
PORT="4352"
COMMAND="%1POWR ?"

# Loop 100 times
for i in {1..100}; do
  echo "Attempt $i:"

  # Send the command and capture the response
  RESPONSE=$(echo "$COMMAND" | nc -w 1 $IP $PORT)

  # Check if the response is non-empty
  if [ -n "$RESPONSE" ]; then
    echo "Response received: $RESPONSE"
  else
    echo "No response received."
  fi

  # Optional: Add a delay if needed (e.g., 1 second)
  #sleep 1
done