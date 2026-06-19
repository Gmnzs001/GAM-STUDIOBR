'use client'

import React, { useEffect, useRef } from 'react'

const vsSource = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`

// GAM Studio palette: #0A0A0A bg, #FFFFFF lines (white test variant)
const fsSource = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  const float overallSpeed      = 0.2;
  const float gridSmoothWidth   = 0.015;
  const float axisWidth         = 0.05;
  const float majorLineWidth    = 0.025;
  const float minorLineWidth    = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const float scale             = 5.0;
  const vec4  lineColor         = vec4(1.0, 1.0, 1.0, 1.0); /* #FFFFFF — white test */
  const float minLineWidth      = 0.01;
  const float maxLineWidth      = 0.2;
  const float lineSpeed         = 1.0 * overallSpeed;
  const float lineAmplitude     = 1.0;
  const float lineFrequency     = 0.2;
  const float warpSpeed         = 0.2 * overallSpeed;
  const float warpFrequency     = 0.5;
  const float warpAmplitude     = 1.0;
  const float offsetFrequency   = 0.5;
  const float offsetSpeed       = 1.33 * overallSpeed;
  const float minOffsetSpread   = 0.6;
  const float maxOffsetSpread   = 2.0;
  const int   linesPerGroup     = 16;

  #define drawCircle(pos, radius, coord)   smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, hw, t)       smoothstep(hw, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, hw, t)        smoothstep(hw + gridSmoothWidth, hw, abs(pos - (t)))
  #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float hFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * hFade * lineAmplitude + offset;
  }

  void main() {
    vec2 uv    = gl_FragCoord.xy / iResolution.xy;
    vec2 space = (gl_FragCoord.xy - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float hFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float vFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + hFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * hFade;

    vec4 lines = vec4(0.0);
    /* Background: neutral dark #0A0A0A → #101010 */
    vec4 bgColor1 = vec4(0.039, 0.039, 0.039, 1.0);
    vec4 bgColor2 = vec4(0.063, 0.063, 0.063, 1.0);

    for (int l = 0; l < linesPerGroup; l++) {
      float nli         = float(l) / float(linesPerGroup);
      float offsetTime  = iTime * offsetSpeed;
      float offsetPos   = float(l) + space.x * offsetFrequency;
      float rand        = random(offsetPos + offsetTime) * 0.5 + 0.5;
      float halfWidth   = mix(minLineWidth, maxLineWidth, rand * hFade) / 2.0;
      float offset      = random(offsetPos + offsetTime * (1.0 + nli)) * mix(minOffsetSpread, maxOffsetSpread, hFade);
      float linePos     = getPlasmaY(space.x, hFade, offset);
      float line        = drawSmoothLine(linePos, halfWidth, space.y) / 2.0
                        + drawCrispLine(linePos, halfWidth * 0.15, space.y);

      float circleX        = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2  circlePosition = vec2(circleX, getPlasmaY(circleX, hFade, offset));
      float circle         = drawCircle(circlePosition, 0.01, space) * 4.0;

      lines += (line + circle) * lineColor * rand;
    }

    vec4 col  = mix(bgColor1, bgColor2, uv.x);
    col      *= vFade;
    col.a     = 1.0;
    col      += lines;

    gl_FragColor = col;
  }
`

const ShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    // --- compile helper ---
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl.VERTEX_SHADER,   vsSource)
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    // --- geometry ---
    const posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'aVertexPosition')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uRes  = gl.getUniformLocation(program, 'iResolution')
    const uTime = gl.getUniformLocation(program, 'iTime')

    // --- resize: getBoundingClientRect gives the actual rendered pixel size ---
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const w = Math.round(width)
      const h = Math.round(height)
      if (!w || !h) return
      canvas.width  = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }

    // Observe canvas directly; first resize deferred one frame so layout is committed
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    requestAnimationFrame(resize)

    // --- render loop ---
    const start = performance.now()
    let rafId: number

    const render = () => {
      rafId = requestAnimationFrame(render)
      const t = (performance.now() - start) / 1000
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 block" style={{ width: '100%', height: '100%' }} />
}

export default ShaderBackground
