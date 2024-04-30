#!/bin/bash

# Run the database initialization script
python init_db.py

# Start the main application
exec uvicorn main:app --host 0.0.0.0 --port 8000
