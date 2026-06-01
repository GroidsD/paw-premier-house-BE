"use strict";

// ============================================================
// SEEDER #9 — Bookings & Orders (March – June 2026)
// Covers: pets, bookings, bookingItems, orders, orderItems,
//         revenue_transactions
// Users  : staff / manager / admin / duy
// ============================================================

// ── helpers ──────────────────────────────────────────────────
const CHARS    = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rand     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick     = (arr)      => arr[Math.floor(Math.random() * arr.length)];
const randDate = (a, b)     => new Date(a.getTime() + Math.random() * (b.getTime() - a.getTime()));
const addH     = (d, h)     => new Date(d.getTime() + h * 3600000);
const addD     = (d, days)  => new Date(d.getTime() + days * 86400000);
const ymd      = (d)        => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
const rndStr   = (n=6)      => Array.from({length:n},()=>CHARS[Math.floor(Math.random()*CHARS.length)]).join("");

const START = new Date("2026-03-01T00:00:00Z");
const END   = new Date("2026-06-30T23:59:59Z");

// ── users ─────────────────────────────────────────────────────
const STAFF_ID    = "1r5vRBf0xMfeDWu4TIKSMfhEJD43"; // staff
const MANAGER_ID  = "hARAG6MCfAbDPHRISaCXx2IM0sa2"; // manager
const ADMIN_ID    = "VnWvx8YUM2Z4WbMJYgaDqbw64cQ2"; // admin
const DUY_ID      = "YouTcECtDDhN6jk5a9vGIWJ4K8m1"; // duy (customer)

const CUSTOMER_IDS = [DUY_ID, MANAGER_ID, ADMIN_ID];
const STAFF_IDS    = [STAFF_ID, MANAGER_ID];

// ── services (from seeder #2) ─────────────────────────────────
const SERVICES = [
    { service_id:1,  price:120000, name:"Basic Pet Bath"             },
    { service_id:2,  price:250000, name:"Full Grooming Package"       },
    { service_id:3,  price:80000,  name:"Nail Clipping Service"       },
    { service_id:4,  price:180000, name:"Pet Massage Therapy"         },
    { service_id:5,  price:220000, name:"Aromatherapy Spa"            },
    { service_id:6,  price:140000, name:"Fur Brushing & Detangling"   },
    { service_id:7,  price:210000, name:"De-shedding Treatment"       },
    { service_id:8,  price:100000, name:"Paw Care Treatment"          },
    { service_id:9,  price:90000,  name:"Ear Cleaning & Hygiene"      },
    { service_id:10, price:320000, name:"Premium Spa Package"         },
    { service_id:11, price:250000, name:"Standard Pet Hotel Room"     },
    { service_id:12, price:320000, name:"Deluxe Pet Hotel Room"       },
    { service_id:13, price:450000, name:"VIP Pet Suite"               },
    { service_id:14, price:280000, name:"Overnight Boarding Care"     },
    { service_id:15, price:600000, name:"Weekend Pet Stay"            },
    { service_id:16, price:300000, name:"Luxury Cat Hotel Room"       },
    { service_id:17, price:350000, name:"Luxury Dog Boarding"         },
    { service_id:18, price:500000, name:"Family Multi-Pet Room"       },
    { service_id:19, price:220000, name:"Daycare Hotel Package"       },
    { service_id:20, price:400000, name:"Premium Recovery Stay"       },
];
const svcById = (id) => SERVICES.find(s => s.service_id === id);

