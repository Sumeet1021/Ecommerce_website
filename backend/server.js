const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const app = express();
const JWT_SECRET = "mystore_secret_key_2025";

app.use(cors());
app.use(express.json());

// ── MongoDB ─────────────────────────────────────────────────
mongoose.connect(
  "mongodb://guptasumeet027_db_user:admin123@ac-iyrl9dh-shard-00-00.frqzxnj.mongodb.net:27017,ac-iyrl9dh-shard-00-01.frqzxnj.mongodb.net:27017,ac-iyrl9dh-shard-00-02.frqzxnj.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-92dhvd-shard-0&authSource=admin&retryWrites=true&w=majority"
)
.then(() => console.log("🔥 MongoDB Connected Successfully"))
.catch((err) => console.log("❌ MongoDB Error:", err));

// ── Product Schema ──────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:            String,
  price:           Number,
  originalPrice:   Number,
  images:          [String],
  description:     String,
  fullDescription: String,
  category:        String,
  brand:           String,
  rating:          Number,
  reviews:         Number,
  features:        [String],
  specs:           mongoose.Schema.Types.Mixed,
  inStock:         { type: Boolean, default: true }
});
const Product = mongoose.model("Product", productSchema);

// ── User Schema ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

// ── Test ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ── SEED — must be BEFORE /:id route ───────────────────────
app.get("/api/products/seed", async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = [
      {
        name: "Apple iPhone 15", price: 79999, originalPrice: 89999,
        category: "Smartphones", brand: "Apple", rating: 4.7, reviews: 2841,
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1696446702183-cbd67010beb4?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1574755393849-623942496936?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop"
        ],
        description: "Latest iPhone with A16 Bionic chip, 48MP camera, and Dynamic Island.",
        fullDescription: "The iPhone 15 features a groundbreaking 48MP main camera system with a new 2x Telephoto option. The Dynamic Island bubbles up alerts and Live Activities. Charge faster with USB-C and get all-day battery life. A16 Bionic is the ultimate smartphone chip — blazing fast for gaming, photography, and everything in between.",
        features: ["48MP main camera", "A16 Bionic chip", "Dynamic Island", "USB-C charging", "All-day battery life", "Ceramic Shield front"],
        specs: { Display: "6.1-inch Super Retina XDR", Chip: "A16 Bionic", Storage: "128GB / 256GB / 512GB", Camera: "48MP + 12MP", Battery: "3279 mAh", OS: "iOS 17" }
      },
      {
        name: "Samsung Galaxy S24 Ultra", price: 129999, originalPrice: 149999,
        category: "Smartphones", brand: "Samsung", rating: 4.8, reviews: 1923,
        images: [
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1581993192008-63e896f4f744?w=600&h=600&fit=crop"
        ],
        description: "Flagship Android with built-in S Pen, Galaxy AI, and 200MP camera.",
        fullDescription: "The Galaxy S24 Ultra is the ultimate smartphone for power users. Featuring Galaxy AI, the built-in S Pen, and a professional-grade 200MP camera system. The titanium frame and 5000mAh battery make it incredibly durable and long-lasting.",
        features: ["200MP camera system", "Built-in S Pen", "Galaxy AI features", "Titanium frame", "5000mAh battery", "Snapdragon 8 Gen 3"],
        specs: { Display: "6.8-inch QHD+ AMOLED", Chip: "Snapdragon 8 Gen 3", Storage: "256GB / 512GB / 1TB", Camera: "200MP + 12MP + 10MP", Battery: "5000 mAh", OS: "Android 14" }
      },
      {
        name: "Sony WH-1000XM5", price: 29999, originalPrice: 34999,
        category: "Audio", brand: "Sony", rating: 4.8, reviews: 4521,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop"
        ],
        description: "Industry-leading noise cancellation with 30-hour battery life.",
        fullDescription: "The WH-1000XM5 headphones deliver industry-leading noise cancellation with eight microphones and two processors. With up to 30-hour battery life and quick charging, these headphones keep up with your lifestyle.",
        features: ["Industry-leading ANC", "30-hour battery", "Quick Charge support", "8 microphones", "Multipoint connection", "Foldable design"],
        specs: { Type: "Over-ear wireless", "Driver Unit": "30mm", Frequency: "4Hz-40,000Hz", Battery: "30 hours", Weight: "250g", Connectivity: "Bluetooth 5.2" }
      },
      {
        name: "Apple MacBook Air M2", price: 114999, originalPrice: 129999,
        category: "Laptops", brand: "Apple", rating: 4.9, reviews: 3102,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop"
        ],
        description: "Supercharged by M2 chip, ultra-thin design, 18-hour battery life.",
        fullDescription: "MacBook Air with M2 is strikingly thin and incredibly capable. Features a fanless design, stunning Liquid Retina display, 1080p FaceTime HD camera, and MagSafe charging. With up to 18 hours of battery life, it is the world's best consumer laptop.",
        features: ["Apple M2 chip", "18-hour battery", "13.6-inch Liquid Retina display", "1080p FaceTime HD camera", "MagSafe charging", "Fanless silent design"],
        specs: { Chip: "Apple M2", RAM: "8GB / 16GB / 24GB", Storage: "256GB to 2TB SSD", Display: "13.6-inch Liquid Retina", Battery: "18 hours", Weight: "1.24 kg" }
      },
      {
        name: "Nike Air Max 270", price: 12999, originalPrice: 15999,
        category: "Footwear", brand: "Nike", rating: 4.5, reviews: 6723,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop"
        ],
        description: "Iconic Nike sneakers with Max Air cushioning and breathable mesh upper.",
        fullDescription: "The Nike Air Max 270 delivers visible cushioning under every step. Featuring Nike tallest Air unit yet in the heel, it offers an exceptionally smooth and cushioned ride. The breathable mesh upper keeps your feet cool all day.",
        features: ["Tallest Air unit ever", "Breathable mesh upper", "Foam midsole cushioning", "Rubber outsole", "Lightweight design", "Multiple colorways"],
        specs: { Type: "Lifestyle / Running", Upper: "Mesh + synthetic", Midsole: "Foam + Air Max unit", Outsole: "Rubber", Weight: "312g (size 10)", Available: "Sizes 6-13" }
      },
      {
        name: "Canon EOS R50", price: 64999, originalPrice: 74999,
        category: "Cameras", brand: "Canon", rating: 4.6, reviews: 981,
        images: [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600&h=600&fit=crop"
        ],
        description: "24.2MP mirrorless camera with 4K video and Dual Pixel CMOS AF.",
        fullDescription: "The EOS R50 is Canon smallest and lightest APS-C mirrorless camera, perfect for content creators. Featuring a 24.2MP sensor, Dual Pixel CMOS AF II with subject tracking, and 4K video capabilities.",
        features: ["24.2MP APS-C sensor", "4K UHD video", "Dual Pixel CMOS AF II", "Subject tracking", "Vari-angle touchscreen", "Wi-Fi + Bluetooth"],
        specs: { Sensor: "24.2MP APS-C CMOS", Video: "4K UHD 30fps", AF: "Dual Pixel CMOS AF II", Display: "3-inch vari-angle touch", ISO: "100-32000", Weight: "375g" }
      },
      {
        name: "boAt Rockerz 450 Pro", price: 1999, originalPrice: 3999,
        category: "Audio", brand: "boAt", rating: 4.2, reviews: 18432,
        images: [
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop"
        ],
        description: "Wireless Bluetooth headphones with 70-hour battery and powerful bass.",
        fullDescription: "boAt Rockerz 450 Pro is an on-ear wireless headphone designed for audiophiles on a budget. With 40mm drivers, BEAST Mode audio, and 70-hour playback time, it is the perfect companion for music lovers.",
        features: ["70-hour playtime", "40mm drivers", "BEAST Mode audio", "Dual pairing", "Foldable design", "Fast charging"],
        specs: { Type: "On-ear wireless", Driver: "40mm dynamic", Battery: "70 hours", Charging: "Type-C fast charge", Bluetooth: "5.0", Weight: "220g" }
      },
      {
        name: "Lenovo IdeaPad Slim 5", price: 52999, originalPrice: 64999,
        category: "Laptops", brand: "Lenovo", rating: 4.4, reviews: 2156,
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=600&fit=crop"
        ],
        description: "AMD Ryzen 5, 16GB RAM, 512GB SSD for students and professionals.",
        fullDescription: "The IdeaPad Slim 5 combines AMD Ryzen performance with a sleek design. The 14-inch Full HD display and fast 512GB SSD make multitasking effortless. Long battery life keeps you going all day.",
        features: ["AMD Ryzen 5", "16GB DDR5 RAM", "512GB NVMe SSD", "14-inch Full HD display", "Backlit keyboard", "Fingerprint reader"],
        specs: { Processor: "AMD Ryzen 5 7530U", RAM: "16GB DDR5", Storage: "512GB NVMe SSD", Display: "14-inch FHD IPS", Battery: "Up to 12 hours", Weight: "1.46 kg" }
      },
      {
        name: "Samsung 55 inch 4K QLED TV", price: 74999, originalPrice: 99999,
        category: "TVs", brand: "Samsung", rating: 4.6, reviews: 3412,
        images: [
          "https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1567690187548-f07b1d7bf754?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"
        ],
        description: "55-inch 4K QLED Smart TV with Quantum Dot and Tizen OS.",
        fullDescription: "Experience vivid colors with Samsung QLED technology. Quantum Dot produces over a billion colors for lifelike picture quality. The Quantum Processor 4K uses AI upscaling. Built-in Tizen OS gives access to Netflix, Prime Video, YouTube, and more.",
        features: ["Quantum Dot 4K display", "Quantum Processor 4K", "Smart TV with Tizen OS", "100Hz refresh rate", "Multiple HDMI ports", "Voice control"],
        specs: { Size: "55 inches", Resolution: "4K UHD 3840x2160", Panel: "QLED", "Refresh Rate": "100Hz", "Smart OS": "Tizen", HDMI: "4x HDMI 2.1" }
      },
      {
        name: "Apple Watch Series 9", price: 41900, originalPrice: 49900,
        category: "Wearables", brand: "Apple", rating: 4.8, reviews: 5621,
        images: [
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop"
        ],
        description: "Advanced smartwatch with S9 chip, ECG, and always-on display.",
        fullDescription: "Apple Watch Series 9 introduces the S9 chip for faster performance. The double tap gesture lets you control your watch without touching the screen. Track health with ECG, blood oxygen monitoring, and crash detection.",
        features: ["S9 SiP chip", "Double tap gesture", "ECG + Blood Oxygen", "Always-on Retina display", "Crash detection", "18-hour battery"],
        specs: { Chip: "Apple S9 SiP", Display: "Always-On Retina LTPO OLED", Health: "ECG, SpO2, Temperature", Battery: "18 hours", Water: "50m water resistant", OS: "watchOS 10" }
      },
      {
        name: "Sony PlayStation 5", price: 54990, originalPrice: 59990,
        category: "Gaming", brand: "Sony", rating: 4.9, reviews: 7823,
        images: [
          "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?w=600&h=600&fit=crop"
        ],
        description: "Next-gen gaming with 4K, ultra-fast SSD, and DualSense controller.",
        fullDescription: "PlayStation 5 marks a new era for gaming. The custom SSD enables lightning-fast load times. The DualSense controller delivers immersive haptic feedback and adaptive triggers. Experience 4K gaming at up to 120fps with ray tracing.",
        features: ["Custom 825GB SSD", "4K gaming up to 120fps", "Ray tracing support", "DualSense haptic feedback", "3D audio technology", "PS4 backward compatible"],
        specs: { CPU: "AMD Zen 2, 8-core", GPU: "AMD RDNA 2, 10.28 TFLOPS", Storage: "825GB Custom SSD", RAM: "16GB GDDR6", "Optical Drive": "4K UHD Blu-ray", Output: "4K 120fps, 8K" }
      },
      {
        name: "iPad Pro 12.9 M2", price: 112900, originalPrice: 124900,
        category: "Tablets", brand: "Apple", rating: 4.8, reviews: 2341,
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1589739900266-43b2843f4880?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop"
        ],
        description: "Pro-level tablet with M2 chip and Liquid Retina XDR display.",
        fullDescription: "iPad Pro with M2 chip delivers desktop-class performance. The 12.9-inch Liquid Retina XDR display with ProMotion technology adjusts up to 120Hz. With Thunderbolt and USB 4, it is the most capable iPad ever made.",
        features: ["Apple M2 chip", "12.9-inch Liquid Retina XDR", "ProMotion 120Hz", "Apple Pencil 2 support", "Thunderbolt USB 4", "5G connectivity"],
        specs: { Chip: "Apple M2", Display: "12.9-inch Liquid Retina XDR", Storage: "128GB to 2TB", Camera: "12MP Wide + 10MP Ultra Wide", Connectivity: "Wi-Fi 6E + 5G", Battery: "10 hours" }
      },
      {
        name: "Bose QuietComfort 45", price: 24999, originalPrice: 31999,
        category: "Audio", brand: "Bose", rating: 4.6, reviews: 3892,
        images: [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop"
        ],
        description: "World-class noise cancellation headphones with 24-hour battery.",
        fullDescription: "Bose QuietComfort 45 delivers the perfect balance of quiet, comfort, and sound. Proprietary Bose noise cancellation blocks distractions so you can focus on what you love. TriPort acoustic design delivers full, natural sound at any volume.",
        features: ["World-class ANC", "24-hour battery", "Quiet and Aware modes", "TriPort acoustic design", "Plush earcups", "USB-C charging"],
        specs: { Type: "Over-ear wireless", Battery: "24 hours ANC on", Modes: "Quiet + Aware Mode", Charging: "USB-C", Weight: "238g", Bluetooth: "5.1" }
      },
      {
        name: "Realme GT 5 Pro", price: 34999, originalPrice: 39999,
        category: "Smartphones", brand: "Realme", rating: 4.4, reviews: 3201,
        images: [
          "https://images.unsplash.com/photo-1574755393849-623942496936?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&h=600&fit=crop"
        ],
        description: "Snapdragon 8 Gen 3 with 144Hz display and 100W fast charging.",
        fullDescription: "The Realme GT 5 Pro brings flagship performance at mid-range price. Snapdragon 8 Gen 3 with 144Hz AMOLED display delivers buttery smooth experience. 100W SuperVOOC charges the 5400mAh battery from 0 to 100% in just 25 minutes.",
        features: ["Snapdragon 8 Gen 3", "144Hz AMOLED display", "100W SuperVOOC charging", "5400mAh battery", "50MP Sony IMX890", "IP64 rating"],
        specs: { Chip: "Snapdragon 8 Gen 3", Display: "6.78-inch 144Hz AMOLED", Camera: "50MP + 8MP + 2MP", Battery: "5400mAh", Charging: "100W wired", OS: "Android 14" }
      },
      {
        name: "LG 27 inch 4K Monitor", price: 38999, originalPrice: 49999,
        category: "Monitors", brand: "LG", rating: 4.7, reviews: 1543,
        images: [
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1593640408182-31c228f2c0c9?w=600&h=600&fit=crop"
        ],
        description: "27-inch 4K IPS monitor with USB-C, HDR10, and 99% sRGB.",
        fullDescription: "The LG 27UK850 delivers stunning 4K UHD visuals on a 27-inch IPS panel with HDR10. With 99% sRGB color accuracy and factory calibration, it is ideal for professional photo and video editing. USB-C delivers up to 60W power delivery.",
        features: ["27-inch 4K IPS", "HDR10 support", "99% sRGB accuracy", "USB-C 60W power delivery", "AMD FreeSync", "Height adjustable stand"],
        specs: { Size: "27 inches", Resolution: "4K UHD 3840x2160", Panel: "IPS", "Refresh Rate": "60Hz", Ports: "USB-C, 2x HDMI, DP", HDR: "HDR10" }
      }
    ];
    const saved = await Product.insertMany(products);
    res.json({ message: "✅ " + saved.length + " products added!", count: saved.length });
  } catch (err) {
    res.status(500).json({ message: "Seed failed", error: err.message });
  }
});

// ── GET All Products ────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ── GET Single Product by ID ────────────────────────────────
app.get("/api/products/:id", async (req, res) => {
  try {
    console.log("Fetching product with id:", req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("Product not found for id:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("Found product:", product.name);
    res.json(product);
  } catch (err) {
    console.log("Error fetching product:", err.message);
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ── AUTH ────────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please fill in all fields." });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "This email is already registered." });
    const hashed = await bcrypt.hash(password, 10);
    const user   = new User({ name, email, password: hashed });
    await user.save();
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Account created!", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please enter email and password." });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "No account found with this email." });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password. Please try again." });
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful!", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ── POST Add Product ────────────────────────────────────────
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
});

// ── DELETE Product ──────────────────────────────────────────
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
});

// ── Start ───────────────────────────────────────────────────
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));