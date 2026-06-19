"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type Product = { title: string; link: string; thumbnail: string }

// ── Shared image renderer ─────────────────────────────────────────────────────
function ProductImage({
  product, sizes, priority,
}: { product: Product; sizes: string; priority?: boolean }) {
  const isPlaceholder =
    !product.thumbnail.startsWith("http") && !product.thumbnail.startsWith("/");
  return isPlaceholder ? (
    <div className="absolute inset-0 bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-[#222222]" />
  ) : (
    <Image
      src={product.thumbnail}
      fill
      sizes={sizes}
      className="object-cover object-left-top"
      alt={product.title}
      priority={priority}
    />
  );
}

// ── Desktop card (unchanged) ──────────────────────────────────────────────────
export const ProductCard = ({
  product, translate, priority = false,
}: {
  product: Product; translate: MotionValue<number>; priority?: boolean
}) => {
  const isPlaceholder =
    !product.thumbnail.startsWith("http") && !product.thumbnail.startsWith("/");
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link href={product.link} className="block h-full group-hover/product:shadow-2xl">
        <ProductImage product={product} sizes="480px" priority={priority} />
      </Link>
      <div className="absolute inset-0 opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none" />
      <h2
        className={`absolute bottom-4 left-4 text-white font-semibold text-sm tracking-wide transition-opacity duration-300 ${
          isPlaceholder ? "opacity-35" : "opacity-0 group-hover/product:opacity-100"
        }`}
      >
        {product.title}
      </h2>
    </motion.div>
  );
};

// ── Mobile card (72 vw wide, 4:3, no transforms) ─────────────────────────────
const MobileCard = ({ product, priority = false }: { product: Product; priority?: boolean }) => (
  <Link
    href={product.link}
    className="relative flex-shrink-0 rounded-2xl overflow-hidden border border-[#1E1E1E] block"
    style={{ width: "72vw", aspectRatio: "4/3" }}
  >
    <ProductImage product={product} sizes="72vw" priority={priority} />
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    <span className="absolute bottom-3 left-3 text-white text-xs font-semibold drop-shadow">
      {product.title}
    </span>
  </Link>
);

// ── Header (responsive font via clamp) ───────────────────────────────────────
export const Header = () => (
  <div className="max-w-7xl relative mx-auto py-16 md:py-40 px-4 w-full">
    <h1
      className="font-black text-white leading-[1.05] tracking-tight"
      style={{ fontSize: "clamp(2.1rem, 9vw, 5.5rem)" }}
    >
      Sua marca no <br />
      <span className="text-[#E02020]">próximo nível</span>
    </h1>
    <p className="max-w-2xl text-sm md:text-xl mt-6 text-[#A0A0A0] leading-relaxed">
      presença · estrutura · previsibilidade — sites, marketing e presença digital que geram
      resultado de verdade.
    </p>
  </div>
);

// ── Main export ───────────────────────────────────────────────────────────────
export const HeroParallax = ({ products }: { products: Product[] }) => {
  const firstRow  = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow  = products.slice(10, 15);

  const desktopRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ["start start", "end start"],
  });

  const springConfig      = { stiffness: 300, damping: 30, bounce: 100 };
  const translateX        = useSpring(useTransform(scrollYProgress, [0, 1], [0,  1000]), springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), springConfig);
  const rotateX           = useSpring(useTransform(scrollYProgress, [0, 0.2], [15,   0]), springConfig);
  const opacity           = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2,  1]), springConfig);
  const rotateZ           = useSpring(useTransform(scrollYProgress, [0, 0.2], [20,   0]), springConfig);
  const translateY        = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), springConfig);

  return (
    <div id="home" className="bg-[#0A0A0A] overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP (≥ 1024px) — full 3D parallax, unchanged
      ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={desktopRef}
        className="hidden lg:block h-[300vh] py-40 overflow-hidden antialiased relative [perspective:1000px] [transform-style:preserve-3d]"
      >
        <Header />
        <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
          <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
            {firstRow.map((p, i) => (
              <ProductCard product={p} translate={translateX} key={`d1-${i}`} priority />
            ))}
          </motion.div>
          <motion.div className="flex flex-row mb-20 space-x-20">
            {secondRow.map((p, i) => (
              <ProductCard product={p} translate={translateXReverse} key={`d2-${i}`} />
            ))}
          </motion.div>
          <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
            {thirdRow.map((p, i) => (
              <ProductCard product={p} translate={translateX} key={`d3-${i}`} />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE (< 1024px) — no 3D, two touch-scroll rows
      ══════════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden pb-14">
        <Header />

        <div className="flex flex-col gap-3 mt-2">
          {/* Row 1 — left → right */}
          <div
            className="flex gap-3 overflow-x-auto pl-4"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
          >
            {firstRow.map((p, i) => (
              <div key={`m1-${i}`} style={{ scrollSnapAlign: "start" }}>
                <MobileCard product={p} priority={i === 0} />
              </div>
            ))}
            {/* right breathing room */}
            <div style={{ minWidth: "1rem", flexShrink: 0 }} />
          </div>

          {/* Row 2 — right → left (reversed order so it mirrors the desktop look) */}
          <div
            className="flex gap-3 overflow-x-auto pl-4"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
          >
            {[...secondRow].reverse().map((p, i) => (
              <div key={`m2-${i}`} style={{ scrollSnapAlign: "start" }}>
                <MobileCard product={p} />
              </div>
            ))}
            <div style={{ minWidth: "1rem", flexShrink: 0 }} />
          </div>
        </div>

        {/* Subtle scroll hint */}
        <p className="text-center text-[#333333] text-[10px] uppercase tracking-[0.3em] mt-6">
          deslize para ver mais
        </p>
      </div>

    </div>
  );
};
