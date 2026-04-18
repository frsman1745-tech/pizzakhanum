// scripts/seed.js
// شغّله مرة واحدة لملء قاعدة البيانات بالبيانات الأولية
// node scripts/seed.js

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

/* ── Schema مبسط للسيد ── */
const PizzaSchema = new mongoose.Schema({
  name: String, category: String, description: String, details: String,
  isActive: Boolean, comingSoon: Boolean, imageUrl: String,
  fixedPriceOld: String, fixedPriceNew: String, fixedNumericPrice: Number,
  sliceCount: Number, cols: Number, sortOrder: Number,
  sizes: Array, khanamSizes: Array,
}, { timestamps: true, collection: "pizzas" });

const Pizza = mongoose.models?.Pizza || mongoose.model("Pizza", PizzaSchema);

const SEED_DATA = [
  /* ── العروض المميزة ── */
  {
    name: "بيتزا المتر", category: "featured", sortOrder: 0,
    description: "متر كامل من الشهية المتنوعة لتشاركه مع أحبّك",
    details: "متر كامل من أجود أنواع البيتزا، تختار النكهة لكل شريحة",
    fixedPriceOld: "150,000", fixedPriceNew: "1,500", fixedNumericPrice: 150000,
    sliceCount: 8, cols: 4, isActive: true, comingSoon: false,
  },
  {
    name: "بيتزا 60×40", category: "featured", sortOrder: 1,
    description: "الحجم العائلي المثالي للتجمعات",
    details: "بيتزا مستطيلة بحجم 60×40 سم، كافية للعائلة",
    fixedPriceOld: "140,000", fixedPriceNew: "1,400", fixedNumericPrice: 140000,
    sliceCount: 6, cols: 3, isActive: true, comingSoon: false,
  },
  {
    name: "بيتزا خانم", category: "featured", sortOrder: 2,
    description: "كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك",
    details: "عجينة فريدة على شكل كرات محشية بجبنة الشيدر على الحواف",
    isActive: true, comingSoon: false,
    khanamSizes: [
      { id: "sm", label: "صغيرة", priceOld: "45,000", priceNew: "450", numericPrice: 45000 },
      { id: "lg", label: "كبيرة", priceOld: "60,000", priceNew: "600", numericPrice: 60000 },
    ],
  },

  /* ── قائمة البيتزا ── */
  {
    name: "الفصول الأربعة", category: "menu", sortOrder: 10,
    details: "جبنة القشقوان مع الماشروم والزيتون الأسود والفليفلة الخضراء بالإضافة إلى حبات الطماطم والذرة.",
    isActive: true, comingSoon: false,
    sizes: [
      { id: "sm", label: "صغير", priceOld: "35,000", priceNew: "350", numericPrice: 35000 },
      { id: "md", label: "وسط",  priceOld: "50,000", priceNew: "500", numericPrice: 50000 },
      { id: "lg", label: "كبير", priceOld: "65,000", priceNew: "650", numericPrice: 65000 },
    ],
  },
  {
    name: "مارغريتا", category: "menu", sortOrder: 11,
    details: "جبنة القشقوان مع الصلصة الحمراء.",
    isActive: true, comingSoon: false,
    sizes: [
      { id: "sm", label: "صغير", priceOld: "35,000", priceNew: "350", numericPrice: 35000 },
      { id: "md", label: "وسط",  priceOld: "50,000", priceNew: "500", numericPrice: 50000 },
      { id: "lg", label: "كبير", priceOld: "65,000", priceNew: "650", numericPrice: 65000 },
    ],
  },
  {
    name: "سوبر سوبريم", category: "menu", sortOrder: 14,
    details: "المزيج المشهور والشهي من البيروني مع جبنة القشقوان والماشروم والفلفل الأخضر والزيتون الأسود.",
    isActive: true, comingSoon: false,
    sizes: [
      { id: "sm", label: "صغير", priceOld: "35,000", priceNew: "350", numericPrice: 35000 },
      { id: "md", label: "وسط",  priceOld: "50,000", priceNew: "500", numericPrice: 50000 },
      { id: "lg", label: "كبير", priceOld: "65,000", priceNew: "650", numericPrice: 65000 },
    ],
  },
  // قريباً
  { name: "بيتزا الكريمة", category: "menu", sortOrder: 20, isActive: true, comingSoon: true, details: "", sizes: [] },
  { name: "الثلاثي",       category: "menu", sortOrder: 21, isActive: true, comingSoon: true, details: "", sizes: [] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ متصل بـ MongoDB");

    await Pizza.deleteMany({});
    console.log("🗑  تم مسح البيانات القديمة");

    await Pizza.insertMany(SEED_DATA);
    console.log(`🍕 تم إضافة ${SEED_DATA.length} بيتزا`);

    await mongoose.disconnect();
    console.log("✅ اكتمل السيد بنجاح!");
  } catch (err) {
    console.error("❌ خطأ:", err.message);
    process.exit(1);
  }
}

seed();
