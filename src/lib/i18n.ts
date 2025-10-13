export type Locale = "ta" | "en";

export const DEFAULT_LOCALE: Locale = "ta";

export const locales: Locale[] = ["ta", "en"];

export type Dictionary = {
  brand: { name: string };
  nav: { home: string; products: string; cart: string; checkout: string; account: string; about: string };
  actions: { addToCart: string; buyNow: string; changeToTamil: string; changeToEnglish: string };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    shopNow: string;
    featuredTitle: string;
    viewAll: string;
    why: {
      title: string;
      pure: { title: string; subtitle: string };
      quality: { title: string; subtitle: string };
      delivery: { title: string; subtitle: string };
      ordering: { title: string; subtitle: string };
    };
    cta: { title: string; subtitle: string; button: string };
  };
  product: { size: string; quantity: string; price: string; inStock: string; outOfStock: string; details: string; searchPlaceholder: string; allSizes: string };
  cart: { title: string; empty: string; subtotal: string; checkout: string; delivery: string; total: string; continue: string; shopShort: string; popular: string };
  checkout: { title: string; address: string; mapHint: string; placeOrder: string; paymentMethod: string; cod: string; commentsTitle: string; commentsPlaceholder: string; contact: string; deliverySection: string; summary: string; deliveryLabel: string; totalLabel: string };
  footer: { contact: string; quickLinks: string };
  about: { title: string; features: { one: string; two: string; three: string }; testimonialsTitle: string };
  account: { title: string; login: string; register: string; orders: string };
};

export const ta: Dictionary = {
  brand: {
    name: "SRMK Oil Mill",
  },
  nav: {
    home: "முகப்பு",
    products: "தயாரிப்புகள்",
    cart: "வண்டி",
    checkout: "செக்க்அவுட்",
    account: "கணக்கு",
    about: "எங்களை பற்றி",
  },
  actions: {
    addToCart: "வண்டியில் சேர்",
    buyNow: "இப்போதே வாங்க",
    changeToTamil: "தமிழ்",
    changeToEnglish: "English",
  },
  home: {
    heroTitle: "சுத்தமான குளிர்-பிரஸ் எண்ணெய்கள்",
    heroSubtitle: "உங்கள் குடும்பத்திற்கு ஆரோக்கியமும் சுவையும்",
    shopNow: "இப்போது வாங்க",
    featuredTitle: "சிறப்பு தயாரிப்புகள்",
    viewAll: "அனைத்து தயாரிப்புகளையும் காண",
    why: {
      title: "ஏன் SRMK எண்ணெய்?",
      pure: { title: "100% தூய்மை", subtitle: "வேறு கலப்படம் இல்லை" },
      quality: { title: "உயர் தரம்", subtitle: "சிறந்த பொருட்களிலிருந்து தயாரிப்பு" },
      delivery: { title: "விரைவு டெலிவரி", subtitle: "உடனடி மற்றும் நம்பகமான கப்பல்" },
      ordering: { title: "எளிய ஆர்டர்", subtitle: "எளிய மற்றும் பாதுகாப்பான செக்க்அவுட்" },
    },
    cta: {
      title: "உங்கள் சமையலை மேம்படுத்தத் தயாரா?",
      subtitle: "SRMK எண்ணெயை நம்பும் ஆயிரக்கணக்கான வாடிக்கையாளர்களில் சேருங்கள்.",
      button: "வாங்கத் தொடங்குங்கள்",
    },
  },
  product: {
    size: "அளவு",
    quantity: "அளவு (எண்ணிக்கை)",
    price: "விலை",
    inStock: "கையிருப்பு உள்ளது",
    outOfStock: "கையிருப்பு இல்லை",
    details: "விவரங்கள்",
    searchPlaceholder: "தயாரிப்புகளை தேடுங்கள்...",
    allSizes: "அனைத்து அளவுகள்",
  },
  cart: {
    title: "உங்கள் வண்டி",
    empty: "வண்டி காலியானது",
    subtotal: "கூட்டுத்தொகை",
    checkout: "செக்க்அவுட்",
    delivery: "டெலிவரி",
    total: "மொத்தம்",
    continue: "வாங்க தொடர்ந்து",
    shopShort: "வாங்க",
    popular: "பிரபலமானவை",
  },
  checkout: {
    title: "செக்க்அவுட்",
    address: "விநியோக முகவரி",
    mapHint: "வரைபடத்தில் உங்கள் விநியோக இடத்தை குறியிடவும்",
    placeOrder: "ஆர்டர் செய்யவும்",
    paymentMethod: "செலுத்தும் முறை",
    cod: "டெலிவரியின் போது பணம்",
    commentsTitle: "கூடுதல் குறிப்புகள்",
    commentsPlaceholder: "விநியோகத்திற்கு சிறப்பு அறிவுறுத்தல்கள் (விருப்பம்)",
    contact: "தொடர்பு",
    deliverySection: "விநியோகம்",
    summary: "ஆர்டர் சுருக்கம்",
    deliveryLabel: "டெலிவரி",
    totalLabel: "மொத்தம்",
  },
  footer: { contact: "தொடர்பு", quickLinks: "விரைவு இணைப்புகள்" },
  about: {
    title: "எங்களை பற்றி",
    features: { one: "சுத்தமான பொருட்கள்", two: "பாரம்பரிய செயல்முறை", three: "குடும்பங்களால் நம்பப்படும்" },
    testimonialsTitle: "வாடிக்கையாளர் கருத்துகள்",
  },
  account: {
    title: "என் கணக்கு",
    login: "உள்நுழை",
    register: "பதிவு செய்",
    orders: "ஆர்டர்கள்",
  },
};

