---
name: gam-studio-workflow
description: Convenções de trabalho da GAM Studio para builds web em Next.js. Use SEMPRE que estiver trabalhando no projeto gam-studio, criando ou editando seções/componentes do site, integrando componentes do 21st.dev, ou quando o usuário (Gustavo) pedir qualquer coisa relacionada ao site da GAM Studio. Esta skill economiza tokens e evita os erros mais comuns — use mesmo que o usuário não mencione explicitamente "GAM Studio" se o contexto for o projeto gam-studio.
---

# GAM Studio — Fluxo de Trabalho

Convenções para construir o site da GAM Studio em Next.js sem desperdiçar tokens e sem cometer os erros recorrentes.

## Regras de economia de token (LEIA PRIMEIRO)

1. **NÃO explore o projeto inteiro a cada tarefa.** A stack é fixa e conhecida: Next.js 16 (Turbopack), React 19, Tailwind v4, shadcn/ui, Framer Motion, GSAP, Three.js, Lenis. Não rode `ls -R`, não leia `node_modules`, não releia arquivos que já estão no contexto.

2. **NÃO recrie componentes que já existem.** Os componentes do 21st.dev ficam em `components/`. Se o usuário diz que já salvou um componente, USE o arquivo existente — apenas adapte conteúdo, cor e integração. Recriar do zero é o maior desperdício de token que existe aqui.

3. **Trabalhe UMA seção por vez e PARE para revisão.** Nunca construa o site inteiro de uma vez. Faça uma seção, mostre, espere aprovação ("ok", "aprovado", "continua") antes de avançar. Isso evita refazer 8 seções por causa de um erro na primeira.

4. **Não escreva specs/planos gigantes a menos que solicitado.** Um plano de 2000 linhas consome token sem necessidade para um site de uma página. Liste as seções em poucas linhas e parta para a execução.

5. **Leia só o arquivo da seção atual.** Se vai mexer no Hero, leia só o Hero e o `globals.css`. Não toque nos outros componentes.

## Stack fixa (não precisa verificar)

- Next.js 16 com Turbopack, App Router, sem `src/`
- React 19, TypeScript
- Tailwind v4 (usa `@import "tailwindcss"` no globals.css, SEM `tailwind.config.js`)
- shadcn/ui (componentes base em `components/ui/`)
- Framer Motion, GSAP (+ ScrollTrigger), Three.js, Lenis — todos já instalados
- Fonte: Inter (Google Font) + Geist via shadcn

## Arquitetura

- SPA (single page) — todas as seções numa rota só (`app/page.tsx`)
- `app/layout.tsx` envolve tudo com providers de Lenis (smooth scroll) e cursor customizado
- `app/page.tsx` controla o estado `loaded` que libera o conteúdo após a intro
- Componentes de seção em `components/`
- Delays de animação são relativos ao mount do componente, não ao load da página

## Identidade visual GAM Studio

- **Base:** preto suave `#0A0A0A`, superfícies em `#111111` com borda `#222222`. NUNCA preto total puro — o site não pode ficar sombrio demais.
- **Primária:** vermelho `#E02020` (vivo, energético — não sangue/gótico)
- **Texto:** branco `#FFFFFF` (principal) e cinza `#A0A0A0` (secundário)
- **Fundo:** sempre ter um leve movimento de luz/partículas para não ficar morto
- **Logo:** "GAM." com ponto vermelho (versão reduzida, usada na intro/loading) e "GAM STUDIO" com STUDIO em vermelho (navbar/footer)
- **Tom:** premium, vibrante, internacional. Referências: Linear.app, Stripe, sites Awwwards SOTD. Layout pode ser assimétrico, tipografia grande e bold. Evitar "site de agência genérico" com cards centralizados e simétricos.

## Conteúdo do site

**Navbar:** Início · Serviços · Portfólio · Sobre · Contato + botão "Faça seu orçamento" (sem login/signup).

**Hero:** "Sua marca no próximo nível" · subtexto "presença · estrutura · previsibilidade" · stats 120+ projetos / 98% satisfação / 5★ / 5+ anos / 3 países (BR, USA, EUR).

**Serviços** (carrossel infinito fluido, pausa no hover, itens clicáveis):
- Criação de Sites — Sites rápidos, modernos e feitos para converter.
- Consultoria em SEO — Seu negócio no topo do Google, de forma orgânica.
- Agentes IA — Atendimento e vendas automatizados 24h por dia.
- Google ADS — Anúncios que colocam sua marca na frente de quem importa.
- Landing Pages — Páginas de alta conversão para suas campanhas.
- Publicidade — Estratégias criativas que fazem sua marca ser lembrada.
- Redes Sociais — Gestão completa que constrói audiência e autoridade.
- Produção de Conteúdo — Conteúdo estratégico que engaja e converte.
- Branding — Identidade de marca memorável do conceito ao detalhe.
- Mídia — Planejamento e veiculação de mídia com foco em resultado.
- Eventos — Cobertura e produção de eventos com qualidade profissional.
- Consultoria Completa — Diagnóstico 360° para escalar seu negócio.

**Sobre:** agência de marketing, mídia e desenvolvimento digital, nascida em 2020. Atua no Brasil, EUA e Europa. Stats grandes e assimétricos.

**Cases:** com animação e fundo interativo / elemento 3D no hover. Categorias: Web, Marketing, Branding, Social Media.

**Depoimentos:** colunas animadas com os depoimentos reais (Carlos Mendonça, James O'Brien, Ana Ferreira, Rafael Souza, Mariana Costa, Pedro Alves, Sarah Mitchell, Thiago Lima).

**CTA:** serviços passando na tela + botão de orçamento.

**Footer:** botões de Instagram e WhatsApp (orçamento), crédito "feito por GAMStudioBR com ❤".

**Contatos:** WhatsApp `62992589599` (link no formato `https://api.whatsapp.com/send/?phone=5562992589599`), Instagram `@gamstudio.br`.

## Sequência da intro (cinematográfica)

1. Texto em partículas: "SEJA BEM-VINDO À SUA NOVA REALIDADE"
2. Partículas se reorganizam formando a logo "GAM."
3. Dissolve (fade) para o Hero

## Erros a NUNCA cometer

- Não aplicar overrides globais de CSS que quebrem o layout
- Não combinar várias seções numa tacada sem aprovação
- Não trocar a stack nem sugerir reinstalar libs já presentes
- Não usar `localStorage`/`sessionStorage`
- Em Tailwind v4, lembrar que NÃO existe `tailwind.config.js` — config vai no `globals.css`
- Não inventar conteúdo/serviços fora da lista acima
