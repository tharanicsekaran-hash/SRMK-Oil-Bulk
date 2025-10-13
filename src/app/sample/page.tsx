"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

export default function SamplePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div variants={stagger()} initial="hidden" animate="show">
        <motion.h1 variants={fadeUp} className="text-3xl font-bold mb-3">Sample Page</motion.h1>
        <motion.p variants={fadeUp} className="text-gray-700">
          This is a placeholder page you can use to try layouts and components.
        </motion.p>
      </motion.div>
    </div>
  );
}
