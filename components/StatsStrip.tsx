"use client";

import React from "react";
import { useInView } from "framer-motion";
import CountUp from "react-countup";

function Stat({ end, label }: { end: number; label: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

  return (
    <div
      ref={ref}
      className="text-center p-4 rounded-2xl bg-white border border-amber-200/70 shadow-sm hover:shadow-md transition-transform duration-300 hover:-translate-y-0.5"
    >
      {/* رقم متدرّج ذهبي */}
      <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-br from-[#f9d67a] via-[#f5cd82] to-[#f2b564] bg-clip-text text-transparent">
          {inView ? <CountUp end={end} duration={1.8} separator="," /> : 0}
        </span>
        <span className="text-amber-500 align-super">+</span>
      </div>

      <div className="text-xs md:text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Stat end={1200} label="Today Orders" />
      <Stat end={450} label="Happy Clints" />
      <Stat end={980} label="Available Products" />
      <Stat end={72} label="Brands" />
    </div>
  );
}