// ── products / variants (from seeder #1) ─────────────────────
const PRODUCTS = [
    { product_id:2,  productVariant_id:null, product_name:"Premium Beef Dog Pate",        variant_label:null,                  sku:null,                    original_price:35000,  discount:10,    discount_type:"percent", price:31500  },
    { product_id:3,  productVariant_id:null, product_name:"Dental Bone Chew",             variant_label:null,                  sku:null,                    original_price:45000,  discount:5000,  discount_type:"fixed",   price:40000  },
    { product_id:6,  productVariant_id:null, product_name:"Salmon Delight Cat Pate",      variant_label:null,                  sku:null,                    original_price:32000,  discount:0,     discount_type:"percent", price:32000  },
    { product_id:7,  productVariant_id:null, product_name:"Tuna Cat Snack",               variant_label:null,                  sku:null,                    original_price:28000,  discount:5,     discount_type:"percent", price:26600  },
    { product_id:8,  productVariant_id:null, product_name:"Kitten Nutritional Milk",      variant_label:null,                  sku:null,                    original_price:95000,  discount:10000, discount_type:"fixed",   price:85000  },
    { product_id:10, productVariant_id:null, product_name:"Reflective Leash",             variant_label:null,                  sku:null,                    original_price:89000,  discount:0,     discount_type:"percent", price:89000  },
    { product_id:12, productVariant_id:null, product_name:"Non-Slip Stainless Steel Bowl",variant_label:null,                  sku:null,                    original_price:65000,  discount:0,     discount_type:"percent", price:65000  },
    { product_id:13, productVariant_id:null, product_name:"Bouncy Rubber Ball",           variant_label:null,                  sku:null,                    original_price:29000,  discount:0,     discount_type:"percent", price:29000  },
    { product_id:14, productVariant_id:null, product_name:"Plush Mouse Toy",              variant_label:null,                  sku:null,                    original_price:25000,  discount:0,     discount_type:"percent", price:25000  },
    { product_id:15, productVariant_id:null, product_name:"Rope Tug Toy",                variant_label:null,                  sku:null,                    original_price:39000,  discount:5000,  discount_type:"fixed",   price:34000  },
    { product_id:16, productVariant_id:null, product_name:"Feather Wand Cat Toy",         variant_label:null,                  sku:null,                    original_price:42000,  discount:0,     discount_type:"percent", price:42000  },
    { product_id:18, productVariant_id:null, product_name:"Deodorizing Pet Shampoo",      variant_label:null,                  sku:null,                    original_price:115000, discount:15000, discount_type:"fixed",   price:100000 },
    { product_id:19, productVariant_id:null, product_name:"Pet Cleaning Wipes",           variant_label:null,                  sku:null,                    original_price:48000,  discount:0,     discount_type:"percent", price:48000  },
    { product_id:20, productVariant_id:null, product_name:"Double-Sided Grooming Brush",  variant_label:null,                  sku:null,                    original_price:78000,  discount:10,    discount_type:"percent", price:70200  },
    { product_id:1,  productVariant_id:1,  product_name:"Puppy Care Nutritional Kibble",  variant_label:"500g / Small Breed",  sku:"PUPPY-500G-SMALL",      original_price:85000,  discount:5,     discount_type:"percent", price:80750  },
    { product_id:1,  productVariant_id:2,  product_name:"Puppy Care Nutritional Kibble",  variant_label:"2kg / Medium Breed",  sku:"PUPPY-2KG-MEDIUM",      original_price:250000, discount:10,    discount_type:"percent", price:225000 },
    { product_id:1,  productVariant_id:3,  product_name:"Puppy Care Nutritional Kibble",  variant_label:"5kg / Large Breed",   sku:"PUPPY-5KG-LARGE",       original_price:520000, discount:50000, discount_type:"fixed",   price:470000 },
    { product_id:4,  productVariant_id:4,  product_name:"Chicken Dog Treats",             variant_label:"100g / Mini Pack",    sku:"DOGTREAT-100G-MINI",    original_price:30000,  discount:0,     discount_type:"fixed",   price:30000  },
    { product_id:4,  productVariant_id:5,  product_name:"Chicken Dog Treats",             variant_label:"300g / Standard Pack",sku:"DOGTREAT-300G-STANDARD", original_price:75000, discount:5000,  discount_type:"fixed",   price:70000  },
    { product_id:5,  productVariant_id:7,  product_name:"Adult Tuna Mix Cat Kibble",      variant_label:"400g / Small Cat",    sku:"CATFOOD-400G-KITTEN",   original_price:79000,  discount:0,     discount_type:"fixed",   price:79000  },
    { product_id:5,  productVariant_id:8,  product_name:"Adult Tuna Mix Cat Kibble",      variant_label:"1.5kg / Adult Cat",   sku:"CATFOOD-1P5KG-ADULT",   original_price:210000, discount:10,    discount_type:"percent", price:189000 },
    { product_id:9,  productVariant_id:10, product_name:"Premium Leather Pet Collar",     variant_label:"Red / Size S",        sku:"COLLAR-RED-S",          original_price:69000,  discount:0,     discount_type:"fixed",   price:69000  },
    { product_id:9,  productVariant_id:13, product_name:"Premium Leather Pet Collar",     variant_label:"Red / Size M",        sku:"COLLAR-RED-M",          original_price:79000,  discount:5000,  discount_type:"fixed",   price:74000  },
    { product_id:11, productVariant_id:19, product_name:"Winter Pet Jacket",              variant_label:"Yellow / Size S",     sku:"JACKET-YELLOW-S",       original_price:110000, discount:5000,  discount_type:"fixed",   price:105000 },
];

// ── pets ──────────────────────────────────────────────────────
// Pets 1-5 đã được seed từ trước (Bông, Mochi, Max, Luna, Rocky)
// Chỉ seed thêm 2 pets mới (Choco, Lily) — không hardcode pet_id
const NEW_PET_ROWS = [
    { owner_id:DUY_ID,   name:"Choco", species:"dog", breed:"Chihuahua", gender:"male",   weight:2.1, age:1 },
    { owner_id:ADMIN_ID, name:"Lily",  species:"cat", breed:"Persian",   gender:"female", weight:4.8, age:2 },
];
// petsByOwner will be built dynamically after fetching real pet IDs
// (existing: Bông=1, Mochi=2, Max=3, Luna=4, Rocky=5; new: Choco=?, Lily=?)

