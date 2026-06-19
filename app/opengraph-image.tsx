import { ImageResponse } from 'next/og'

export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     '#0A0A0A',
          width:          '100%',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     'sans-serif',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Subtle red grid */}
        <div
          style={{
            position:        'absolute',
            inset:           0,
            backgroundImage: 'linear-gradient(rgba(224,32,32,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(224,32,32,0.07) 1px, transparent 1px)',
            backgroundSize:  '60px 60px',
          }}
        />

        {/* Corner glow */}
        <div
          style={{
            position:  'absolute',
            top:       -120,
            right:     -120,
            width:     400,
            height:    400,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(224,32,32,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#E02020' }} />

        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 110, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-3px', lineHeight: 1 }}>
            GAM
          </span>
          <span style={{ fontSize: 110, fontWeight: 900, color: '#E02020', letterSpacing: '-3px', lineHeight: 1 }}>
            .
          </span>
        </div>

        {/* STUDIO label */}
        <div
          style={{
            fontSize:      18,
            fontWeight:    700,
            color:         '#E02020',
            letterSpacing: '0.55em',
            textTransform: 'uppercase',
            marginBottom:  48,
          }}
        >
          STUDIO
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 48, height: 1, background: 'rgba(224,32,32,0.4)' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E02020' }} />
          <div style={{ width: 48, height: 1, background: 'rgba(224,32,32,0.4)' }} />
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 30, fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: 14 }}>
          Sua marca no próximo nível
        </div>
        <div style={{ fontSize: 18, color: '#A0A0A0', textAlign: 'center' }}>
          Marketing · Mídia · Desenvolvimento Digital
        </div>

        {/* Region footer */}
        <div
          style={{
            position:      'absolute',
            bottom:        40,
            color:         '#444444',
            fontSize:      13,
            letterSpacing: '0.25em',
            fontWeight:    600,
          }}
        >
          BR · USA · EUR
        </div>

        {/* Bottom accent bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#E02020' }} />
      </div>
    ),
    { ...size }
  )
}
