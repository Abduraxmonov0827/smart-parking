# Serverga Deploy Qo'llanmasi

Smart Parking tizimini VPS serverga (Ubuntu/Debian) Docker orqali deploy qilish.

## Talablar

- **Server:** Ubuntu 20.04+ yoki Debian 11+ (1 GB RAM, 1 CPU yetarli)
- **Docker** va **Docker Compose**
- **Port 80** ochiq (yoki boshqa port)

---

## Tez Deploy (3 qadam)

### 1. Loyihani serverga yuklang

```bash
# Git orqali
git clone <repo-url> smart-parking
cd smart-parking

# YOKI zip orqali SCP:
# scp -r Farruh/ user@SERVER_IP:/home/user/smart-parking
```

### 2. Environment sozlang

```bash
cp .env.production.example .env
nano .env   # JWT_SECRET ni o'zgartiring!
```

**Muhim:** `JWT_SECRET` ni kuchli random qatorga almashtiring.

### 3. Deploy qiling

```bash
chmod +x deploy.sh
./deploy.sh
```

Yoki qo'lda:

```bash
docker compose build
docker compose up -d
```

---

## Kirish

Brauzerda oching: `http://SERVER_IP`

| Rol | Email | Parol |
|-----|-------|-------|
| Admin | admin@parking.com | admin123 |
| Operator | operator@parking.com | operator123 |

> **Birinchi deploydan keyin** `RUN_SEED=false` qilib `.env` da saqlang.

---

## Foydali Buyruqlar

```bash
# Holatni ko'rish
docker compose ps

# Loglarni ko'rish
docker compose logs -f

# Qayta ishga tushirish
docker compose restart

# To'xtatish
docker compose down

# Yangilash (kod o'zgarganda)
git pull
docker compose build
docker compose up -d

# Database backup
docker cp smart-parking-api:/data/parking.db ./backup-$(date +%Y%m%d).db
```

---

## Port o'zgartirish

`.env` faylida:
```
APP_PORT=8080
```

Keyin: `http://SERVER_IP:8080`

---

## HTTPS (SSL) qo'shish

Nginx Proxy Manager yoki Certbot bilan:

```bash
# Certbot misoli (domain kerak)
sudo apt install certbot
sudo certbot certonly --standalone -d parking.example.com
```

Keyin `docker-compose.yml` ga SSL nginx qo'shing yoki reverse proxy ishlating.

---

## Muammolarni hal qilish

| Muammo | Yechim |
|--------|--------|
| Port 80 band | `.env` da `APP_PORT=8080` |
| API ishlamaydi | `docker compose logs backend` |
| Sahifa ochilmaydi | `docker compose logs frontend` |
| DB yo'qolgan | `parking-data` volume tekshiring |
| Login ishlamaydi | `RUN_SEED=true` qilib qayta deploy |

---

## Arxitektura

```
Internet → :80 (nginx/frontend) → /api/* → backend:3001
                                  → /*     → React SPA
                         backend → SQLite (/data/parking.db)
```
