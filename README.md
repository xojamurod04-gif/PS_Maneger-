# 🎮 PS MANAGER PRO - PlayStation & Computer Club Management System

PlayStation hamda Kompyuter klublari, Game Loungelar va VIP xonalarni professional darajada boshqarish uchun mo'ljallangan zamonaviy veb-tizim.

---

## 🚀 Asosiy Imkoniyatlar

### 1. 🎮 Barmen (Operator) Paneli
- **Interaktiv Stollar & Xonalar Grid-Xaritasi**: PlayStation 5, PC Gaming va VIP xonalarining jonli holatlari (Bo'sh / Band).
- **Vaqt va Taymer Nazorati**: Cheksiz seans yoki belgilangan soatlik seanslar (1 soat, 2 soat va h.k.).
- **Aktiv Seansga Mahsulot Qo'shish**: Ichimlik va yeguliklarni qidirish, kategoriyalar bo'yicha saralash, bir tugma bilan seansga qo'shish va olib tashlash.
- **Jonli Ombor Nazorati**: Stoldagi buyurtmalar ombordan real-vaqt rejimida kamayadi, bekor qilinganda esa qayta tiklanadi.
- **To'lov & Yakunlash**: Naqd pul, Plastik karta yoki Click/Payme orqali seansni avtomatik hisob-kitob qilib yakunlash.

### 2. 📊 Admin Paneli
- **Moliyaviy Hisobotlar & Tushum**: Bugungi va umumiy tushumlar, soatlik vaqt daromadi va mahsulotlar sotuvi bo'yicha alohida analitika.
- **To'lov Turlari Tahlili**: Naqd, Karta va Click to'lovlar bo'yicha bo'lingan statistikalar.
- **Ombor Qoldig'i (Inventory Management)**: Mahsulotlar qoldig'i (stock), minimal qoldiq ogohlantirishlari, yangi mahsulot qo'shish va omborni to'ldirish (`+ Restock`).
- **Xonalar va Soatlik Tariflar**: Kompyuter va xonalar soatlik tariflarini bir зуmda o'zgartirish va yangi xonalar qo'shish.
- **Seanslar Tarixi**: Barcha yakunlangan seanslar va ularning batafsil mahsulotlar tarixi loglari.

---

## 🛠 Texnologiyalar
- **Frontend**: React (Vite) + Lucide Icons + Custom CSS Gaming Theme
- **Backend & Database**: Supabase (PostgreSQL, Realtime updates)

---

## 📥 O'rnatish va Ishga Tushirish

1. **Repozitoriyani klon qiling va loyiha papkasiga o'ting**:
   ```bash
   git clone https://github.com/xojamurod04-gif/PS_Maneger-.git
   cd PS_Maneger-
   ```

2. **Kutubxonalarni o'rnating**:
   ```bash
   npm install
   ```

3. **.env faylini sozlang**:
   Loyihaning ildiz papkasida `.env` faylini yarating va quyidagi kalitlarni kiriting:
   ```env
   VITE_SUPABASE_URL=https://wbidztfspkhtpyhdqmvd.supabase.co
   VITE_SUPABASE_ANON_KEY=sizning_anon_keyingiz
   ```

4. **Supabase Baza Jadvallarini Yaratish**:
   `supabase_setup.sql` faylidagi barcha SQL buyruqlarini nusxalab, Supabase SQL Editor rejimida bir marta ishga tushiring.

5. **Lokal serverni ishga tushirish**:
   ```bash
   npm run dev
   ```

---

## 📝 Muallif
- Loyiha **PS MANAGER PRO** jamoasi tomonidan taqdim etildi.