// ── address pool ──────────────────────────────────────────────
const ADDRESSES = [
    { receiver_name:"Duy Nguyễn",   receiver_phone:"0901234567", receiver_province:"TP. Hồ Chí Minh", receiver_district:"Quận 1",              receiver_address:"123 Nguyễn Trãi, P.2"                 },
    { receiver_name:"Thiên Sơn",    receiver_phone:"0912345678", receiver_province:"TP. Hồ Chí Minh", receiver_district:"Quận Bình Thạnh",     receiver_address:"45 Xô Viết Nghệ Tĩnh, P.25"           },
    { receiver_name:"Admin Paw",    receiver_phone:"0987654321", receiver_province:"TP. Hồ Chí Minh", receiver_district:"Quận 7",              receiver_address:"88 Nguyễn Lương Bằng, P.Tân Phú"       },
    { receiver_name:"Duy Nguyễn",   receiver_phone:"0901234567", receiver_province:"Bình Dương",       receiver_district:"TP. Thủ Dầu Một",     receiver_address:"10 Đại lộ Bình Dương"                  },
    { receiver_name:"Thiên Sơn",    receiver_phone:"0912345678", receiver_province:"Đồng Nai",         receiver_district:"TP. Biên Hòa",        receiver_address:"99 Đồng Khởi, P.Tân Hiệp"             },
    { receiver_name:"Minh Châu",    receiver_phone:"0978563412", receiver_province:"TP. Hồ Chí Minh", receiver_district:"Quận 3",              receiver_address:"22 Võ Văn Tần, P.6"                    },
    { receiver_name:"Thu Hà",       receiver_phone:"0965412378", receiver_province:"Hà Nội",           receiver_district:"Quận Hoàn Kiếm",      receiver_address:"5 Hàng Bài, P.Tràng Tiền"             },
];

// ── static booking scenarios (70 bookings) ───────────────────
// Format: [customer_id, pet_id, service_ids[], status, voucher_id|null, has_note, days_before_booking_created]
const BOOKING_SCENARIOS = [
    // ─ March 2026 ─
    [DUY_ID,     1, [1,3],    "completed", null, true,  3],
    [DUY_ID,     2, [9],      "completed", null, false, 2],
    [DUY_ID,     1, [2],      "completed", 3,    true,  5],
    [MANAGER_ID, 3, [11],     "completed", null, false, 1],
    [MANAGER_ID, 4, [16],     "completed", 4,    true,  3],
    [ADMIN_ID,   5, [17],     "completed", null, false, 2],
    [DUY_ID,     6, [8],      "completed", null, false, 1],
    [DUY_ID,     1, [10],     "completed", 3,    true,  4],
    [MANAGER_ID, 3, [12],     "completed", null, false, 2],
    [ADMIN_ID,   7, [16],     "completed", 4,    false, 3],
    // ─ March (continued) ─
    [DUY_ID,     2, [5,4],    "completed", null, true,  2],
    [DUY_ID,     1, [7],      "cancelled", null, false, 1],
    [MANAGER_ID, 3, [13],     "completed", null, false, 3],
    [DUY_ID,     6, [1,2],    "completed", 8,    true,  2],
    [ADMIN_ID,   5, [14],     "cancelled", null, true,  2],
    [DUY_ID,     1, [3,9],    "completed", null, false, 1],
    [MANAGER_ID, 4, [19],     "completed", 9,    false, 2],
    [ADMIN_ID,   7, [16,5],   "completed", null, true,  3],
    [DUY_ID,     2, [6],      "completed", null, false, 1],
    [DUY_ID,     1, [15],     "cancelled", 4,    false, 4],
    // ─ April 2026 ─
    [DUY_ID,     1, [1],      "completed", null, false, 2],
    [DUY_ID,     2, [9,8],    "completed", null, true,  1],
    [MANAGER_ID, 3, [17],     "completed", null, false, 3],
    [MANAGER_ID, 4, [16],     "completed", 9,    false, 2],
    [ADMIN_ID,   5, [13],     "completed", null, true,  1],
    [DUY_ID,     6, [4,5],    "completed", 8,    false, 2],
    [DUY_ID,     1, [2,6],    "cancelled", null, true,  3],
    [ADMIN_ID,   7, [19],     "completed", null, false, 1],
    [DUY_ID,     2, [10],     "completed", 3,    true,  2],
    [MANAGER_ID, 3, [12,11],  "completed", null, false, 2],
    // ─ April (continued) ─
    [DUY_ID,     1, [7,3],    "confirmed", null, false, 1],
    [MANAGER_ID, 4, [20],     "confirmed", null, true,  2],
    [ADMIN_ID,   5, [18],     "assigned",  null, false, 1],
    [DUY_ID,     6, [1],      "completed", null, false, 2],
    [DUY_ID,     2, [16],     "cancelled", 4,    true,  1],
    [MANAGER_ID, 3, [14],     "completed", null, false, 3],
    [ADMIN_ID,   7, [5],      "completed", 3,    false, 2],
    [DUY_ID,     1, [6,7],    "completed", null, true,  1],
    [DUY_ID,     6, [3],      "completed", null, false, 2],
    [MANAGER_ID, 4, [11,12],  "completed", 8,    false, 3],
    // ─ May 2026 ─
    [DUY_ID,     1, [2],      "completed", null, false, 1],
    [DUY_ID,     2, [9],      "completed", null, true,  2],
    [MANAGER_ID, 3, [13],     "completed", null, false, 1],
    [ADMIN_ID,   5, [17],     "completed", 9,    true,  3],
    [DUY_ID,     6, [1,3],    "cancelled", null, false, 1],
    [DUY_ID,     1, [10,5],   "completed", 3,    true,  2],
    [MANAGER_ID, 3, [15],     "completed", null, false, 4],
    [ADMIN_ID,   7, [16,19],  "completed", 4,    false, 2],
    [DUY_ID,     2, [6],      "pending",   null, false, 0],
    [DUY_ID,     1, [4],      "pending",   null, true,  0],
    // ─ May (continued) ─
    [MANAGER_ID, 4, [12],     "completed", null, false, 2],
    [ADMIN_ID,   5, [20],     "completed", null, true,  3],
    [DUY_ID,     6, [8,9],    "confirmed", null, false, 1],
    [DUY_ID,     2, [2,3],    "assigned",  8,    true,  1],
    [MANAGER_ID, 3, [11],     "completed", null, false, 2],
    [ADMIN_ID,   7, [5,6],    "completed", 9,    false, 1],
    [DUY_ID,     1, [7],      "cancelled", null, true,  2],
    [DUY_ID,     6, [1,2,3],  "completed", 3,    false, 3],
    [MANAGER_ID, 4, [17,16],  "completed", null, true,  2],
    [ADMIN_ID,   5, [14],     "completed", 4,    false, 1],
    // ─ June 2026 ─
    [DUY_ID,     1, [1],      "pending",   null, false, 0],
    [DUY_ID,     2, [16],     "pending",   null, true,  0],
    [MANAGER_ID, 3, [13],     "confirmed", null, false, 1],
    [ADMIN_ID,   5, [20],     "confirmed", null, true,  1],
    [DUY_ID,     6, [3,9],    "assigned",  null, false, 1],
    [DUY_ID,     1, [10],     "completed", 8,    true,  3],
    [MANAGER_ID, 4, [12,11],  "completed", null, false, 2],
    [ADMIN_ID,   7, [19],     "completed", null, false, 2],
    [DUY_ID,     2, [5],      "cancelled", 9,    true,  1],
    [DUY_ID,     6, [4,6],    "completed", null, false, 2],
];

