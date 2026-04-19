FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root user
RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 5000

# 2 workers: good default for a small I/O-bound service.
# Formula: (2 x CPU) + 1, but for a single-core k8s pod 2 is appropriate
# without over-subscribing memory per worker.
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "--timeout", "120", "run:app"]
