'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ReviewPage() {
  const params = useParams()
  const appointmentId = params.appointmentId as string
  const t = useTranslations('review')
  const tCommon = useTranslations('common')

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/appointments/${appointmentId}/review`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setAlreadyReviewed(true) })
  }, [appointmentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError(t('ratingRequired')); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  if (alreadyReviewed) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-gray-900">{t('alreadySubmitted')}</h1>
          <p className="text-gray-500 text-sm mt-2">{t('alreadyThanks')}</p>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-3">🙏</div>
          <h1 className="text-2xl font-bold text-gray-900">{t('thanks')}</h1>
          <p className="text-gray-500 text-sm mt-2">{t('saved')}</p>
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">✂️</div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('comment')} <span className="text-gray-400">({t('optional')})</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={t('commentPlaceholder')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? t('submitting') : t('submit')}
          </button>
        </form>
      </div>
    </main>
  )
}
