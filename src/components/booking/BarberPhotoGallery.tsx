'use client'

import { useState, useEffect } from 'react'
import type { BarberPhoto } from '@/types'

interface Props {
  barberId: string
  barberName: string
}

export function BarberPhotoGallery({ barberId, barberName }: Props) {
  const [photos, setPhotos] = useState<BarberPhoto[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/barbers/${barberId}/photos`)
      .then((r) => r.json())
      .then((d) => setPhotos(d.data ?? []))
  }, [barberId])

  if (photos.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Portfolio de {barberName}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setLightbox(p.url)}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? 'Photo'} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Photo agrandie"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
