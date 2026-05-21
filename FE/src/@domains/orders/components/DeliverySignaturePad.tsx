import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

type DeliverySignaturePadProps = {
  value?: string | null
  onChange: (value: string | null) => void
  required?: boolean
}

type Point = {
  x: number
  y: number
}

const SIGNATURE_WIDTH = 720
const SIGNATURE_HEIGHT = 220

export const DeliverySignaturePad = ({ value, onChange, required = true }: DeliverySignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasInk, setHasInk] = useState(Boolean(value))
  const lastPointRef = useRef<Point | null>(null)

  const getContext = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return null
    }

    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#0f172a'
    return { canvas, context }
  }

  const getPoint = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIGNATURE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * SIGNATURE_HEIGHT,
    }
  }

  const syncSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    onChange(canvas.toDataURL('image/png'))
  }

  const clearSignature = () => {
    const drawing = getContext()
    if (!drawing) {
      return
    }

    drawing.context.clearRect(0, 0, drawing.canvas.width, drawing.canvas.height)
    lastPointRef.current = null
    setHasInk(false)
    onChange(null)
  }

  useEffect(() => {
    const drawing = getContext()
    if (!drawing || !value) {
      return
    }

    const image = new Image()
    image.onload = () => {
      drawing.context.clearRect(0, 0, drawing.canvas.width, drawing.canvas.height)
      drawing.context.drawImage(image, 0, 0, drawing.canvas.width, drawing.canvas.height)
      setHasInk(true)
    }
    image.src = value
  }, [value])

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
        <canvas
          ref={canvasRef}
          width={SIGNATURE_WIDTH}
          height={SIGNATURE_HEIGHT}
          role="img"
          aria-label="Delivery signature"
          className="h-[180px] w-full touch-none bg-white"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            setIsDrawing(true)
            setHasInk(true)
            lastPointRef.current = getPoint(event)
          }}
          onPointerMove={(event) => {
            if (!isDrawing) {
              return
            }

            const drawing = getContext()
            const previousPoint = lastPointRef.current
            const nextPoint = getPoint(event)

            if (!drawing || !previousPoint) {
              lastPointRef.current = nextPoint
              return
            }

            drawing.context.beginPath()
            drawing.context.moveTo(previousPoint.x, previousPoint.y)
            drawing.context.lineTo(nextPoint.x, nextPoint.y)
            drawing.context.stroke()
            lastPointRef.current = nextPoint
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId)
            setIsDrawing(false)
            lastPointRef.current = null
            syncSignature()
          }}
          onPointerCancel={() => {
            setIsDrawing(false)
            lastPointRef.current = null
            syncSignature()
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">
          {hasInk ? 'Signature captured' : required ? 'Signature required' : 'Signature optional'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-200"
          onClick={clearSignature}
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