export const en: Dictionary = {
  brand: { name: "SRMK Oil Mill" },
  nav: {
    home: "Home",
    products: "Products",
    cart: "Cart",
    checkout: "Checkout",
    account: "Account",
    about: "About",
  },
  actions: {
    addToCart: "Add to cart",
    buyNow: "Buy now",
    changeToTamil: "தமிழ்",
    changeToEnglish: "English",
  },
  home: {
    heroTitle: "Pure Cold-Pressed Oils",
    heroSubtitle: "Health and taste for your family",
    shopNow: "Shop now",
    featuredTitle: "Featured Products",
    viewAll: "View All Products",
    why: {
      title: "Why Choose SRMK Oil?",
      pure: { title: "100% Pure", subtitle: "No additives or preservatives" },
      quality: { title: "Premium Quality", subtitle: "Sourced from the finest ingredients" },
      delivery: { title: "Fast Delivery", subtitle: "Quick and reliable shipping" },
      ordering: { title: "Easy Ordering", subtitle: "Simple and secure checkout" },
    },
    cta: {
      title: "Ready to Upgrade Your Cooking?",
      subtitle: "Join thousands of satisfied customers who trust SRMK Oil for their kitchen needs.",
      button: "Start Shopping",
    },
  },
  product: {
    size: "Size",
    quantity: "Quantity",
    price: "Price",
    inStock: "In stock",
    outOfStock: "Out of stock",
    details: "Details",
    searchPlaceholder: "Search products...",
    allSizes: "All sizes",
  },
  cart: {
    title: "Your Cart",
    empty: "Cart is empty",
    subtotal: "Subtotal",
    checkout: "Checkout",
    delivery: "Delivery",
    total: "Total",
    continue: "Continue shopping",
    shopShort: "Shop",
    popular: "Popular Picks",
  },
  checkout: {
    title: "Checkout",
    address: "Delivery Address",
    mapHint: "Pin your delivery location on the map",
    placeOrder: "Place Order",
    paymentMethod: "Payment Method",
    cod: "Cash on Delivery",
    commentsTitle: "Additional Comments",
    commentsPlaceholder: "Any special delivery instructions (optional)",
    contact: "Contact",
    deliverySection: "Delivery",
    summary: "Order Summary",
    deliveryLabel: "Delivery",
    totalLabel: "Total",
  },
  footer: { contact: "Contact", quickLinks: "Quick Links" },
  about: {
    title: "About",
    features: { one: "Pure Ingredients", two: "Traditional Process", three: "Trusted by Families" },
    testimonialsTitle: "Testimonials",
  },
  account: {
    title: "My Account",
    login: "Login",
    register: "Register",
    orders: "Orders",
  },
};

export function getDictionary(locale: Locale) {
  return locale === "ta" ? ta : en;
}
