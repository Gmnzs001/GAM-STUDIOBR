// Conteúdo central do site GAM Studio.
// Todas as seções e páginas leem daqui — edite uma vez, atualiza em todo lugar.
import {
  Monitor, TrendingUp, Bot, Target, LayoutTemplate, Megaphone,
  Share2, PenLine, Palette, Film, Calendar, Compass, type LucideIcon,
} from 'lucide-react'

// ─── Domínio ──────────────────────────────────────────────────────────────────
// Troque pela URL definitiva antes do deploy (usada em metadata, sitemap, robots e JSON-LD)
export const SITE_URL = 'https://gamstudio.com.br'

// ─── Contato ──────────────────────────────────────────────────────────────────
export const WHATSAPP_NUMBER = '5562992589599'
export const WHATSAPP_DISPLAY = '62 99258-9599'
export const INSTAGRAM_HANDLE = '@gamstudio.br'
export const INSTAGRAM_URL = 'https://instagram.com/gamstudio.br'

/** Link do WhatsApp com mensagem pré-preenchida. */
export const waLink = (text = 'Olá! Vim pelo site e gostaria de fazer um orçamento.') =>
  `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`

export const WA_URL = waLink()

// Chave pública do Web3Forms (formulários de contato)
export const WEB3FORMS_KEY = '318470fc-e955-44fd-99f1-8fe61f0c6d34'

// ─── Navegação ────────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'Início',    href: '/'          },
  { label: 'Serviços',  href: '/servicos'  },
  { label: 'Portfólio', href: '/portfolio' },
  { label: 'Sobre',     href: '/sobre'     },
  { label: 'Contato',   href: '/contato'   },
] as const

// ─── Fundador ────────────────────────────────────────────────────────────────
export const FOUNDER = {
  name: 'Gustavo',
  role: 'Fundador da GAM Studio',
  photo: '/IMG_9468-scaled.webp',
  photoWidth: 1600,
  photoHeight: 1631,
}

// ─── Números ──────────────────────────────────────────────────────────────────
export type Stat = { value: number; prefix?: string; suffix: string; label: string; detail?: string }

export const STATS: Stat[] = [
  { value: 120, suffix: '+', label: 'projetos entregues' },
  { value: 98,  suffix: '%', label: 'clientes satisfeitos' },
  { value: 5,   suffix: '★', label: 'avaliação média' },
  { value: 5,   suffix: '+', label: 'anos de mercado' },
  { value: 3,   suffix: '',  label: 'países atendidos', detail: 'BR, USA e EUR' },
]

export const FOUNDED_YEAR = 2020
export const COUNTRIES = ['Brasil', 'Estados Unidos', 'Europa'] as const

// ─── Serviços ─────────────────────────────────────────────────────────────────
export type Service = {
  slug: string          // âncora em /servicos#slug
  name: string
  short: string         // frase curta (cards, carrossel)
  tagline: string
  description: string
  includes: string[]
  icon: LucideIcon
}

