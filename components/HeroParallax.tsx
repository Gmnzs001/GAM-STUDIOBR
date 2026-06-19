"use client";
import React from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const HeroParallax = ({ products }: { products: { title: string; link: string; thumbnail: string }[] }) => {
  const firstRow  = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow  = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const springConfig      = { stiffness: 300, damping: 30, bounce: 100 };
  const translateX        = useSpring(useTransform(scrollYProgress, [0, 1], [0,  1000]), springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), springConfig);
  const rotateX  = useSpring(useTransform(scrollYProgress, [0, 0.2], [15,   0]), springConfig);
  const opacity  = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2,  1]), springConfig);
  const rotateZ  = useSpring(useTransform(scrollYProgress, [0, 0.2], [20,   0]), springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), springConfig);

  return (
    <div
      id="home"
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-[#0A0A0A]"
    >
      <Header />
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product, i) => (
            <ProductCard product={product} translate={translateX} key={`${product.title}-${i}`} priority />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((product, i) => (
            <ProductCard product={product} translate={translateXReverse} key={`${product.title}-${i}`} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product, i) => (
            <ProductCard product={product} translate={translateX} key={`${product.title}-${i}`} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => (
  <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
    <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
      Sua marca no <br />
      <span className="text-[#E02020]">próximo nível</span>
    </h1>
    <p className="max-w-2xl text-base md:text-xl mt-8 text-[#A0A0A0] leading-relaxed">
      presença · estrutura · previsibilidade — sites, marketing e presença digital que geram resultado de verdade.
    </p>
  </div>
);

export const ProductCard = ({
  product,
  translate,
  priority = false,
}: {
  product:   { title: string; link: string; thumbnail: string }
  translate: MotionValue<number>
  priority?: boolean
}) => {
  const isPlaceholder = !product.thumbnail.startsWith("http") && !product.thumbnail.startsWith("/");

  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link href={product.link} className="block h-full group-hover/product:shadow-2xl">
        {isPlaceholder ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-[#222222]" />
        ) : (
          <Image
            src={product.thumbnail}
            fill
            sizes="480px"
            className="object-cover object-left-top"
            alt={product.title}
            priority={priority}
          />
        )}
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none" />
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
