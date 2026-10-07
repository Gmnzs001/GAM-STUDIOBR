import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     '#f2f3f5',
          position:       'relative',
          overflow:       'hidden',
        }}
      >
        {/* Ponto da marca saindo pelo canto */}
        <div
          style={{
            position:     'absolute',
            right:        -50,
            bottom:       -50,
            width:        110,
            height:       110,
            borderRadius: 999,
            background:   '#e02020',
            opacity:      0.12,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#0e1015', lineHeight: 1, letterSpacing: '-3px' }}>
            GAM
          </span>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#e02020', lineHeight: 1 }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
