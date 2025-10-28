"use client";
import { motion } from "framer-motion";
import { useI18n } from "@/components/LanguageProvider";
import { fadeUp, stagger } from "@/lib/animations";

const testimonials = [
  {
    name: "Arun K.",
    text: "The oils are fresh and fragrant. My family loves the taste!",
  },
  {
    name: "Priya S.",
    text: "Fast delivery and consistently great quality. Highly recommended.",
  },
  {
    name: "Sridhar R.",
    text: "Authentic cold-pressed oils at fair prices. Will buy again.",
  },
];

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <section>
        <motion.div variants={stagger()} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp} className="text-3xl font-bold mb-3">
            {t.about.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-700 max-w-3xl">
            {t.home.heroSubtitle}
          </motion.p>
        </motion.div>
      </section>

      <section>
        <motion.div variants={stagger()} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[t.about.features.one, t.about.features.two, t.about.features.three].map((title, i) => (
            <motion.div key={i} variants={fadeUp} className="rounded-lg border p-5 bg-white">
              <div className="text-lg font-semibold mb-1">{title}</div>
              <div className="text-sm text-gray-600">
                We follow best practices end-to-end—from sourcing to packing—to ensure quality and taste.
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section>
        <motion.h2 variants={fadeUp} initial="hidden" animate="show" className="text-2xl font-semibold mb-4">
          {t.about.testimonialsTitle}
        </motion.h2>
        <motion.div variants={stagger()} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, idx) => (
            <motion.blockquote key={idx} variants={fadeUp} className="rounded-lg border bg-amber-50/40 p-5">
              <p className="text-sm text-gray-800">“{t.text}”</p>
              <footer className="text-xs text-gray-600 mt-3">— {t.name}</footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
