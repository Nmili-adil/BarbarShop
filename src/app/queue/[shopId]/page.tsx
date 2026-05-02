'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function JoinQueuePage() {
  const params = useParams()
  const shopId = params.shopId as string
  const t = useTranslations('queue')
  const tCommon = useTranslations('common')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ position: number; estimatedWaitMins: number } | null>(null)
  const [error, setError] = useState('')

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId, clientName: name, clientPhone: phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">✂️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('youreIn')}</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-6">
            <p className="text-sm text-amber-700 mb-1">{t('position')}</p>
            <p className="text-5xl font-black text-amber-600">{result.position}</p>
          </div>
          <p className="text-gray-500 text-sm">
            {t('estimatedWait')} : <strong>~{result.estimatedWaitMins} min</strong>
          </p>
          {phone && (
            <p className="text-gray-400 text-xs mt-3">
              {t('whatsappNotice')}
            </p>
          )}
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

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('namePlaceholder')} *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phonePlaceholder')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('phonePlaceholder')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? tCommon('loading') : t('join')}
          </button>
        </form>
      </div>
    </main>
  )
}
