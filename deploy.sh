#!/bin/bash
# Smart Parking System — Server Deploy Script
# Usage: ./deploy.sh

set -e

echo "=========================================="
echo "  Smart Parking System — Deploy"
echo "=========================================="

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "Docker topilmadi. O'rnatilmoqda..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker o'rnatildi. Qayta login qiling va skriptni yana ishga tushiring."
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "Docker Compose topilmadi!"
  exit 1
fi

# Create .env if missing
if [ ! -f .env ]; then
  echo ".env fayli yaratilmoqda..."
  cp .env.production.example .env
  # Generate random JWT secret
  if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    sed -i "s|your-super-secret-jwt-key-min-32-chars|$SECRET|" .env 2>/dev/null || \
    sed -i '' "s|your-super-secret-jwt-key-min-32-chars|$SECRET|" .env
  fi
  echo "⚠️  .env faylini tekshiring va kerak bo'lsa tahrirlang"
fi

echo ""
echo "Docker image'lar build qilinmoqda..."
docker compose build --no-cache

echo ""
echo "Konteynerlar ishga tushirilmoqda..."
docker compose up -d

echo ""
echo "Kutilmoqda (health check)..."
sleep 15

# Health check
if curl -sf http://localhost:${APP_PORT:-80}/api/health > /dev/null 2>&1; then
  echo ""
  echo "✅ Deploy muvaffaqiyatli!"
  echo ""
  echo "  🌐 Web:  http://$(hostname -I | awk '{print $1}'):${APP_PORT:-80}"
  echo "  📡 API:  http://$(hostname -I | awk '{print $1}'):${APP_PORT:-80}/api/health"
  echo ""
  echo "  Login: admin@parking.com / admin123"
  echo ""
else
  echo "⚠️  Health check o'tmadi. Loglarni tekshiring:"
  echo "  docker compose logs -f"
fi