// Month ranges (UTC)
const MONTH_RANGES = [
    [new Date("2026-03-01T00:00:00Z"), new Date("2026-03-31T23:59:59Z")],
    [new Date("2026-04-01T00:00:00Z"), new Date("2026-04-30T23:59:59Z")],
    [new Date("2026-05-01T00:00:00Z"), new Date("2026-05-31T23:59:59Z")],
    [new Date("2026-06-01T00:00:00Z"), new Date("2026-06-30T23:59:59Z")],
];

// ── static order scenarios (60 orders) ───────────────────────
// Format: [customer_id, addr_idx, product_indices[], qty[], status, payment_method, payment_status, voucher_code|null, shipping_fee]
const ORDER_SCENARIOS = [
    // ─ March ─
    [DUY_ID,     0, [0,1],    [2,1], "completed", "COD",   "paid",    null,      20000],
    [DUY_ID,     0, [4,7],    [1,3], "completed", "BANK",  "paid",    "SAVE50K", 0    ],
    [MANAGER_ID, 1, [2],      [2],   "completed", "COD",   "paid",    null,      15000],
    [ADMIN_ID,   2, [5,6],    [1,2], "completed", "CARD",  "paid",    null,      20000],
    [DUY_ID,     0, [10,11],  [1,1], "completed", "WALLET","paid",    "SHOP5",   15000],
    [DUY_ID,     3, [14,15],  [1,2], "completed", "COD",   "paid",    null,      30000],
    [MANAGER_ID, 1, [3],      [4],   "cancelled", "COD",   "unpaid",  null,      15000],
    [ADMIN_ID,   2, [8,9],    [1,1], "completed", "BANK",  "paid",    null,      0    ],
    [DUY_ID,     0, [16],     [1],   "completed", "COD",   "paid",    null,      20000],
    [DUY_ID,     0, [1,2,3],  [1,1,1],"completed","WALLET","paid",   "FREEDAY", 15000],
    // ─ March (continued) ─
    [MANAGER_ID, 4, [7],      [2],   "completed", "BANK",  "paid",    null,      0    ],
    [ADMIN_ID,   2, [12,13],  [1,2], "cancelled", "COD",   "unpaid",  null,      20000],
    [DUY_ID,     0, [20,21],  [1,1], "completed", "CARD",  "paid",    "SAVE50K", 0    ],
    [DUY_ID,     3, [4],      [3],   "completed", "COD",   "paid",    null,      15000],
    [MANAGER_ID, 1, [6,7,8],  [1,1,1],"completed","WALLET","paid",   null,      20000],
    // ─ April ─
    [DUY_ID,     0, [0],      [1],   "completed", "COD",   "paid",    null,      15000],
    [DUY_ID,     0, [5,9],    [2,1], "completed", "BANK",  "paid",    "SHOP5",   0    ],
    [MANAGER_ID, 1, [11],     [2],   "completed", "COD",   "paid",    null,      20000],
    [ADMIN_ID,   2, [14,15],  [1,1], "cancelled", "CARD",  "failed",  null,      30000],
    [DUY_ID,     0, [2,3],    [2,2], "completed", "COD",   "paid",    null,      15000],
    [DUY_ID,     3, [17,18],  [1,1], "completed", "WALLET","paid",   "FREEDAY", 0    ],
    [MANAGER_ID, 4, [1],      [3],   "completed", "BANK",  "paid",    null,      15000],
    [ADMIN_ID,   2, [6,10],   [1,2], "completed", "COD",   "paid",    null,      20000],
    [DUY_ID,     0, [22],     [1],   "shipping",  "COD",   "unpaid",  null,      30000],
    [DUY_ID,     0, [4,7,10], [1,2,1],"completed","CARD",  "paid",   null,      20000],
    // ─ April (continued) ─
    [MANAGER_ID, 1, [8,9],    [1,1], "completed", "WALLET","paid",   "SAVE50K", 0    ],
    [ADMIN_ID,   2, [13],     [2],   "pending",   "BANK",  "unpaid",  null,      15000],
    [DUY_ID,     0, [16,19],  [1,2], "completed", "COD",   "paid",    null,      20000],
    [DUY_ID,     3, [20],     [1],   "confirmed", "BANK",  "unpaid",  null,      0    ],
    [MANAGER_ID, 4, [0,1,2],  [1,1,2],"completed","COD",   "paid",   null,      15000],
    // ─ May ─
    [DUY_ID,     0, [5],      [2],   "completed", "COD",   "paid",    null,      20000],
    [DUY_ID,     0, [11,12],  [1,1], "completed", "BANK",  "paid",    "SHOP5",   15000],
    [MANAGER_ID, 1, [3,4],    [2,1], "completed", "WALLET","paid",   null,      0    ],
    [ADMIN_ID,   2, [6],      [3],   "cancelled", "COD",   "refunded",null,      20000],
    [DUY_ID,     0, [14,15],  [1,1], "completed", "CARD",  "paid",    "FREEDAY", 30000],
    [DUY_ID,     3, [7,8],    [2,2], "completed", "COD",   "paid",    null,      15000],
    [MANAGER_ID, 1, [17,18],  [1,1], "shipping",  "BANK",  "paid",    null,      0    ],
    [ADMIN_ID,   2, [20,21],  [1,1], "completed", "COD",   "paid",    null,      20000],
    [DUY_ID,     0, [9,10],   [1,2], "completed", "WALLET","paid",   "SAVE50K", 0    ],
    [DUY_ID,     0, [1],      [4],   "cancelled", "COD",   "unpaid",  null,      15000],
    // ─ May (continued) ─
    [MANAGER_ID, 4, [22,23],  [1,2], "completed", "BANK",  "paid",    null,      20000],
    [ADMIN_ID,   2, [0,2],    [1,1], "completed", "COD",   "paid",    null,      15000],
    [DUY_ID,     0, [13],     [1],   "pending",   "BANK",  "unpaid",  null,      20000],
    [DUY_ID,     3, [5,6,7],  [1,1,1],"completed","CARD",  "paid",   "SHOP5",   30000],
    [MANAGER_ID, 1, [11],     [2],   "completed", "COD",   "paid",    null,      0    ],
    // ─ June ─
    [DUY_ID,     0, [0],      [1],   "pending",   "COD",   "unpaid",  null,      15000],
    [DUY_ID,     0, [4,5],    [1,2], "confirmed", "BANK",  "unpaid",  null,      0    ],
    [MANAGER_ID, 1, [8],      [3],   "confirmed", "WALLET","unpaid",  null,      20000],
    [ADMIN_ID,   2, [14],     [1],   "shipping",  "COD",   "unpaid",  null,      30000],
    [DUY_ID,     0, [1,2],    [2,1], "completed", "BANK",  "paid",    "SAVE50K", 0    ],
    [DUY_ID,     3, [7,10],   [1,1], "completed", "COD",   "paid",    null,      20000],
    [MANAGER_ID, 4, [15,16],  [1,1], "completed", "CARD",  "paid",    null,      15000],
    [ADMIN_ID,   2, [3],      [2],   "completed", "WALLET","paid",   "FREEDAY", 0    ],
    [DUY_ID,     0, [9,11],   [1,2], "cancelled", "BANK",  "refunded",null,      20000],
    [DUY_ID,     0, [22,23],  [1,1], "completed", "COD",   "paid",    "SHOP5",   15000],
    [MANAGER_ID, 1, [18,19],  [2,1], "expired",   "BANK",  "expired", null,      0    ],
    [ADMIN_ID,   2, [6],      [1],   "expired",   "CARD",  "failed",  null,      20000],
    [DUY_ID,     3, [0,4,8],  [1,2,1],"completed","WALLET","paid",   null,      30000],
    [DUY_ID,     0, [12],     [3],   "pending",   "COD",   "unpaid",  null,      15000],
    [MANAGER_ID, 4, [21],     [1],   "completed", "BANK",  "paid",    null,      0    ],
];

