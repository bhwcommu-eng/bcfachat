# BCFACHAT

เว็บต้นแบบ dating / matching แนว swipe-first ทำด้วย React + Vite และเตรียม backend สำหรับ Supabase ไว้แล้ว ออกแบบ mobile-first ใช้ชื่อ/แบรนด์ของ BCFACHAT เอง โดยนำรูปแบบการใช้งานแบบปัดการ์ดมาเป็นแรงบันดาลใจ ไม่ได้คัดลอกโลโก้หรือทรัพย์สินทางภาพของ Tinder

## ฟีเจอร์ในโปรเจกต์

- สมัครสมาชิกและเข้าสู่ระบบด้วย username + password; จดจำ username ได้บนอุปกรณ์นี้
- โหมด DEMO ทดลองได้ทันทีโดยไม่ต้องมี Supabase; ข้อมูลเดโมเก็บใน `localStorage` ของเบราว์เซอร์เครื่องนั้น ไม่ได้แชร์กับคนอื่น
- โปรไฟล์: ชื่อภาษาอังกฤษ, อายุ (18+), น้ำหนัก, ส่วนสูง, วันเกิด, สถานะ, BL/HL/GL/NoL/FZ, ความสนใจ 5 หมวด, bio, รูปได้สูงสุด 6 รูป และธีมสี
- ปัดซ้าย/ขวาด้วยนิ้วหรือปุ่ม และตัวกรองสาย/อายุ
- สร้างแมตช์เมื่อทั้งสองคนถูกใจกันผ่าน database function ใน Supabase
- รายการถูกใจ, แมตช์ และแชท
- ข้อความและรูปในแชทบันทึกในฐานข้อมูล / Storage; มี Realtime refresh เมื่อมีข้อความใหม่
- RLS policies จำกัดสิทธิ์ในการอ่าน/ส่งข้อความ และภาพแชทเป็น private bucket
- workflow สำหรับ build และ deploy ไป GitHub Pages

## 1. ทดลองบนเครื่อง

ต้องมี Node.js 20+ (แนะนำ Node 22)

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal แล้วสมัครบัญชีทดลองได้เลย เมื่อไม่ได้ตั้ง `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ระบบจะอยู่ใน DEMO MODE

> DEMO MODE มีไว้ดู flow และ UI เท่านั้น: ข้อมูลไม่ซิงก์ข้ามอุปกรณ์, ไม่ได้เป็นระบบยืนยันตัวตนจริง และไม่ควรใช้เก็บข้อมูลจริงหรือรหัสผ่านจริง

## 2. ตั้งค่า Supabase ให้เก็บข้อมูลจริง

1. สร้างโปรเจกต์ใหม่ใน [Supabase](https://supabase.com/).
2. ไปที่ **SQL Editor** แล้วรันไฟล์ `supabase/schema.sql` ทั้งไฟล์ สคริปต์จะสร้างตาราง, index, RLS policies, RPC สำหรับแมตช์ และ bucket สำหรับภาพให้
3. ไปที่ **Authentication → Providers → Email** แล้วปิดการยืนยันอีเมล (Confirm email) สำหรับการล็อกอินแบบ username อย่างเดียวในต้นแบบนี้ หากเปิดไว้ Auth จะพยายามส่งอีเมลไปยัง alias ซึ่งผู้ใช้ไม่ได้กรอกจริง
4. ตั้งค่า `.env` โดยคัดลอกจาก `.env.example`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
VITE_AUTH_EMAIL_DOMAIN=bcfachat.example
```

ใช้ค่า **Project URL** และ **publishable key / anon key** จากหน้า Project Settings → API Keys (ชื่อส่วน UI อาจต่างกันตามหน้าตา Dashboard) ห้ามใส่ `service_role` / secret key ใน frontend หรือใน GitHub repository

5. รัน `npm run dev` อีกครั้ง แล้วลองสมัครผู้ใช้ 2 บัญชีเพื่อทดสอบการแมตช์และแชท

### หมายเหตุเรื่อง username/password

