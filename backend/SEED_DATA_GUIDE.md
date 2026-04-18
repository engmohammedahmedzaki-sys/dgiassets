# 🎯 كيفية إضافة بيانات تجريبية

## الخطوة 1: تأكد من وجود مستخدم

أولاً، سجل حساب واحد على الأقل من خلال:
http://localhost:4200/register

## الخطوة 2: تشغيل SQL Script

### طريقة 1: من pgAdmin أو أي PostgreSQL Client:

1. افتح pgAdmin
2. اتصل بـ database: `marketplace_db`
3. افتح Query Tool
4. انسخ المحتوى من `seed-projects.sql`
5. نفذ الـ Query

### طريقة 2: من Command Line:

```bash
# من مجلد backend
docker exec -i marketplace_postgres psql -U postgres -d marketplace_db < seed-projects.sql
```

### طريقة 3: باستخدام psql مباشرة:

```bash
psql -h localhost -p 5434 -U postgres -d marketplace_db -f seed-projects.sql
# Password: postgres123
```

## الخطوة 3: تحقق من البيانات

افتح:

- http://localhost:3000/projects

يجب أن ترى 8 مشاريع في الـ response

## البيانات التجريبية:

- ✅ 8 مشاريع
- ✅ فئات مختلفة (ecommerce, saas, mobile_app, etc.)
- ✅ أسعار متنوعة ($35K - $120K)
- ✅ Metrics كاملة
- ✅ 2 مشاريع مميزة (featured)

---

## إذا واجهت مشكلة:

### المشكلة: "relation user does not exist"

**الحل:** سجل حساب واحد أولاً من صفحة Register

### المشكلة: "connection refused"

**الحل:**

```bash
# تأكد من Docker يعمل
docker ps

# إذا لم يكن PostgreSQL يعمل
docker-compose up -d
```

### المشكلة: "password authentication failed"

**الحل:** تأكد من استخدام:

- Username: `postgres`
- Password: `postgres123`
- Port: `5434`

---

## الـ APIs المتاحة:

### 1. Get All Projects

```bash
GET http://localhost:3000/projects
```

### 2. Search & Filter

```bash
GET http://localhost:3000/projects?category=ecommerce
GET http://localhost:3000/projects?minPrice=50000&maxPrice=100000
GET http://localhost:3000/projects?search=متجر
```

### 3. Get Single Project

```bash
GET http://localhost:3000/projects/{id}
```

---

**بعد إضافة البيانات، افتح:**
http://localhost:4200/browse

**يجب أن ترى 8 مشاريع! 🎉**
