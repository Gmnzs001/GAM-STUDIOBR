import { ImageResponse } from 'next/og'

export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt         = 'GAM Studio — Sua marca no próximo nível'

// Bricolage Grotesque (a fonte display do site). Sem rede, cai na fonte padrão.
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}`,
    ).then((r) => r.text())
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function Image() {
  const [regular, bold] = await Promise.all([loadFont(500), loadFont(800)])
  const fonts = [
    regular && { name: 'Bricolage', data: regular, weight: 500 as const, style: 'normal' as const },
    bold && { name: 'Bricolage', data: bold, weight: 800 as const, style: 'normal' as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f))

  return new ImageResponse(
    (
      <div
        style={{
          background:     '#f2f3f5',
          width:          '100%',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'space-between',
          padding:        '64px 72px',
          fontFamily:     fonts.length ? 'Bricolage' : 'sans-serif',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* O ponto da GAM, gigante, saindo pelo canto */}
        <div
          style={{
            position:     'absolute',
            right:        -140,
            bottom:       -170,
            width:        460,
            height:       460,
            borderRadius: 999,
            background:   '#e02020',
          }}
        />
        <div
          style={{
            position:     'absolute',
            right:        -230,
            bottom:       -260,
            width:        640,
            height:       640,
            borderRadius: 999,
            border:       '2px solid rgba(224,32,32,0.25)',
          }}
        />

        {/* Topo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: '-1px' }}>
            <span style={{ color: '#0e1015' }}>GAM</span>
            <span style={{ color: '#e02020', marginLeft: 10 }}>STUDIO</span>
          </div>
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '10px 20px',
              borderRadius: 999,
              background:   '#ffffff',
              border:       '1px solid #dde0e6',
              fontSize:     20,
              fontWeight:   500,
              color:        '#4a505c',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#e02020' }} />
            Goiânia, Brasil — atendemos BR, USA e EUR
          </div>
        </div>

        {/* Título */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ fontSize: 118, fontWeight: 800, color: '#0e1015', letterSpacing: '-5px', lineHeight: 0.95 }}>
            Sua marca no
          </div>
          <div style={{ display: 'flex', fontSize: 118, fontWeight: 800, color: '#0e1015', letterSpacing: '-5px', lineHeight: 0.95 }}>
            próximo nível<span style={{ color: '#e02020' }}>.</span>
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <div style={{ fontSize: 26, fontWeight: 500, color: '#4a505c' }}>
            Marketing, mídia e desenvolvimento digital desde 2020
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
