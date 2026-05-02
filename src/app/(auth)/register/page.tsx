'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Registration failed')
      // Auto sign-in by redirecting to login
      router.push('/login?registered=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/5 border border-white/10 backdrop-blur rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">Create your shop</h1>
        <p className="text-gray-400 text-sm mb-8">Start your 14-day free trial — no card needed</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Shop Name</Label>
            <Input
              id="shopName"
              name="shopName"
              placeholder="King Cuts Barbershop"
              value={form.shopName}
              onChange={handleChange}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-amber-500"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Your Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              placeholder="Marcus Johnson"
              value={form.ownerName}
              onChange={handleChange}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-amber-500"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-amber-500"
              required
            />
          </div>
          <div>
            <Label className="text-gray-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-amber-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
