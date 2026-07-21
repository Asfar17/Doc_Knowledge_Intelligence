#!/bin/bash
# Azure App Service startup script for FastAPI backend

echo "Installing Python dependencies..."
pip install -r /home/site/wwwroot/requirements.txt

echo "Starting FastAPI with gunicorn..."
cd /home/site/wwwroot
gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000 --timeout 120
