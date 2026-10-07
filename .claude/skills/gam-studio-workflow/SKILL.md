---
name: gam-studio-workflow
description: Convenções do site da GAM Studio (Next.js). Use SEMPRE que for criar ou editar páginas, seções ou componentes deste projeto, ou quando o Gustavo pedir qualquer coisa do site.
---

# GAM Studio — como trabalhar

## Economia de token
- Não explore o projeto. A stack é fixa: Next.js 16 (App Router, sem `src/`), React 19, TS, Tailwind v4 (config no `app/globals.css`, sem `tailwind.config`), Framer Motion, GSAP, Lenis, lucide-react.
- Leia só os arquivos da tarefa. Não recrie componentes que já existem: adapte.
- Uma seção por vez. Mostre e espere o "ok" antes de seguir.
- Nada de specs/planos longos, a não ser que ele peça.

## Onde fica cada coisa
- `lib/site.ts`: TODO o conteúdo (contatos, links WhatsApp/Instagram, serviços, stats, cases da home, depoimentos, fundador). Edite aqui, não nos componentes. Não invente conteúdo fora dele.
- `app/portfolio/PortfolioGallery.tsx`: cases da página Portfólio (`CASES`).
- `components/system/`: primitivos (`Reveal`, `RevealText`, `Kicker`/`SectionHeading`, `Button`, `SpotlightCard`, `CountUp`, `MarqueeBand`, `PageHero`, `Logo`, `AmbientBackground`).
- `components/`: seções da home. `app/<página>/`: páginas internas (abrem com `PageHero` e fecham com `Footer`).
- `lib/intro.tsx`: `useRevealed()`. Na home, Hero/Navbar esperam a intro terminar. `/?intro=0` pula a intro.
- `/dev-preview/system`: vitrine dos primitivos (bloqueada no robots, manter).

## Identidade visual (tema claro "Névoa")
- NUNCA voltar para fundo preto. Base `paper #f2f3f5`, cards `surface #fff`, bordas `line #dde0e6`. Texto `ink #0e1015` / `ink-2` / `ink-3`.
- Primária vermelha `red #e02020`. Bandas escuras (`night`) só em Cases e Footer; o CTA é uma banda vermelha.
- Fontes: Bricolage Grotesque (display, `.type-hero/.type-display/.type-title`), Geist (texto), Geist Mono (detalhes).
- Assinatura: o ponto vermelho. Títulos terminam com ponto vermelho (`RevealText dot`), cada seção abre com `Kicker`.
- Tom: premium e vivo (Linear, Stripe, Awwwards).

## Nunca
- Overrides globais de CSS que quebrem layout.
- `localStorage`/`sessionStorage`.
- Trocar a stack ou reinstalar libs.

## Fechar uma tarefa
- `npx tsc --noEmit && npm run lint && npm run build` precisam passar.
- CSS novo não aparece no dev? Pare o dev, apague `.next/dev` e suba de novo.
- Publicar = commit + `git push origin main` no repositório `Gmnzs001/GAM-STUDIOBR`.
