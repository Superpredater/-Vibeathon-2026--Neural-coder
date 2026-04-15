#!/bin/bash
cd "$(dirname "$0")"
pip install -r requirements.txt -q
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
