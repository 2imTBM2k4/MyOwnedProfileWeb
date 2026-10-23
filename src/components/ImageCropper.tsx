'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react'

type Area = { x: number; y: number; width: number; height: number }

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.92))
}

type Props = {
  imageSrc: string
  aspect?: number
  onDone: (blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropper({ imageSrc, aspect = 3 / 1, onDone, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleDone = async () => {
    if (!croppedAreaPixels) return
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
    onDone(blob)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--page)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
        <span className="text-sm font-medium text-[var(--ink)]">Chỉnh vùng hiển thị</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Hủy cắt ảnh" className="text-[var(--secondary)] hover:text-[var(--ink)] hover:bg-[var(--panel)]">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid var(--highlight)' },
          }}
        />
      </div>

      {/* Zoom + confirm */}
      <div className="flex items-center justify-between gap-3 px-4 py-4 border-t border-[var(--line)] bg-[var(--page)]">
        <div className="flex items-center gap-3">
          <ZoomOut className="w-4 h-4 text-[var(--secondary)]" />
          <input
            type="range" min={1} max={3} step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-20 sm:w-32 accent-[var(--highlight)]"
            aria-label="Độ phóng to ảnh"
          />
          <ZoomIn className="w-4 h-4 text-[var(--secondary)]" />
        </div>
        <Button onClick={handleDone} className="bg-[var(--button)] hover:bg-[var(--button)] text-[var(--button-ink)] hover:opacity-90 gap-2">
          <Check className="w-4 h-4" /> Xác nhận
        </Button>
      </div>
    </div>
  )
}