const BOOKING_NOTES_POOL = [
    "Thú cưng sợ nước, cần nhẹ nhàng.",
    "Không cắt móng quá ngắn.",
    "Thú cưng dị ứng với một số loại dầu.",
    "Vui lòng liên hệ 30 phút trước khi đến.",
    "Thú cưng nhút nhát, giữ yên tĩnh.",
    "Khách hàng yêu cầu dịch vụ premium.",
    "Ghi chú từ bác sĩ thú y về tình trạng da.",
    null, null, null,
];

const ORDER_NOTES_POOL = [
    "Giao buổi sáng trước 10h.",
    "Gọi trước khi giao.",
    "Để hàng trước cửa nếu không có nhà.",
    "Đóng gói cẩn thận tránh vỡ.",
    null, null, null,
];

const CANCEL_REASONS_BOOKING = [
    "Khách hàng bận đột xuất",
    "Thú cưng bị bệnh không thể đến",
    "Đặt nhầm dịch vụ",
    "Nhân viên không có lịch trống",
    "Hệ thống tự hủy do quá hạn",
];
const CANCEL_REASONS_ORDER = [
    "Khách hàng đổi ý",
    "Hết hàng trong kho",
    "Địa chỉ giao hàng sai",
    "Khách không liên lạc được",
    "Thanh toán thất bại",
];