Supabase Auth ใช้ email/password เป็นวิธี password sign-in ใน SDK ที่โปรเจกต์นี้ใช้ จึง map username เป็น alias ภายในรูปแบบ `username@VITE_AUTH_EMAIL_DOMAIN` โดยไม่ต้องให้ผู้ใช้กรอกอีเมลจริงในหน้าสมัคร ข้อดีคือรหัสผ่านยังถูกจัดการโดย Supabase Auth ไม่ได้เก็บในตารางโปรไฟล์ ข้อจำกัดคือ **ลืมรหัสผ่าน/กู้คืนบัญชีผ่านอีเมลยังไม่รองรับ** จนกว่าจะเพิ่มขั้นตอนยืนยันช่องทางติดต่อหรือระบบกู้บัญชี ฝั่ง production ควรใช้โดเมนที่คุณควบคุมและออกแบบ account recovery อย่างปลอดภัย ไม่ควรใช้ demo alias เป็นระบบยืนยันตัวตนที่สมบูรณ์

## 3. Deploy ผ่าน GitHub Pages

1. สร้าง repository ใหม่บน GitHub แล้วอัปโหลด/commit ไฟล์ทั้งหมดในโปรเจกต์นี้ (ยกเว้น `.env` จริง)
2. ใน Repository → **Settings → Secrets and variables → Actions** สร้าง repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. (ทางเลือก) สร้าง repository variable ชื่อ `VITE_AUTH_EMAIL_DOMAIN` เพื่อกำหนดโดเมน alias เช่น `auth.yourdomain.com`
4. ไปที่ **Settings → Pages** แล้วตั้ง Source เป็น **GitHub Actions**
5. push ไป branch `main` หรือเรียก workflow **Deploy BCFACHAT to GitHub Pages** ด้วยตนเอง

ถ้าไม่ได้กำหนด secrets ตัวเว็บจะ deploy เป็น DEMO MODE เท่านั้น ค่าที่ขึ้นต้น `VITE_` จะถูกรวมอยู่ใน bundle ฝั่ง client; ปลอดภัยได้เพราะ publishable/anon key ใช้ร่วมกับ RLS เท่านั้น ห้ามใส่ secret/service-role key เด็ดขาด

## 4. ข้อมูลและความปลอดภัย

- `profiles`: ข้อมูลโปรไฟล์สำหรับค้นหาสมาชิก โดยไม่เก็บวันเกิดเต็มไว้ในตารางสาธารณะของสมาชิกที่ล็อกอิน
- `profile_private_details`: วันเกิดที่เจ้าของบัญชีอ่านและแก้ไขได้เท่านั้นผ่าน RLS
- `swipes`: หนึ่งแถวต่อทิศทาง/คู่ผู้ใช้
- `record_swipe()`: บันทึก swipe และสร้าง `matches` เฉพาะเมื่อมี like สองทาง
- `matches`: อ่านได้โดยคู่แมตช์เท่านั้น
- `messages`: อ่าน/ส่งได้เฉพาะสมาชิกของ match นั้น; ข้อความเก็บใน Postgres
- `profile-media`: public image bucket สำหรับรูปที่ตั้งใจให้แสดงในโปรไฟล์ (ต้องลงชื่อเข้าใช้เพื่อเรียก metadata)
- `chat-media`: private bucket, path รูปผูกกับ match และ uploader; app ใช้ signed URL ระยะสั้นเพื่อแสดงภาพ

โปรดทดสอบ RLS ใน Supabase ด้วยบัญชีทดสอบสองบัญชีก่อนเปิดใช้งานจริง และปรับนโยบายความเป็นส่วนตัว/รายงาน/บล็อกผู้ใช้/ลบข้อมูลตามความต้องการของบริการ การเตรียมโครงสร้างรองรับสมาชิกหลายร้อยบัญชีไม่ได้รับประกันจำนวนผู้ใช้พร้อมกันโดยอัตโนมัติ: throughput จริงขึ้นกับ Supabase plan, Realtime quota, Storage, network และการตั้งค่า index/monitoring

## 5. Build

```bash
npm run build
npm run preview
```
