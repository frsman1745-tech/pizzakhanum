# دليل إعداد الأدمن — بيتزا خانم

## الخطوة 1: تثبيت الحزم
```bash
npm install mongoose next-auth
```

---

## الخطوة 2: هيكل الملفات
```
your-project/
├── lib/
│   ├── mongodb.js              ← اتصال قاعدة البيانات
│   └── models/
│       └── Pizza.js            ← الـ Schema
├── pages/
│   ├── index.js                ← الصفحة الرئيسية (محدّثة تجلب من DB)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth].js
│   │   └── pizzas/
│   │       ├── index.js        ← GET all / POST new
│   │       └── [id].js         ← GET / PUT / DELETE / PATCH
│   └── admin/
│       ├── login.js            ← صفحة الدخول
│       ├── index.js            ← الداشبورد
│       └── pizza/
│           └── [id].js         ← تعديل / إضافة بيتزا
└── scripts/
    └── seed.js                 ← ملء DB بالبيانات الأولية
```

---

## الخطوة 3: إعداد MongoDB Atlas (مجاني)

1. افتح https://cloud.mongodb.com
2. أنشئ Cluster مجاني (M0)
3. أضف مستخدم: Database Access → Add New User
4. أضف IP: Network Access → Allow from Anywhere (0.0.0.0/0)
5. احصل على الرابط: Connect → Drivers → انسخ connection string

---

## الخطوة 4: ملف .env.local
```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/pizza-khanum
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=اكتب-مفتاح-عشوائي-طويل
ADMIN_USERNAME=admin
ADMIN_PASSWORD=كلمة-مرور-قوية
```

لتوليد NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## الخطوة 5: ملء DB بالبيانات الأولية
```bash
node scripts/seed.js
```

---

## الخطوة 6: رفع على Vercel

في Vercel Dashboard → Settings → Environment Variables:
أضف نفس متغيرات .env.local بالضبط

لكن NEXTAUTH_URL يكون رابط Vercel:
```
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## كيف يعمل الـ Schema

```
Pizza {
  name          "مارغريتا"
  category      "menu" | "featured"
  details       "جبنة القشقوان مع..."
  isActive      true | false          ← تحكم بالظهور من الداشبورد
  comingSoon    true | false

  // للعروض المميزة (المتر / 60×40)
  fixedPriceOld     "150,000"
  fixedNumericPrice 150000
  sliceCount        8
  cols              4

  // لبيتزا خانم
  khanamSizes   [{ id, label, priceOld, priceNew, numericPrice }]

  // لبيتزا القائمة
  sizes         [{ id, label, priceOld, priceNew, numericPrice }]
}
```

---

## API Routes

| Method | URL                    | الوصف           | من يصل        |
|--------|------------------------|-----------------|---------------|
| GET    | /api/pizzas            | كل البيتزا       | الجميع        |
| POST   | /api/pizzas            | إضافة بيتزا      | أدمن فقط      |
| GET    | /api/pizzas/:id        | بيتزا محددة      | الجميع        |
| PUT    | /api/pizzas/:id        | تعديل كامل       | أدمن فقط      |
| PATCH  | /api/pizzas/:id        | تعديل جزئي       | أدمن فقط      |
| DELETE | /api/pizzas/:id        | حذف              | أدمن فقط      |

---

## صفحات الأدمن

| URL                    | الوصف                        |
|------------------------|------------------------------|
| /admin/login           | تسجيل الدخول                 |
| /admin                 | الداشبورد (كل البيتزا)        |
| /admin/pizza/new       | إضافة بيتزا جديدة            |
| /admin/pizza/:id       | تعديل بيتزا موجودة           |

---

## الفرق في pizza-khanum.jsx

**قبل:** بيانات hardcoded
```js
const FEATURED = [ { id: "meter", label: "بيتزا المتر", ... } ]
```

**بعد:** تجلب من DB
```js
// في getServerSideProps
const featured = await Pizza.find({ category: "featured", isActive: true })
// تمررها كـ props → initialFeatured
```

الخاصية الوحيدة التي تتغير:
- `fp.label`   → `fp.name`
- `fp.priceOld` → `fp.fixedPriceOld`
- `fp.sizes`   → `fp.khanamSizes` (لخانم)
