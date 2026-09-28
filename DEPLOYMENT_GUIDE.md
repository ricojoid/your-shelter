# 🚀 Your Shelter Docker Deployment Guide (VPS)

Panduan untuk men-deploy **Your Shelter** memakai Docker di VPS `43.157.212.14`. Caranya sama dengan walk-rank.

- **Domain**: https://yourshelter.ocir-dev.my.id
- **Port container**: `3030`
- **Database**: PostgreSQL yang sudah jalan di VPS (`43.157.212.14:5432`), dengan database terpisah bernama **`your_shelter`**

---

## 🗄️ Database
Kamu **tidak perlu** membuat database secara manual. Setiap kali container start, `docker-entrypoint.sh` akan:
1. membuat database `your_shelter` kalau belum ada (database lain seperti `walkrank` tidak tersentuh)
2. menjalankan `server/db/schema.sql` untuk membuat tabel, trigger realtime, dan sheet-sheet. Aman dijalankan berulang.

User DB yang dipakai harus punya izin `CREATE DATABASE`. User `admin` milik walk-rank sudah punya izin ini.

---

## 🚀 Cara Menjalankan di VPS

1. Clone project di VPS:
   ```bash
   git clone <url-repo-your-shelter>.git
   cd your-shelter
   ```
2. Buat file `.env` dari contoh, lalu isi password DB:
   ```bash
   cp .env.example .env
   nano .env        # ganti GANTI_PASSWORD_DB
   ```
3. Jalankan:
   ```bash
   docker compose up -d --build
   ```
4. Cek log, pastikan muncul `✅ Database ready.` dan `Database OK`:
   ```bash
   docker logs -f yourshelter_app
   ```
5. Tes lewat IP: **http://43.157.212.14:3030**. Buka juga port `3030` di Security Group Tencent Cloud kalau ingin bisa diakses langsung lewat IP.

---

## 🌐 Domain `yourshelter.ocir-dev.my.id`

1. **DNS**: di panel DNS `ocir-dev.my.id`, tambahkan **A record**
   `yourshelter` → `43.157.212.14`
   (Saat panduan ini ditulis, record tersebut belum ada.)
2. **nginx** di VPS:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/yourshelter
   sudo ln -s /etc/nginx/sites-available/yourshelter /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. **HTTPS**:
   ```bash
   sudo certbot --nginx -d yourshelter.ocir-dev.my.id
   ```
4. Buka **https://yourshelter.ocir-dev.my.id** 🎉

Pastikan port `80` dan `443` terbuka di Security Group. Dengan HTTPS, tombol **"save to…"** (pilih folder) ikut aktif.

---

## 🛠️ Perintah Berguna

- **Log aplikasi**: `docker logs -f yourshelter_app`
- **Restart**: `docker restart yourshelter_app`
- **Stop**: `docker compose down`
- **Update setelah ada perubahan kode**:
  ```bash
  git pull
  docker compose up -d --build
  ```
- **Sembunyikan postingan (moderasi)**:
  ```bash
  psql "postgres://admin:PASSWORD@43.157.212.14:5432/your_shelter" -c "UPDATE posts SET is_hidden = true WHERE id = 123;"
  ```
- **Tambah atau ubah sheet**: edit daftar di bagian bawah `server/db/schema.sql`, lalu rebuild. Migrasi otomatis jalan saat container start.
