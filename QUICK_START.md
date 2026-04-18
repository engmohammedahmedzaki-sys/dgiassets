# 🚀 Quick Start Guide - منصة المشاريع

## 📋 **متطلبات التشغيل:**

- ✅ Node.js (v18+)
- ✅ npm
- ✅ Docker Desktop (running)
- ✅ PostgreSQL (via Docker)

---

## ⚡ **تشغيل المشروع:**

### **1. تشغيل قاعدة البيانات:**

```bash
# من المجلد الرئيسي
docker-compose up -d
```

✅ **التحقق:** PostgreSQL يعمل على port `5434`

---

### **2. تشغيل Backend:**

```bash
cd backend
npm run start:dev
```

✅ **التحقق:**

- Server: `http://localhost:3000`
- Swagger API Docs (قريباً): `http://localhost:3000/api`

---

### **3. تشغيل Frontend:**

```bash
cd frontend
npm run start
```

✅ **التحقق:** Application: `http://localhost:4200`

---

## 🎯 **الصفحات المتاحة:**

| الصفحة                | الرابط                                 | الحالة    |
| --------------------- | -------------------------------------- | --------- |
| **الرئيسية**          | http://localhost:4200/                 | ✅ كاملة  |
| **تسجيل الدخول**      | http://localhost:4200/login            | ✅ تعمل   |
| **إنشاء حساب**        | http://localhost:4200/register         | ✅ تعمل   |
| **Dashboard - مشتري** | http://localhost:4200/dashboard/buyer  | ✅ كامل   |
| **Dashboard - بائع**  | http://localhost:4200/dashboard/seller | ✅ كامل   |
| **تصفح المشاريع**     | http://localhost:4200/browse           | ⏳ قريباً |
| **بيع مشروع**         | http://localhost:4200/sell             | ⏳ قريباً |

---

## 🧪 **اختبار المصادقة:**

### **إنشاء حساب جديد:**

1. افتح: http://localhost:4200/register
2. املأ البيانات:
   - الاسم الكامل
   - البريد الإلكتروني
   - رقم الجوال (اختر الدولة أولاً)
   - رقم واتساب (اختياري)
   - كلمة المرور (6 أحرف على الأقل)
   - نوع الحساب (مشتري أو بائع)
   - ✅ وافق على الشروط
3. اضغط "إنشاء الحساب"
4. ستنتقل تلقائياً للـ Dashboard

### **تسجيل الدخول:**

1. افتح: http://localhost:4200/login
2. أدخل:
   - البريد الإلكتروني
   - كلمة المرور
3. اضغط "تسجيل الدخول"
4. ستنتقل للـ Dashboard

---

## 🔍 **اختبار الـ APIs مباشرة:**

### **1. Register API:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "fullName": "Test User",
    "phoneNumber": "+966501234567",
    "whatsappNumber": "+966501234567",
    "role": "buyer"
  }'
```

### **2. Login API:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Response:**

```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "buyer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "تم تسجيل الدخول بنجاح"
}
```

---

## 🎨 **المميزات المتاحة:**

### **الصفحة الرئيسية:**

- ✅ Hero Section مع animations خرافية
- ✅ Live Ticker للمبيعات
- ✅ مشاريع مميزة (4)
- ✅ Categories (6)
- ✅ Recent Sales (4)
- ✅ Features (6)
- ✅ How it Works (5 steps)
- ✅ Testimonials (3)
- ✅ CTA Section

### **صفحات Auth:**

- ✅ تسجيل بالبريد
- ✅ زر Google (UI فقط)
- ✅ Country code selector
- ✅ WhatsApp field
- ✅ Password strength
- ✅ Form validation

### **Dashboard - Buyer:**

- ✅ 4 Stats cards
- ✅ Recent activity feed
- ✅ Watchlist (3 projects)
- ✅ Navigation menu

### **Dashboard - Seller:**

- ✅ 4 Stats cards
- ✅ Listings table
- ✅ Pending offers (3)
- ✅ Action buttons

### **Mobile:**

- ✅ Responsive design
- ✅ Mobile menu
- ✅ Touch-friendly

---

## 🐛 **استكشاف الأخطاء:**

### **المشكلة: Backend لا يعمل**

**الحل:**

```bash
# تحقق من PostgreSQL
docker ps

# إذا لم يكن يعمل
docker-compose up -d

# أعد تشغيل Backend
cd backend
npm run start:dev
```

### **المشكلة: Frontend لا يفتح**

**الحل:**

```bash
# أعد تثبيت المكتبات
cd frontend
npm install

# أعد التشغيل
npm run start
```

### **المشكلة: خطأ في التسجيل**

**تحقق من:**

1. ✅ Backend يعمل على port 3000
2. ✅ Database متصل
3. ✅ CORS مفعل
4. ✅ Console للأخطاء

---

## 📱 **اختبار Mobile:**

1. افتح Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. اختر iPhone/iPad
4. جرب:
   - Mobile menu (☰)
   - Forms
   - Dashboard
   - Navigation

---

## 🔐 **بيانات الاختبار:**

### **Database:**

- Host: `localhost`
- Port: `5434`
- Database: `marketplace_db`
- User: `postgres`
- Password: `postgres123`

### **JWT Secret:**

- Secret: `super-secret-jwt-key-2024`
- Expires: `7d`

---

## 📊 **Console Logs مفيدة:**

افتح Console في المتصفح (F12) وتحقق من:

```javascript
// عند Register
"Registration successful: { user: {...}, token: '...' }";

// عند Login
"Login successful: { user: {...}, token: '...' }";

// عند Error
"Registration error: { message: '...' }";
```

---

## 🎯 **Next Steps:**

1. ✅ جرب التسجيل
2. ✅ جرب تسجيل الدخول
3. ✅ شوف الـ Dashboard
4. ✅ جرب Mobile menu
5. ⏳ انتظر صفحة Browse Projects

---

## 💡 **نصائح:**

1. **استخدم بيانات حقيقية** عند التسجيل للاختبار
2. **افتح Console** دائماً لرؤية الأخطاء
3. **جرب Mobile view** لاختبار Responsive
4. **تحقق من Network tab** لرؤية الـ API calls

---

## 📞 **الدعم:**

إذا واجهت مشكلة:

1. تحقق من CURRENT_PROGRESS.md
2. راجع AUTH_DOCUMENTATION.md
3. شوف TESTING_AUTH.md

---

**كل شيء جاهز! ابدأ التجربة الآن! 🚀**

---

**روابط سريعة:**

- 🏠 Home: http://localhost:4200/
- 🔐 Login: http://localhost:4200/login
- ✍️ Register: http://localhost:4200/register
- 📊 Dashboard: http://localhost:4200/dashboard/buyer

**استمتع! 🎉**
