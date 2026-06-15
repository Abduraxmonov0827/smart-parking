# Bepul Deploy Qo'llanmasi (100% Free)

GitHub + Render (backend) + Vercel (frontend) — **to'liq bepul**.

> **Eslatma:** Render bepul rejimda 15 daqiqa ishlamasa "uxlaydi". Birinchi so'rov 30–50 soniya kutishi mumkin.

---

## Nima kerak?

| Xizmat | Narx | Nima uchun |
|--------|------|------------|
| [GitHub](https://github.com) | Bepul | Kod saqlash |
| [Render](https://render.com) | Bepul | Backend API |
| [Vercel](https://vercel.com) | Bepul | Frontend veb-sayt |

Karta talab qilinmaydi (Render/Vercel uchun).

---

## 1-QADAM: GitHub'ga yuklash

### 1.1 GitHub akkaunt oching
https://github.com/signup

### 1.2 Yangi repository yarating
- Nom: `smart-parking`
- **Public** qiling (bepul deploy uchun)
- README qo'shmang

### 1.3 Kompyuteringizda terminal oching

```powershell
cd D:\Projects\Farruh
git init
git add .
git commit -m "Smart Parking System - initial release"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/smart-parking.git
git push -u origin main
```

`SIZNING_USERNAME` o'rniga GitHub username yozing.

---

## 2-QADAM: Backend — Render (bepul)

### 2.1 Render'ga kiring
https://render.com → **Get Started for Free** → GitHub bilan ulaning

### 2.2 Yangi Web Service
- **New +** → **Web Service**
- GitHub repo: `smart-parking` tanlang

### 2.3 Sozlamalar

| Maydon | Qiymat |
|--------|--------|
| Name | `smart-parking-api` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |
| Plan | **Free** |

### 2.4 Environment Variables qo'shing

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:./data/parking.db` |
| `JWT_SECRET` | (random uzun matn — masalan: `mySecretKey2024SmartParking!`) |
| `RUN_SEED` | `true` |
| `CORS_ORIGIN` | `*` (keyin Vercel URL bilan almashtirasiz) |

### 2.5 **Create Web Service** bosing

5–10 daqiqa kuting. Tayyor bo'lganda URL chiqadi:
```
https://smart-parking-api.onrender.com
```

### 2.6 Tekshiring
Brauzerda oching:
```
https://smart-parking-api.onrender.com/api/health
```
`"status":"ok"` ko'rinsa — backend ishlayapti ✅

---

## 3-QADAM: Frontend — Vercel (bepul)

### 3.1 Vercel'ga kiring
https://vercel.com → **Sign Up** → GitHub bilan ulaning

### 3.2 Yangi loyiha
- **Add New Project**
- `smart-parking` repo tanlang

### 3.3 Sozlamalar

| Maydon | Qiymat |
|--------|--------|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 3.4 Environment Variable qo'shing

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://smart-parking-api.onrender.com/api` |

(Render'dan olgan URL + `/api`)

### 3.5 **Deploy** bosing

2–3 daqiqadan keyin URL chiqadi:
```
https://smart-parking.vercel.app
```

---

## 4-QADAM: CORS sozlash

Render dashboard → `smart-parking-api` → **Environment**:

`CORS_ORIGIN` ni o'zgartiring:
```
https://smart-parking.vercel.app
```
(Vercel'dan olgan URL)

**Save Changes** → avtomatik qayta deploy bo'ladi.

---

## 5-QADAM: Tayyor! 🎉

Brauzerda Vercel URL ni oching va kiring:

| Email | Parol |
|-------|-------|
| `admin@parking.com` | `admin123` |

---

## Muhim eslatmalar

### Render "uxlaydi"
- 15 daqiqa ishlamasa server to'xtaydi
- Birinchi kirish 30–50 soniya kutish kerak
- Bu bepul rejimning cheklovi — normal

### Ma'lumotlar saqlanmaydi
- Render bepul rejimda database vaqtincha
- Har redeploy'da seed qayta ishlaydi (demo ma'lumotlar qaytadi)
- Doimiy DB kerak bo'lsa → Oracle Cloud (quyida)

### Yangilash
```bash
git add .
git commit -m "update"
git push
```
Render va Vercel avtomatik yangilanadi.

---

## ALTERNATIVA: Oracle Cloud (doimiy bepul VPS)

Agar **doimiy ishlaydigan** server kerak bo'lsa (uxlamaydi):

1. https://cloud.oracle.com → Always Free tier
2. Ubuntu VM yarating (ARM, 4 CPU, 24 GB RAM — bepul)
3. `DEPLOY.md` dagi Docker qo'llanmani bajaring

Bu variant karta talab qiladi (pul yechilmaydi), lekin server 24/7 ishlaydi.

---

## Muammolar

| Muammo | Yechim |
|--------|--------|
| Login ishlamaydi | Render loglarni tekshiring, `RUN_SEED=true` bo'lsin |
| API xato | `VITE_API_URL` to'g'ri URL + `/api` bilan yozilganini tekshiring |
| CORS xato | Render'da `CORS_ORIGIN` = Vercel URL |
| Sahifa sekin | Render uyg'onmoqda, 30 soniya kuting |
| Build xato | Render Logs → Environment → build log |

---

## Xulosa — 3 ta bepul xizmat

```
GitHub (kod) → Render (API) → Vercel (veb-sayt)
     ↓              ↓              ↓
   Bepul          Bepul          Bepul
```

Jami to'lov: **$0**
