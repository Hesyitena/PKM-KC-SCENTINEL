FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
# No compiler needed: asyncpg, bcrypt and cryptography all ship manylinux wheels.
COPY requirements.txt .
RUN pip install --no-cache-dir --retries 10 --timeout 120 -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
