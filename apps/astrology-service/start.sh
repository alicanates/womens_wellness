#!/bin/bash

# Python astrology microservice starter

echo "Starting Astrology Microservice..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start service
echo "Starting Flask server on port 5001..."
python app.py
