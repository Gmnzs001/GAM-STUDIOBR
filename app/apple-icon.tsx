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
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          background:     '#0E0E10',
          borderRadius:   40,
          position:       'relative',
        }}
      >
        {/* Subtle red glow */}
        <div
          style={{
            position:     'absolute',
            top:          -30,
            right:        -30,
            width:        140,
            height:       140,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(224,32,32,0.20) 0%, transparent 70%)',
          }}
        />

        {/* "GAM" */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span
            style={{
              fontSize:      62,
              fontWeight:    900,
              color:         '#FFFFFF',
              lineHeight:    1,
              letterSpacing: '-2px',
            }}
          >
            GAM
          </span>
          <span
            style={{
              fontSize:      62,
              fontWeight:    900,
              color:         '#E02020',
              lineHeight:    1,
              letterSpacing: '-2px',
            }}
          >
            .
          </span>
        </div>

        {/* "STUDIO" label */}
        <div
          style={{
            fontSize:      13,
            fontWeight:    700,
            color:         '#E02020',
            letterSpacing: '0.35em',
            marginTop:     8,
          }}
        >
          STUDIO
        </div>
      </div>
    ),
    { ...size }
  )
}
