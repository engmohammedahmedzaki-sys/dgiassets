# 🧪 Testing Instructions - Auth System

## اختبار نظام التسجيل والدخول

### ✅ **التأكد من تشغيل الـ Servers:**

```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run start
```

---

### 📝 **اختبار التسجيل (Register):**

#### **الخطوات:**

1. افتح المتصفح على: `http://localhost:4200/register`

2. املأ النموذج:

   - **الاسم الكامل:** محمد أحمد
   - **البريد الإلكتروني:** test@test.com
   - **رقم الجوال:** +966501234567
   - **كلمة المرور:** 123456
   - **تأكيد كلمة المرور:** 123456
   - **نوع الحساب:** اختر "مشتري"
   - ✅ اضغط على Checkbox "الموافقة على الشروط"

3. اضغط "إنشاء الحساب"

#### **النتيجة المتوقعة:**

- ✅ Alert بعنوان: "تم إنشاء الحساب بنجاح"
- ✅ توجيه تلقائي إلى `/dashboard/buyer`
- ✅ Token محفوظ في LocalStorage

---

### 🔐 **اختبار تسجيل الدخول (Login):**

#### **الخطوات:**

1. افتح المتصفح على: `http://localhost:4200/login`

2. أدخل البيانات التي سجلت بها:

   - **البريد الإلكتروني:** test@test.com
   - **كلمة المرور:** 123456

3. اضغط "تسجيل الدخول"

#### **النتيجة المتوقعة:**

- ✅ توجيه تلقائي إلى `/dashboard/buyer`
- ✅ Token محفوظ في LocalStorage
- ✅ لا يوجد أخطاء

---

### 🔍 **التحقق من Token في LocalStorage:**

1. افتح Developer Tools (F12)
2. اذهب للـ **Application** tab
3. من الـ sidebar اختر **Local Storage** → `http://localhost:4200`
4. يجب أن تشاهد `token` مع قيمة JWT

---

### 🛠️ **اختبار الـ API مباشرة (Postman أو Thunder Client):**

#### **Register:**

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "another@test.com",
  "password": "123456",
  "fullName": "علي محمد",
  "phoneNumber": "+966501111111",
  "role": "seller"
}
```

**النتيجة المتوقعة:**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "another@test.com",
    "fullName": "علي محمد",
    "phoneNumber": "+966501111111",
    "role": "seller",
    "isKycVerified": false,
    "isPhoneVerified": false,
    "createdAt": "2024-12-04T...",
    "updatedAt": "2024-12-04T..."
  },
  "token": "eyJhbG...",
  "message": "تم إنشاء الحساب بنجاح"
}
```

#### **Login:**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "another@test.com",
  "password": "123456"
}
```

**النتيجة المتوقعة:**

```json
{
  "user": {...},
  "token": "eyJhbG...",
  "message": "تم تسجيل الدخول بنجاح"
}
```

---

### ❌ **اختبارات الـ Error Handling:**

#### **1. تسجيل بريد موجود:**

```http
POST http://localhost:3000/auth/register
{
  "email": "test@test.com",  // نفس البريد مرة ثانية
  "password": "123456",
  ...
}
```

**النتيجة:** `401 Unauthorized` - "البريد الإلكتروني مستخدم بالفعل"

#### **2. تسجيل دخول بباسوورد خطأ:**

```http
POST http://localhost:3000/auth/login
{
  "email": "test@test.com",
  "password": "wrongpassword"
}
```

**النتيجة:** `401 Unauthorized` - "البريد الإلكتروني أو كلمة المرور غير صحيحة"

#### **3. تسجيل دخول بمستخدم غير موجود:**

```http
POST http://localhost:3000/auth/login
{
  "email": "notexist@test.com",
  "password": "123456"
}
```

**النتيجة:** `401 Unauthorized` - "البريد الإلكتروني أو كلمة المرور غير صحيحة"

---

### 🗄️ **التحقق من قاعدة البيانات:**

```bash
# الدخول للـ PostgreSQL
docker exec -it <container-name> psql -U postgres -d marketplace

# عرض المستخدمين
SELECT id, email, "fullName", role, "isKycVerified", "createdAt" FROM "user";

# يجب أن تشاهد المستخدمين المسجلين
```

---

### ⚡ **Quick Test Checklist:**

- [ ] Backend يعمل على `http://localhost:3000`
- [ ] Frontend يعمل على `http://localhost:4200`
- [ ] قاعدة البيانات متصلة
- [ ] تسجيل مستخدم جديد يعمل
- [ ] تسجيل الدخول يعمل
- [ ] Token يُحفظ في LocalStorage
- [ ] التوجيه للـ Dashboard يعمل
- [ ] رسائل الخطأ تظهر بالعربي
- [ ] Password يُشفر في قاعدة البيانات (bcrypt)

---

## ⚠️ **Common Issues:**

### **1. CORS Error:**

```
Access to XMLHttpRequest at 'http://localhost:3000/auth/register'
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**الحل:** تأكد من تفعيل CORS في `backend/src/main.ts`

### **2. Database Connection Error:**

```
Could not connect to PostgreSQL
```

**الحل:** تأكد من تشغيل Docker container:

```bash
docker-compose up -d
```

### **3. Module Not Found (bcrypt):**

```bash
cd backend
npm install bcrypt @types/bcrypt
```

---

**جاهز للاختبار!** 🎯
