// src/constants/defaults.js
// All default data and static constants extracted from App.jsx.
// These are only used as fallbacks when the API returns empty data.

export const DEFAULT_FEATURED = [
  {
    id: "meter",
    label: "بيتزا المتر",
    priceOld: "150,000",
    priceNew: "1,500",
    numericPrice: 150000,
    sliceCount: 8,
    cols: 4,
    desc: "متر كامل من الشهية المتنوعة",
    imageUrl: "",
    flavorImageUrl: "",
    extras: [],
  },
  {
    id: "sixtyforty",
    label: "بيتزا 60×40",
    priceOld: "140,000",
    priceNew: "1,400",
    numericPrice: 140000,
    sliceCount: 6,
    cols: 3,
    desc: "الحجم العائلي المثالي",
    imageUrl: "",
    flavorImageUrl: "",
    extras: [],
  },
  {
    id: "khanum",
    label: "بيتزا خانم",
    priceOld: null,
    priceNew: null,
    desc: "كرات العجين محشية بجبنة الشيدر على الأطراف ✨",
    sizes: [
      { id: "sm", label: "صغيرة", priceOld: "45,000", priceNew: "450", numericPrice: 45000 },
      { id: "lg", label: "كبيرة", priceOld: "60,000", priceNew: "600", numericPrice: 60000 },
    ],
    imageUrl: "",
    flavorImageUrl: "",
    extras: [],
  },
];

export const DEFAULT_MENU = [
  { id: "margarita",  label: "مارغريتا",        details: "جبنة القشقوان مع الصلصة الحمراء.", comingSoon: false, imageUrl: "", flavorImageUrl: "", sizes: [], extras: [], menuSection: "" },
  { id: "hawaii",     label: "هاواي",           details: "جبنة القشقوان مع الأناناس.",       comingSoon: false, imageUrl: "", flavorImageUrl: "", sizes: [], extras: [], menuSection: "" },
  { id: "peperoni",   label: "ببروني",          details: "جبنة القشقوان مع شرائح البيروني.", comingSoon: false, imageUrl: "", flavorImageUrl: "", sizes: [], extras: [], menuSection: "" },
  { id: "chickenbbq", label: "تشيكن باربيكيو", details: "دجاج بصوص الباربيكيو وبصل.",       comingSoon: false, imageUrl: "", flavorImageUrl: "", sizes: [], extras: [], menuSection: "" },
  { id: "cs1",        label: "بيتزا الكريمة",  details: "",                                   comingSoon: true,  imageUrl: "", flavorImageUrl: "", sizes: [], extras: [], menuSection: "" },
];

export const DEFAULT_SIZES = [
  { id: "sm", label: "صغير", priceOld: "35,000", priceNew: "350", numericPrice: 35000 },
  { id: "md", label: "وسط",  priceOld: "50,000", priceNew: "500", numericPrice: 50000 },
  { id: "lg", label: "كبير", priceOld: "65,000", priceNew: "650", numericPrice: 65000 },
];

export const DEFAULT_SECTIONS = [
  { id: "pizza",  label: "بيتزا",    emoji: "🍕", sortOrder: 0 },
  { id: "drinks", label: "مشروبات", emoji: "🥤", sortOrder: 1 },
];

/** Branch location for Hama, Syria */
export const BRANCH = {
  lat: 35.1318,
  lng: 36.7580,
  name: "بيتزا خانم — حماة",
  googleMaps: "https://maps.app.goo.gl/P5b4Ba5nxhZJQv967?g_st=ic",
};

/** Background floating emoji decorations for landing screen */
export const FLOATERS = [
  { e: "🍕", l: "6%",  t: "18%", d: 7,   dl: 0   },
  { e: "🌶️", l: "14%", t: "72%", d: 9,   dl: 1   },
  { e: "🧀", l: "82%", t: "14%", d: 8,   dl: 2   },
  { e: "🍅", l: "88%", t: "65%", d: 6,   dl: .5  },
  { e: "🫒", l: "50%", t: "88%", d: 10,  dl: 3   },
  { e: "🥓", l: "72%", t: "42%", d: 7.5, dl: 1.5 },
];
