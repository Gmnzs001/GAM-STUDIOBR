import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Point = { x: number; y: number };
interface WaveConfig { offset: number; amplitude: number; frequency: number; color: string; opacity: number; }

const containerVariants: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.12 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

export function GlowyWavesHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    let animationId: number;
    let time = 0;

    const waves: WaveConfig[] = [
      { offset: 0, amplitude: 70, frequency: 0.003, color: "rgba(224, 32, 32, 0.8)", opacity: 0.45 },
      { offset: Math.PI / 2, amplitude: 90, frequency: 0.0026, color: "rgba(224, 32, 32, 0.6)", opacity: 0.35 },
      { offset: Math.PI, amplitude: 60, frequency: 0.0034, color: "rgba(255, 100, 100, 0.5)", opacity: 0.3 },
      { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: "rgba(255, 255, 255, 0.2)", opacity: 0.25 },
      { offset: Math.PI * 2, amplitude: 55, frequency: 0.004, color: "rgba(255, 255, 255, 0.15)", opacity: 0.2 },
    ];

    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const recenterMouse = () => { const c = { x: canvas.width / 2, y: canvas.height / 2 }; mouseRef.current = c; targetMouseRef.current = c; };
    const handleResize = () => { resizeCanvas(); recenterMouse(); };
    const handleMouseMove = (e: MouseEvent) => { targetMouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseLeave = () => { recenterMouse(); };

    resizeCanvas(); recenterMouse();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const drawWave = (wave: WaveConfig) => {
      ctx.save(); ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x; const dy = canvas.height / 2 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / 320);
        const mouseEffect = influence * 70 * Math.sin(time * 0.001 + x * 0.01 + wave.offset);
        const y = canvas.height / 2 + Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude + Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) + mouseEffect;
        if (x === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
      }
      ctx.lineWidth = 2.5; ctx.strokeStyle = wave.color; ctx.globalAlpha = wave.opacity; ctx.shadowBlur = 35; ctx.shadowColor = wave.color; ctx.stroke(); ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.1;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0A0A0A"); gradient.addColorStop(1, "#0A0A0A");
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      waves.forEach(drawWave);
      animationId = window.requestAnimationFrame(animate);
    };
    animationId = window.requestAnimationFrame(animate);
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseleave", handleMouseLeave); cancelAnimationFrame(animationId); };
  }, []);

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0A0A]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
          <motion.h1 variants={itemVariants} className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
            Sua marca no <span className="text-[#E02020]">próximo nível</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 tracking-widest uppercase">
            presença · estrutura · previsibilidade
          </motion.p>
          <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-[#E02020] hover:bg-[#c01010] text-white rounded-full px-8">Faça seu orçamento <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10">Ver portfólio</Button>
          </motion.div>
          <motion.div variants={itemVariants} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-3">
            {[{ label: "Projetos entregues", value: "120+" }, { label: "Clientes satisfeitos", value: "98%" }, { label: "Países de atuação", value: "3" }].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-xs uppercase tracking-[0.3em] text-gray-500">{stat.label}</div>
                <div className="text-3xl font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
