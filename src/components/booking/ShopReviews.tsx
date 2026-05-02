'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface Review {
  id: string
  clientName: string
  rating: number
  comment: string | null
  createdAt: string
}

interface Props {
  shopId: string
}

export function ShopReviews({ shopId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [avg, setAvg] = useState<number | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch(`/api/reviews?shopId=${shopId}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.data?.reviews ?? [])
        setAvg(d.data?.averageRating ?? null)
        setTotal(d.data?.total ?? 0)
      })
  }, [shopId])

  if (total === 0) return null

  return (
    <div className="mt-6">
      {/* Aggregate */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${s <= Math.round(avg ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <span className="text-gray-900 font-bold">{avg?.toFixed(1)}</span>
        <span className="text-gray-400 text-sm">({total} avis)</span>
      </div>

      {/* Individual reviews */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {reviews.slice(0, 8).map((r) => (
          <div key={r.id} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">{r.clientName}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            {r.comment && <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