// Voucher discount lookup (from seeder #8, by voucher_id)
const VOUCHER_DISCOUNT = {
    3: { discount:15, discount_type:"percent", max_discount:80000  }, // PETCARE15
    4: { discount:20, discount_type:"percent", max_discount:100000 }, // HOTEL20
    8: { discount:12, discount_type:"percent", max_discount:70000  }, // DOGLOVER
    9: { discount:40000, discount_type:"fixed", max_discount:null  }, // CATCARE
};

const ORDER_VOUCHER_DISCOUNTS = {
    "SAVE50K": { discount:50000, discount_type:"fixed"   },
    "SHOP5"  : { discount:5,     discount_type:"percent" },
    "FREEDAY": { discount:30000, discount_type:"fixed"   },
};

// ── up ────────────────────────────────────────────────────────
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // ── 0. Pets ──────────────────────────────────────────
        // Insert only new pets (not already existing 1-5)
        const newPetRows = NEW_PET_ROWS.map(p => ({
            ...p,
            description: null,
            status: "active",
            pet_image: null,
            created_at: now,
            updated_at: now,
        }));
        await queryInterface.bulkInsert("pets", newPetRows, {});

        // Fetch all pets belonging to our users to build petsByOwner map
        const [allPets] = await queryInterface.sequelize.query(
            `SELECT pet_id, owner_id FROM pets WHERE owner_id IN ('${DUY_ID}','${MANAGER_ID}','${ADMIN_ID}')`
        );
        const petsByOwner = {};
        allPets.forEach(p => {
            if (!petsByOwner[p.owner_id]) petsByOwner[p.owner_id] = [];
            petsByOwner[p.owner_id].push(p.pet_id);
        });

        // Track newly inserted pet IDs for rollback
        const [newPetsInserted] = await queryInterface.sequelize.query(
            `SELECT pet_id FROM pets WHERE owner_id IN ('${DUY_ID}','${ADMIN_ID}') AND name IN ('Choco','Lily') ORDER BY pet_id DESC LIMIT 2`
        );
        const newPetIds = newPetsInserted.map(p => p.pet_id);

        // ── 1. Bookings ──────────────────────────────────────
        const usedBookingCodes = new Set();
        const mkBookingCode = (d) => {
            let c;
            do { c = `BK${ymd(d)}${rndStr(6)}`; } while (usedBookingCodes.has(c));
            usedBookingCodes.add(c);
            return c;
        };

        // Build each booking row + its items together for clean pairing
        const bookingBatch  = []; // { row, items[] }
        const monthCount    = BOOKING_SCENARIOS.length; // 70

        BOOKING_SCENARIOS.forEach(([customerId, petIdRef, svcIds, status, voucherId, hasNote, daysBeforeCreated], idx) => {
            const monthRange = MONTH_RANGES[Math.floor(idx / 17.5)]; // ~17-18 per month
            const [mStart, mEnd] = monthRange;
            // Resolve pet_id: petIdRef is an index (1-7), map to actual pet_id from DB
            const ownerPets = petsByOwner[customerId] || [];
            const petId = ownerPets[(petIdRef - 1) % Math.max(ownerPets.length, 1)] || ownerPets[0] || null;
            const bookingDate = randDate(mStart, mEnd);
            const bookingCode = mkBookingCode(bookingDate);

            // Services
            const services = svcIds.map(id => svcById(id)).filter(Boolean);
            const originalPrice = services.reduce((s, sv) => s + sv.price, 0);

            // Voucher discount
            let discount = 0;
            if (voucherId && VOUCHER_DISCOUNT[voucherId]) {
                const v = VOUCHER_DISCOUNT[voucherId];
                if (v.discount_type === "percent") {
                    discount = Math.min(Math.round(originalPrice * v.discount / 100), v.max_discount || Infinity);
                } else {
                    discount = v.discount;
                }
            }
            const totalPrice = Math.max(originalPrice - discount, 0);

            // Staff
            const staffId = ["pending", "confirmed"].includes(status) ? null : pick(STAFF_IDS);

            // check_in / check_out
            let checkIn  = null;
            let checkOut = null;
            if (status === "assigned" || status === "completed") {
                checkIn  = addH(bookingDate, rand(0, 2));
                checkOut = status === "completed"
                    ? addH(checkIn, Math.max(1, Math.ceil(services.reduce((s, sv) => s + (sv.duration||60), 0) / 60)))
                    : null;
            }

            // Cancel fields
            const cancelledBy  = status === "cancelled" ? pick(["customer","staff","system"]) : null;
            const cancelReason = status === "cancelled" ? pick(CANCEL_REASONS_BOOKING) : null;

            const createdAt = addD(bookingDate, -daysBeforeCreated);

            const row = {
                booking_code: bookingCode,
                customer_id:  customerId,
                staff_id:     staffId,
                pet_id:       petId,
                original_price: originalPrice,
                discount:       Math.round(discount),
                voucher_id:     voucherId || null,
                total_price:    Math.round(totalPrice),
                status,
                date:         bookingDate,
                check_in:     checkIn,
                check_out:    checkOut,
                note:         hasNote ? pick(BOOKING_NOTES_POOL.filter(Boolean)) : null,
                cancelled_by: cancelledBy,
                cancel_reason: cancelReason,
                created_at:   createdAt,
                updated_at:   createdAt,
            };

            const items = services.map(sv => ({
                service_id: sv.service_id,
                price:      sv.price,
                check_in:   checkIn,
                check_out:  checkOut,
                created_at: createdAt,
                updated_at: createdAt,
            }));

            bookingBatch.push({ row, items, bookingCode });
        });

        // Insert bookings
        await queryInterface.bulkInsert(
            "bookings",
            bookingBatch.map(b => b.row),
            {}
        );

        // Fetch inserted booking IDs
        const [insertedBookings] = await queryInterface.sequelize.query(
            `SELECT booking_id, booking_code FROM bookings WHERE booking_code LIKE 'BK2026%' ORDER BY booking_id ASC`
        );
        const codeToBookingId = {};
        insertedBookings.forEach(b => { codeToBookingId[b.booking_code] = b.booking_id; });

        // Build bookingItems rows
        const bookingItemRows = [];
        bookingBatch.forEach(({ row, items, bookingCode }) => {
            const bid = codeToBookingId[bookingCode];
            if (!bid) return;
            items.forEach(item => {
                bookingItemRows.push({ booking_id: bid, ...item });
            });
        });

        if (bookingItemRows.length > 0) {
            await queryInterface.bulkInsert("bookingitems", bookingItemRows, {});
        }

        // ── 2. Revenue for completed bookings ────────────────
        const revenueRows = [];
        bookingBatch.forEach(({ row, bookingCode }) => {
            if (row.status !== "completed") return;
            const bid = codeToBookingId[bookingCode];
            if (!bid) return;
            revenueRows.push({
                source_type:      "booking",
                order_id:         null,
                booking_id:       bid,
                transaction_type: "income",
                gross_amount:     row.original_price,
                discount_amount:  row.discount,
                net_amount:       row.total_price,
                transaction_date: row.check_out || row.date,
                note:             `Revenue from booking #${bid}`,
                created_at:       row.check_out || row.date,
                updated_at:       row.check_out || row.date,
            });
        });

        // ── 3. Orders ────────────────────────────────────────
        const usedOrderCodes = new Set();
        const mkOrderCode = (d) => {
            let c;
            do { c = `ORD${ymd(d)}${rand(1000,9999)}`; } while (usedOrderCodes.has(c));
            usedOrderCodes.add(c);
            return c;
        };

        const orderBatch = []; // { row, items[] }

        ORDER_SCENARIOS.forEach(([customerId, addrIdx, productIndices, qtys, status, paymentMethod, paymentStatus, voucherCode, shippingFee], idx) => {
            const monthRange = MONTH_RANGES[Math.floor(idx / 15)]; // ~15 per month
            const [mStart, mEnd] = monthRange;
            const orderDate  = randDate(mStart, mEnd);
            const orderCode  = mkOrderCode(orderDate);
            const addr       = ADDRESSES[addrIdx];

            const selectedProducts = productIndices.map(i => PRODUCTS[i % PRODUCTS.length]);
            const selectedQtys     = qtys;

            // compute original price
            const originalPrice = selectedProducts.reduce(
                (sum, prod, i) => sum + prod.original_price * (selectedQtys[i] || 1),
                0
            );

            // voucher
            let discount     = 0;
            let discountType = "fixed";
            if (voucherCode && ORDER_VOUCHER_DISCOUNTS[voucherCode]) {
                const v = ORDER_VOUCHER_DISCOUNTS[voucherCode];
                discount     = v.discount;
                discountType = v.discount_type;
            }

            // compute total
            let finalTotal = originalPrice;
            if (discount > 0) {
                if (discountType === "percent") {
                    finalTotal = finalTotal - (finalTotal * discount / 100);
                } else {
                    finalTotal = finalTotal - discount;
                }
            }
            finalTotal = Math.max(finalTotal + shippingFee, 0);

            // MoMo payment (BANK + paid + ~40%)
            const useMomo        = paymentMethod === "BANK" && paymentStatus === "paid" && Math.random() < 0.4;
            const momoOrderId    = useMomo ? `MOMO_${orderCode}`  : null;
            const momoTransId    = useMomo ? `TXN${rndStr(8)}`    : null;
            const momoResultCode = useMomo ? 0                    : null;
            const momoMessage    = useMomo ? "Successful."        : null;

            const cancelReason = status === "cancelled" ? pick(CANCEL_REASONS_ORDER) : null;
            const expiresAt    = (paymentMethod === "BANK" || paymentMethod === "CARD") && status !== "completed"
                ? addH(orderDate, 24) : null;
            const createdAt    = addD(orderDate, -rand(0, 3));

            const row = {
                order_code:          orderCode,
                customer_id:         customerId,
                receiver_name:       addr.receiver_name,
                receiver_phone:      addr.receiver_phone,
                receiver_province:   addr.receiver_province,
                receiver_district:   addr.receiver_district,
                receiver_address:    addr.receiver_address,
                note:                pick(ORDER_NOTES_POOL),
                payment_method:      paymentMethod,
                payment_status:      paymentStatus,
                expires_at:          expiresAt,
                reserved_until:      null,
                voucher_code:        voucherCode || null,
                original_price:      Math.round(originalPrice),
                discount:            Math.round(discount),
                discount_type:       discountType,
                shipping_fee:        shippingFee,
                total_price:         Math.round(finalTotal),
                status,
                cancel_reason:       cancelReason,
                momo_order_id:       momoOrderId,
                momo_trans_id:       momoTransId,
                momo_result_code:    momoResultCode,
                momo_message:        momoMessage,
                created_at:          createdAt,
                updated_at:          createdAt,
            };

            const items = selectedProducts.map((prod, i) => {
                const qty = selectedQtys[i] || 1;
                return {
                    product_id:        prod.product_id,
                    productVariant_id: prod.productVariant_id,
                    product_name:      prod.product_name,
                    variant_label:     prod.variant_label,
                    sku:               prod.sku,
                    product_image:     null,
                    pet_weight:        null,
                    quantity:          qty,
                    original_price:    prod.original_price,
                    discount:          prod.discount,
                    discount_type:     prod.discount_type,
                    price:             prod.price,
                    total_price:       Math.round(prod.price * qty),
                    created_at:        createdAt,
                    updated_at:        createdAt,
                };
            });

            orderBatch.push({ row, items, orderCode });
        });

        // Insert orders
        await queryInterface.bulkInsert(
            "orders",
            orderBatch.map(o => o.row),
            {}
        );

        // Fetch inserted order IDs
        const [insertedOrders] = await queryInterface.sequelize.query(
            `SELECT order_id, order_code FROM orders WHERE order_code LIKE 'ORD2026%' ORDER BY order_id ASC`
        );
        const codeToOrderId = {};
        insertedOrders.forEach(o => { codeToOrderId[o.order_code] = o.order_id; });

        // Build orderItem rows
        const orderItemRows = [];
        orderBatch.forEach(({ row, items, orderCode }) => {
            const oid = codeToOrderId[orderCode];
            if (!oid) return;
            items.forEach(item => {
                orderItemRows.push({ order_id: oid, ...item });
            });
        });

        if (orderItemRows.length > 0) {
            await queryInterface.bulkInsert("orderitems", orderItemRows, {});
        }

        // ── 4. Revenue for completed / cancelled-refunded orders ──
        orderBatch.forEach(({ row, orderCode }) => {
            const oid = codeToOrderId[orderCode];
            if (!oid) return;

            if (row.status === "completed") {
                revenueRows.push({
                    source_type:      "order",
                    order_id:         oid,
                    booking_id:       null,
                    transaction_type: "income",
                    gross_amount:     row.original_price + row.shipping_fee,
                    discount_amount:  Math.round(typeof row.discount === "number" && row.discount_type === "percent"
                        ? row.original_price * row.discount / 100
                        : row.discount),
                    net_amount:       row.total_price,
                    transaction_date: row.created_at,
                    note:             `Revenue from order #${orderCode}`,
                    created_at:       row.created_at,
                    updated_at:       row.created_at,
                });
            }

            if (row.status === "cancelled" && row.payment_status === "refunded") {
                revenueRows.push({
                    source_type:      "order",
                    order_id:         oid,
                    booking_id:       null,
                    transaction_type: "refund",
                    gross_amount:     row.original_price + row.shipping_fee,
                    discount_amount:  row.discount || 0,
                    net_amount:       -row.total_price,
                    transaction_date: row.created_at,
                    note:             `Refund for cancelled order #${orderCode}`,
                    created_at:       row.created_at,
                    updated_at:       row.created_at,
                });
            }
        });

        if (revenueRows.length > 0) {
            await queryInterface.bulkInsert("revenue_transactions", revenueRows, {});
        }
    },

    // ── down ──────────────────────────────────────────────────
    async down(queryInterface, Sequelize) {
        // Revenue
        await queryInterface.sequelize.query(
            `DELETE rt FROM revenue_transactions rt
             LEFT JOIN orders o ON rt.order_id = o.order_id
             LEFT JOIN bookings b ON rt.booking_id = b.booking_id
             WHERE (o.order_code LIKE 'ORD2026%' OR b.booking_code LIKE 'BK2026%')`
        );

        // Order items
        await queryInterface.sequelize.query(
            `DELETE oi FROM orderItems oi
             INNER JOIN orders o ON oi.order_id = o.order_id
             WHERE o.order_code LIKE 'ORD2026%'`
        );
        // Orders
        await queryInterface.sequelize.query(
            `DELETE FROM orders WHERE order_code LIKE 'ORD2026%'`
        );

        // Booking items
        await queryInterface.sequelize.query(
            `DELETE bi FROM bookingItems bi
             INNER JOIN bookings b ON bi.booking_id = b.booking_id
             WHERE b.booking_code LIKE 'BK2026%'`
        );
        // Bookings
        await queryInterface.sequelize.query(
            `DELETE FROM bookings WHERE booking_code LIKE 'BK2026%'`
        );

        // Pets (only delete newly inserted ones)
        await queryInterface.sequelize.query(
            `DELETE FROM pets WHERE name IN ('Choco','Lily') AND owner_id IN ('${DUY_ID}','${ADMIN_ID}')`
        );
    },
};

