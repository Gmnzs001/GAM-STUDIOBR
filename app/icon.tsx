import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:          '100%',
          height:         '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     '#0E0E10',
          borderRadius:   6,
          position:       'relative',
        }}
      >
        {/* "G" bold white */}
        <span
          style={{
            fontSize:   18,
            fontWeight: 900,
            color:      '#FFFFFF',
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          G
        </span>
        {/* Red dot — brand signature */}
        <div
          style={{
            position:     'absolute',
            bottom:       5,
            right:        5,
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   '#E02020',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