export const SERVICES: Service[] = [
  {
    slug: 'criacao-de-sites',
    name: 'Criação de Sites',
    short: 'Sites rápidos, modernos e feitos para converter.',
    tagline: 'Da arquitetura ao pixel perfeito',
    description:
      'Desenvolvemos sites e aplicações web com tecnologia de ponta — Next.js, React, performance máxima. Cada projeto é construído para converter, ranquear e escalar junto com o seu negócio.',
    includes: [
      'Design exclusivo e 100% responsivo',
      'Performance otimizada para Core Web Vitals',
      'Integração com CRM, analytics e automações',
      'Suporte e manutenção pós-lançamento',
    ],
    icon: Monitor,
  },
  {
    slug: 'seo',
    name: 'Consultoria em SEO',
    short: 'Seu negócio no topo do Google, de forma orgânica.',
    tagline: 'Autoridade orgânica que dura anos',
    description:
      'Seu negócio no topo do Google, de forma orgânica e duradoura. Estratégias de SEO técnico e de conteúdo que constroem autoridade real, atraem tráfego qualificado e geram resultados consistentes.',
    includes: [
      'Auditoria técnica completa do site',
      'Pesquisa de palavras-chave e análise de concorrentes',
      'Otimização de velocidade, estrutura e schema markup',
      'Relatórios mensais de posicionamento e tráfego',
    ],
    icon: TrendingUp,
  },
  {
    slug: 'agentes-ia',
    name: 'Agentes IA',
    short: 'Atendimento e vendas automatizados 24h por dia.',
    tagline: 'Vendas e atendimento 24h automáticos',
    description:
      'Automatize seu atendimento e vendas com Inteligência Artificial treinada no seu negócio. Nossos agentes respondem dúvidas, qualificam leads e fecham vendas enquanto você foca no que realmente importa.',
    includes: [
      'Agente treinado com o conhecimento da sua empresa',
      'Integração com WhatsApp, Instagram e site',
      'Qualificação automática de leads e follow-up',
      'Dashboard de métricas e análise de conversas',
    ],
    icon: Bot,
  },
  {
    slug: 'google-ads',
    name: 'Google ADS',
    short: 'Anúncios que colocam sua marca na frente de quem importa.',
    tagline: 'Anúncios que geram retorno real',
    description:
      'Gestão profissional de campanhas que colocam sua marca na frente de quem está pronto para comprar. Cada centavo investido é otimizado continuamente para maximizar conversões e retorno sobre anúncios.',
    includes: [
      'Criação e estruturação completa de campanhas',
      'Pesquisa estratégica de palavras-chave e públicos',
      'Otimização contínua de lances e criativos',
      'Relatórios detalhados de ROAS e conversões',
    ],
    icon: Target,
  },
  {
    slug: 'landing-pages',
    name: 'Landing Pages',
    short: 'Páginas de alta conversão para suas campanhas.',
    tagline: 'Páginas feitas para converter',
    description:
      'Criamos landing pages de alta conversão onde cada elemento — copy, design, hierarquia visual — é estratégico. Ideal para lançamentos, campanhas e funis de vendas que precisam performar no máximo.',
    includes: [
      'Copy persuasivo orientado a conversão',
      'Design otimizado para mobile-first',
      'Integração com ferramentas de rastreamento',
      'Testes A/B e otimização baseada em dados',
    ],
    icon: LayoutTemplate,
  },
  {
    slug: 'publicidade',
    name: 'Publicidade',
    short: 'Estratégias criativas que fazem sua marca ser lembrada.',
    tagline: 'Campanhas que ficam na memória',
    description:
      'Estratégias criativas que fazem sua marca ser lembrada e reconhecida. Planejamos e produzimos campanhas que combinam criatividade com dados para gerar alcance, reconhecimento e resultados mensuráveis.',
    includes: [
      'Conceito criativo e planejamento de campanha',
      'Produção de peças para múltiplos formatos',
      'Estratégia de distribuição e alcance de público',
      'Mensuração de impacto e brand awareness',
    ],
    icon: Megaphone,
  },
  {
    slug: 'redes-sociais',
    name: 'Redes Sociais',
    short: 'Gestão completa que constrói audiência e autoridade.',
    tagline: 'Presença que constrói autoridade',
    description:
      'Gestão completa do seu social media — do planejamento estratégico à criação de conteúdo e análise de métricas. Transformamos suas redes em canais reais de relacionamento, posicionamento e vendas.',
    includes: [
      'Planejamento estratégico de conteúdo mensal',
      'Criação de artes, vídeos e copy',
      'Gestão de comunidade e interações',
      'Relatórios de crescimento e engajamento',
    ],
    icon: Share2,
  },
  {
    slug: 'conteudo',
    name: 'Produção de Conteúdo',
    short: 'Conteúdo estratégico que engaja e converte.',
    tagline: 'Conteúdo que educa, engaja e converte',
    description:
      'Estratégia e produção de conteúdo que posiciona sua marca como referência no mercado. Do blog post otimizado para SEO ao vídeo para redes — conteúdo que trabalha 24h pelo seu negócio.',
    includes: [
      'Blog posts e artigos otimizados para SEO',
      'Vídeos para redes sociais e YouTube',
      'E-books, whitepapers e materiais ricos',
      'Roteiros, scripts e copy de vendas',
    ],
    icon: PenLine,
  },
  {
    slug: 'branding',
    name: 'Branding',
    short: 'Identidade de marca memorável do conceito ao detalhe.',
    tagline: 'Identidade que diferencia e permanece',
    description:
      'Uma identidade de marca memorável, do conceito visual ao posicionamento estratégico. Criamos marcas que comunicam valor com clareza, se diferenciam da concorrência e ficam na mente do público.',
    includes: [
      'Naming e estratégia de posicionamento',
      'Identidade visual completa (logo, paleta, tipografia)',
      'Manual de marca e guia de aplicação',
      'Brandbook e materiais de apresentação',
    ],
    icon: Palette,
  },
  {
    slug: 'midia',
    name: 'Mídia',
    short: 'Planejamento e veiculação de mídia com foco em resultado.',
    tagline: 'Os canais certos para o público certo',
    description:
      'Planejamento e veiculação de mídia com foco em resultado. Identificamos os melhores canais para o seu público, negociamos espaços e gerenciamos campanhas para maximizar alcance e ROI.',
    includes: [
      'Planejamento de mídia on e offline',
      'Negociação e compra de espaços publicitários',
      'Gestão de campanhas em múltiplos veículos',
      'Análise de performance e otimização de verba',
    ],
    icon: Film,
  },
  {
    slug: 'eventos',
    name: 'Eventos',
    short: 'Cobertura e produção de eventos com qualidade profissional.',
    tagline: 'Cada momento transformado em conteúdo',
    description:
      'Cobertura profissional e produção completa de eventos. Do planejamento de comunicação ao conteúdo pós-evento, garantimos que cada momento gere impacto real e duradouro para sua marca.',
    includes: [
      'Cobertura fotográfica e audiovisual profissional',
      'Conteúdo ao vivo para redes sociais',
      'Planejamento de comunicação pré e pós-evento',
      'Edição e entrega ágil de materiais',
    ],
    icon: Calendar,
  },
  {
    slug: 'consultoria',
    name: 'Consultoria Completa',
    short: 'Diagnóstico 360° para escalar seu negócio.',
    tagline: 'Diagnóstico 360° para escalar',
    description:
      'Análise profunda de toda a sua presença digital com um plano personalizado para escalar. Da estratégia à execução, trabalhamos ao lado da sua equipe para alcançar seus objetivos de negócio.',
    includes: [
      'Diagnóstico completo de presença digital',
      'Mapeamento de oportunidades e pontos de melhoria',
      'Plano estratégico integrado (90 dias, 6 meses, 1 ano)',
      'Acompanhamento e suporte na implementação',
    ],
    icon: Compass,
  },
]

