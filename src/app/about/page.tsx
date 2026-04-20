"use client";
import { motion } from "framer-motion";
import { useI18n } from "@/components/LanguageProvider";
import { fadeUp, stagger } from "@/lib/animations";
import { Award, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";

export default function AboutPage() {
  const { locale } = useI18n();

  const isTamil = locale === "ta";

  const highlights = isTamil
    ? [
        {
          title: "மூலப் பொருட்களின் தூய்மை",
          text: "தேர்ந்தெடுத்த நல்ல தரமான விதைகளிலிருந்து மட்டுமே எண்ணெய் தயாரிக்கிறோம். கலப்படம் இல்லாமல் இயல்பான மணமும் சுவையும் பாதுகாக்கப்படுகிறது.",
        },
        {
          title: "பாரம்பரிய குளிர்-பிரஸ் முறை",
          text: "உயர் வெப்பம் இல்லாத மெதுவான பிழிவு முறையால் எண்ணெயின் இயற்கை சத்துக்கள் காக்கப்படுகின்றன.",
        },
        {
          title: "நம்பிக்கை மற்றும் தரம்",
          text: "ஒவ்வொரு தொகுப்பும் தரச் சோதனைக்கு பின் மட்டுமே வாடிக்கையாளர்களிடம் செல்கிறது. குடும்பம் நம்பும் தரத்தை தொடர்ந்து வழங்குகிறோம்.",
        },
      ]
    : [
        {
          title: "Purity in Every Seed",
          text: "We source only carefully selected quality seeds and process them without adulteration, preserving natural aroma and taste.",
        },
        {
          title: "Traditional Cold-Pressed Method",
          text: "Our low-heat extraction process helps retain the natural nutrients of the oil, just the way traditional households expect.",
        },
        {
          title: "Built on Trust and Consistency",
          text: "Every batch is quality-checked before it reaches customers, so families can rely on the same standard every time.",
        },
      ];

  const testimonials = isTamil
    ? [
        {
          name: "மீனா. ஆர்",
          place: "தேனி",
          text: "SRMK நல்லெண்ணெய் சுவையும் மணமும் அருமை. வீட்டிலேயே அரைத்தது போல தரம் இருக்கிறது.",
        },
        {
          name: "கார்த்திக். பி",
          place: "மதுரை",
          text: "டெலிவரி நேரம் கச்சிதம். பொருள் தரம் எப்போதும் ஒரே மாதிரி நன்றாக இருப்பது மிகவும் பிடித்தது.",
        },
        {
          name: "லதா. எஸ்",
          place: "கோயம்புத்தூர்",
          text: "சமையலில் எண்ணெய் வாசனைவே வித்தியாசம் காட்டுகிறது. குடும்பம் முழுக்க இப்போது SRMK எண்ணெய்தான் பயன்படுத்துகிறோம்.",
        },
      ]
    : [
        {
          name: "Meena R.",
          place: "Theni",
          text: "The aroma and taste of SRMK sesame oil are excellent. It feels truly homemade and pure.",
        },
        {
          name: "Karthik P.",
          place: "Madurai",
          text: "Delivery is on time and the product quality is consistently good in every order.",
        },
        {
          name: "Latha S.",
          place: "Coimbatore",
          text: "You can feel the difference in cooking itself. Our family now uses only SRMK oils.",
        },
      ];

  const promiseCards = isTamil
    ? [
        {
          icon: ShieldCheck,
          title: "கலப்படமற்ற தர உறுதி",
          text: "எங்கள் எண்ணெய்களில் செயற்கை கலவைகள், மணப்பொருட்கள் அல்லது நிறமிகள் சேர்க்கப்படமாட்டாது.",
        },
        {
          icon: Leaf,
          title: "சத்து காக்கும் தயாரிப்பு",
          text: "மெதுவான பிழிவு முறையால் இயற்கை மணம், சுவை மற்றும் சத்து அதிகம் பாதுகாக்கப்படுகிறது.",
        },
        {
          icon: Truck,
          title: "புதிய தொகுப்பு, வேகமான டெலிவரி",
          text: "சரியான பேக்கிங்குடன் விரைவாக அனுப்பி, புதிய தரத்தில் உங்கள் வீட்டுக்கு சேர்க்கிறோம்.",
        },
      ]
    : [
        {
          icon: ShieldCheck,
          title: "No Adulteration Promise",
          text: "We never add synthetic blends, artificial fragrance, or color enhancers to our oils.",
        },
        {
          icon: Leaf,
          title: "Nutrition-First Processing",
          text: "Our slow extraction process is designed to preserve natural aroma, taste, and nutrients.",
        },
        {
          icon: Truck,
          title: "Fresh Batch, Fast Delivery",
          text: "We pack with care and dispatch quickly so your order reaches you fresh and reliable.",
        },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <section>
        <motion.div
          variants={stagger()}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 md:p-10 shadow-sm"
        >
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {isTamil ? "பாரம்பரியம் • தூய்மை • நம்பிக்கை" : "Tradition • Purity • Trust"}
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {isTamil ? "SRMK Oil Mill பற்றி" : "About SRMK Oil Mill"}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-gray-700 max-w-4xl leading-relaxed">
            {isTamil
              ? "SRMK Oil Mill-இல், ஆரோக்கியமான சமையல் நல்ல எண்ணெயிலிருந்து துவங்குகிறது என்று நாங்கள் நம்புகிறோம். பாரம்பரிய குளிர்-பிரஸ் முறையையும், நவீன தரக் கட்டுப்பாட்டையும் இணைத்து, சுவை மற்றும் சத்துகள் காக்கப்படும் தூய எண்ணெய்களை உங்கள் இல்லங்களுக்கு கொண்டு செல்கிறோம்."
              : "At SRMK Oil Mill, we believe healthy cooking begins with honest oil. By combining traditional cold-pressed extraction with modern quality checks, we deliver pure oils that preserve both nutrition and authentic taste for your home."}
          </motion.p>
          <motion.p variants={fadeUp} className="text-gray-700 max-w-4xl mt-4 leading-relaxed">
            {isTamil
              ? "எங்களின் நோக்கம் ஒரு தயாரிப்பை விற்பதே அல்ல; ஒவ்வொரு குடும்பமும் நம்பிக்கையுடன் பயன்படுத்தும் தரநிலையை கட்டியமைப்பதே. அதனால் மூலப்பொருள் தேர்வு முதல் பாக்கிங் வரை ஒவ்வொரு கட்டத்திலும் வெளிப்படைத்தன்மையையும், பொறுப்பையும் கடைப்பிடிக்கிறோம்."
              : "Our mission is not just to sell a product, but to build a standard families can trust every single day. That is why we maintain transparency and care at every stage, from sourcing to packaging."}
          </motion.p>
          <motion.p variants={fadeUp} className="text-lg md:text-xl font-semibold text-amber-800 max-w-4xl mt-4">
            {isTamil
              ? "தாய்ப்பாலுக்கு நிகரான தரமும் தூய்மையும்"
              : "Quality and purity comparable to mother’s milk"}
          </motion.p>
        </motion.div>
      </section>

      <section>
        <motion.h2 variants={fadeUp} initial="hidden" animate="show" className="text-2xl md:text-3xl font-semibold mb-4">
          {isTamil ? "எங்கள் சிறப்புகள்" : "What Makes Us Different"}
        </motion.h2>
        <motion.div variants={stagger()} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-700 mb-3">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-lg font-semibold mb-2 text-gray-900">{item.title}</div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {item.text}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section>
        <motion.div
          variants={stagger()}
          initial="hidden"
          animate="show"
          className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-7 md:p-8"
        >
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900">
            {isTamil ? "எங்கள் உறுதி" : "Our Promise"}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-gray-600 mb-6 max-w-3xl">
            {isTamil
              ? "ஒவ்வொரு ஆர்டரிலும் தரம், நேர்மை, மற்றும் வாடிக்கையாளர் நம்பிக்கையை முன்னிலைப்படுத்துகிறோம்."
              : "With every order, we prioritize quality, honesty, and customer trust above everything else."}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promiseCards.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="rounded-2xl bg-white/80 border border-emerald-100 p-5"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section>
        <motion.h2 variants={fadeUp} initial="hidden" animate="show" className="text-2xl md:text-3xl font-semibold mb-4">
          {isTamil ? "வாடிக்கையாளர் கருத்துகள்" : "Customer Testimonials"}
        </motion.h2>
        <motion.div variants={stagger()} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <motion.blockquote
              key={idx}
              variants={fadeUp}
              className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-6 shadow-sm"
            >
              <p className="text-sm text-gray-800 leading-relaxed">“{t.text}”</p>
              <footer className="text-xs text-gray-600 mt-4 font-medium">
                — {t.name}, {t.place}
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
