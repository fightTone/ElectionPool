FROM python:3.10-slim

WORKDIR /api

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Set longer timeout and retry mechanism for pip
ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

# Install packages with retries
RUN pip config set global.timeout 100 && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --retries 3 -r requirements.txt && \
    pip install --no-cache-dir uvicorn[standard]

COPY . .

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]