"use client";
import { motion, useAnimation, useInView, type Variants } from "framer-motion";
import React, { useEffect, useRef } from "react";

export default function MotionInView({
  children,
  variants,
  as = motion.div,
  amount = 0.25,
  className,
}: {
  children: React.ReactNode;
  variants: Variants;
  as?: any;
  amount?: number; // fraction of element that must be visible
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start("show");
    else controls.start("hidden");
  }, [inView, controls]);

  const Comp = as;
  return (
    <Comp ref={ref} variants={variants} initial="hidden" animate={controls} className={className}>
      {children}
    </Comp>
  );
}
