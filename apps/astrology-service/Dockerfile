FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY apps/astrology-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY apps/astrology-service/ .

# Create cache directory
RUN mkdir -p cache && chmod 777 cache

# Create non-root user
RUN useradd -m -u 1001 astrology && \
    chown -R astrology:astrology /app

USER astrology

EXPOSE 5000

CMD ["python", "app.py"]
