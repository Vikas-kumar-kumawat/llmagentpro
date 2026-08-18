#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=========================================="
echo "🚀 Building BFibernet Multi-Agent Platform"
echo "=========================================="

echo "=== 1. Installing Python Dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== 2. Building Frontend (Vite + React) ==="
cd frontend
npm install
npm run build
cd ..

echo "=========================================="
echo "✅ Build Complete! App ready for launch."
echo "=========================================="
