'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, XCircle, Phone, Clock } from 'lucide-react'

interface WalkInEntry {
  id: string
  clientName: string
  clientPhone: string | null
  position: number
  status: 'WAITING' | 'IN_PROGRESS'
  joinedAt: string
}

function waitTime(joinedAt: string): string {
  const mins = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 60000)
  if (mins < 1) return 'À l\'instant'
  return `${mins} min`
}

export default function QueuePage() {
  const [queue, setQueue] = useState<WalkInEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    const res = await fetch('/api/queue')
    const data = await res.json()
    setQueue(data.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQueue()
    // Fetch shop ID for QR link
    fetch('/api/shops/me').then(r => r.json()).then(d => setShopId(d.data?.id))
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30_000)
    return () => clearInterval(interval)
  }, [fetchQueue])

  async function updateStatus(id: string, status: 'IN_PROGRESS' | 'DONE' | 'CANCELLED') {
    await fetch(`/api/queue/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchQueue()
  }

  const waiting = queue.filter((w) => w.status === 'WAITING')
  const inProgress = queue.filter((w) => w.status === 'IN_PROGRESS')

  const qrUrl = shopId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/queue/${shopId}`
    : null

  return (
    <div className="p-6 space-y-6">
      <Header
        title="File d'attente"
        subtitle={`${queue.length} client${queue.length !== 1 ? 's' : ''} en attente`}
      />

      {/* QR Code link */}
      {qrUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Lien pour rejoindre la file</p>
            <p className="text-xs text-amber-600 mt-0.5 break-all">{qrUrl}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(qrUrl)}
            className="shrink-0 ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Copier
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">File vide</p>
          <p className="text-sm mt-1">Les clients peuvent rejoindre via le lien ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                En cours
              </h3>
              <div className="space-y-2">
                {inProgress.map((w) => (
                  <QueueCard
                    key={w.id}
                    entry={w}
                    onDone={() => updateStatus(w.id, 'DONE')}
                    onCancel={() => updateStatus(w.id, 'CANCELLED')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Waiting */}
          {waiting.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                En attente ({waiting.length})
              </h3>
              <div className="space-y-2">
                {waiting.map((w) => (
                  <QueueCard
                    key={w.id}
                    entry={w}
                    onCall={() => updateStatus(w.id, 'IN_PROGRESS')}
                    onCancel={() => updateStatus(w.id, 'CANCELLED')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QueueCard({
  entry,
  onCall,
  onDone,
  onCancel,
}: {
  entry: WalkInEntry
  onCall?: () => void
  onDone?: () => void
  onCancel?: () => void
}) {
  const isInProgress = entry.status === 'IN_PROGRESS'

  return (
    <div className={`bg-white rounded-2xl border px-5 py-4 flex items-center gap-4 ${isInProgress ? 'border-amber-300 bg-amber-50' : 'border-gray-100'}`}>
      <div className={`text-2xl font-black w-10 text-center ${isInProgress ? 'text-amber-600' : 'text-gray-300'}`}>
        {entry.position}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{entry.clientName}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
          {entry.clientPhone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {entry.clientPhone}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {waitTime(entry.joinedAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={isInProgress ? 'success' : 'pending'}>
          {isInProgress ? 'En cours' : 'Attente'}
        </Badge>
        {onCall && (
          <Button size="sm" onClick={onCall} className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs">
            Appeler
          </Button>
        )}
        {onDone && (
          <Button size="sm" variant="outline" onClick={onDone} className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terminé
          </Button>
        )}
        {onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel} className="text-red-500 border-red-200 hover:bg-red-50 h-8 text-xs">
            <XCircle className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
