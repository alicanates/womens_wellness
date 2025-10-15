#!/bin/bash

# Load environment variables from .env.local
if [ -f "../../.env.local" ]; then
    export $(cat ../../.env.local | grep -v '^#' | xargs)
fi

if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run the test
npx ts-node src/chat/test-chat-flow.ts