// ─── Cases (home) ─────────────────────────────────────────────────────────────
export type CaseCategory = 'Web' | 'Marketing' | 'Branding' | 'Social Media'
export const CASE_CATEGORIES: CaseCategory[] = ['Web', 'Marketing', 'Branding', 'Social Media']

export type HomeCase = {
  id: number
  title: string
  category: CaseCategory
  description: string
  metric: { value: string; label: string }
}

export const HOME_CASES: HomeCase[] = [
  { id: 1, title: 'Clínica Estética Premium',  category: 'Web',          description: 'Landing page com 340% de aumento em conversões.',        metric: { value: '+340%', label: 'conversões' } },
  { id: 2, title: 'Marca de Moda Sustentável', category: 'Branding',     description: 'Identidade visual completa para marca eco-friendly.',    metric: { value: '360°',  label: 'identidade completa' } },
  { id: 3, title: 'E-commerce de Suplementos', category: 'Marketing',    description: 'R$120k em faturamento no 1º mês com Google ADS.',        metric: { value: 'R$120k', label: 'no 1º mês' } },
  { id: 4, title: 'Construtora Regional',      category: 'Web',          description: 'Site com geração de leads para 3 empreendimentos.',      metric: { value: '3',     label: 'empreendimentos' } },
  { id: 5, title: 'Restaurante Gourmet',       category: 'Social Media', description: '15k seguidores orgânicos em 90 dias.',                   metric: { value: '15k',   label: 'seguidores em 90 dias' } },
  { id: 6, title: 'Startup de Tecnologia',     category: 'Branding',     description: 'Branding completo para SaaS B2B + motion design.',       metric: { value: 'B2B',   label: 'branding + motion' } },
]

// ─── Depoimentos ──────────────────────────────────────────────────────────────
export type Testimonial = { name: string; role: string; text: string; region: 'BR' | 'USA' | 'EUR' }

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Carlos Mendonça', role: 'CEO, Clínica Estética Renovar', region: 'BR',
    text: 'A GAM Studio transformou nossa presença digital. Em 3 meses triplicamos os agendamentos online. Profissionalismo e resultados reais.' },
  { name: "James O'Brien", role: "Founder, O'Brien Consulting", region: 'USA',
    text: 'Exceptional work. They built our entire digital presence from scratch — website, ads and branding — and delivered above expectations every step.' },
  { name: 'Ana Ferreira', role: 'Diretora, Grupo Ferreira Imóveis', region: 'BR',
    text: 'O site que eles criaram gerou mais leads em 2 semanas do que nosso anterior em 2 anos. Investimento que se paga rápido.' },
  { name: 'Rafael Souza', role: 'Diretor Comercial, TechScale BR', region: 'BR',
    text: 'Campanha no Google ADS com ROI de 8x no primeiro mês. Equipe extremamente competente e comprometida com resultado.' },
  { name: 'Mariana Costa', role: 'Fundadora, Marca Eco Verde', region: 'BR',
    text: 'Eles entenderam nossa essência antes mesmo de começarmos a falar de design. A identidade visual ficou perfeita e nossa conversão subiu 200%.' },
  { name: 'Pedro Alves', role: 'Sócio, Construtora Alves & Lima', region: 'BR',
    text: 'Parceria sólida desde o início. A GAM cuida de tudo: site, redes e tráfego pago. Nosso CAC caiu 40% em seis meses.' },
  { name: 'Sarah Mitchell', role: 'CMO, Vistara Health', region: 'EUR',
    text: 'We needed an agency that understood both European and Brazilian markets. GAM Studio delivered a cohesive strategy that exceeded our KPIs.' },
  { name: 'Thiago Lima', role: 'CEO, Lima Suplementos', region: 'BR',
    text: 'R$120k em faturamento no primeiro mês com Google ADS. Não esperava resultados tão rápidos. Equipe séria e transparente.' },
]
