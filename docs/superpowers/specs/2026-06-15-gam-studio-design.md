# GAM Studio — Design Spec
Date: 2026-06-15

## Overview
Site institucional completo da GAM Studio em Next.js 16, com experiência visual cinematográfica. Foco nos primeiros 5 segundos: loading screen + hero imersivo com partículas 3D.

## Identidade Visual
- Background: `#0A0A0A`
- Primary (vermelho): `#E02020`
- White: `#FFFFFF`
- Secondary text: `#A0A0A0`
- Card surface: `#111111`, border `#222222`
- Gradient: `#0A0A0A` → `#1A0000`
- Vibe: premium, vibrante, internacional — não dark/gótico

## Logo
- **Loading / favicon:** "GAM." — "GAM" branco bold + "." vermelho pulsante
- **Navbar:** "GAM STUDIO" — "GAM" branco bold + " STUDIO" vermelho bold
- Implementação: SVG inline em código, sem arquivo de imagem

## Tipografia
- Fonte principal: Inter (Google Fonts)
- Headings: Inter ExtraBold (800)
- Body: Inter Regular (400)
- Accent: Inter SemiBold (600)

## Slogan
- Principal: "SUA MARCA NO PRÓXIMO NÍVEL"
- Sub: "presença · estrutura · previsibilidade"
- Localização: Goiânia · Brasil · Atua em BR, USA, EUR

## Seções (em ordem)
1. **LoadingScreen** — "GAM." com ponto vermelho pulsante, 2s, GSAP, desmonta com fade out
2. **Navbar** — transparente → glassmorphism ao scroll 10px; links: Serviços, Sobre, Cases, Depoimentos, Contato
3. **Hero** — canvas Three.js (partículas brancas/vermelhas reagindo ao mouse), texto scramble GSAP, CTA pulsante
4. **Services** — 6 cards com ícone animado, borda vermelha ao hover
5. **About** — parallax + contadores animados (120+ projetos, 98% satisfação, 5+ anos, 3 países)
6. **Cases** — grid com filtro animado, hover revela detalhes
7. **Testimonials** — carrossel com fade entre slides
8. **CTASSection** — gradiente animado + formulário clean
9. **Footer** — minimalista, vermelho sutil

## Serviços
1. Website & Landing Page
2. Google ADS & Meta ADS
3. Branding & Identidade Visual
4. SEO & Tráfego Orgânico
5. Social Media
6. Agentes de IA

## Stats
- 120+ projetos
- 98% satisfação
- 5+ anos
- 3 países

## Contato
- WhatsApp: 62981147673
- Email: contato@gamstudio.com

## Arquitetura
- **Padrão:** Single Page Application com scroll suave (Opção A aprovada)
- **Roteamento:** âncoras `#secao` apenas
- **Rendering:** todo client-side (`'use client'` em todos os componentes interativos)

### Estrutura de arquivos
```
app/
  globals.css
  layout.tsx        ← providers: Lenis + cursor
  page.tsx          ← orquestra seções
components/
  LoadingScreen.tsx
  Navbar.tsx
  Hero.tsx
  Services.tsx
  About.tsx
  Cases.tsx
  Testimonials.tsx
  CTASection.tsx
  Footer.tsx
  CustomCursor.tsx
  SectionDivider.tsx
lib/
  utils.ts          ← cn() helper
```

## Animações Obrigatórias
- **Lenis:** smooth scroll em toda a página
- **Cursor customizado:** círculo vermelho com delay (lag segue o mouse)
- **Navbar:** transparente → `backdrop-blur` glassmorphism ao scrollar 10px
- **Scroll reveal:** Framer Motion `useInView` em todas as seções
- **Contadores:** 0 → valor final ao entrar na viewport
- **Linhas vermelhas:** separadores de seção animados
- **Cards hover:** `scale(1.02)` + `box-shadow` vermelho nas bordas
- **Texto gradiente:** vermelho→branco em palavras-chave

## Bibliotecas e Uso
| Biblioteca | Uso |
|---|---|
| Three.js | Partículas 3D no hero, react ao mouse |
| GSAP | Loading screen, scramble de texto |
| Framer Motion | Scroll reveals, transições de componente |
| Lenis | Smooth scroll global |
| shadcn/ui | Componentes base (Button, Input, etc.) |
| Tailwind v4 | Estilização — sem tailwind.config.js |

## Next.js 16 — Considerações
- Turbopack ativo por padrão
- Todos os componentes interativos com `'use client'`
- Tailwind v4: `@import "tailwindcss"` sem arquivo de config
- `@theme inline` no globals.css para variáveis customizadas
- Fonts via `next/font/google`

## Ordem de Build
1. `globals.css` — variáveis de cor, fonte Inter, utilitários
2. `layout.tsx` — Lenis provider, cursor, metadata GAM Studio
3. `LoadingScreen.tsx` — GSAP, "GAM." pulsante
4. `Hero.tsx` — Three.js partículas + scramble
5. Seções restantes uma a uma
6. Integração final em `page.tsx`
