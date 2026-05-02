import Link from 'next/link'
import Image from 'next/image'
import {
  Scissors,
  Bell,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

export default async function LandingPage() {
  const t = await getTranslations('landing')
  const tc = await getTranslations('common')

  const features = [
    {
      icon: Smartphone,
      title: t('features.f1Title'),
      desc: t('features.f1Desc'),
    },
    {
      icon: Bell,
      title: t('features.f2Title'),
      desc: t('features.f2Desc'),
    },
    {
      icon: BarChart3,
      title: t('features.f3Title'),
      desc: t('features.f3Desc'),
    },
    {
      icon: Users,
      title: t('features.f4Title'),
      desc: t('features.f4Desc'),
    },
    {
      icon: Clock,
      title: t('features.f5Title'),
      desc: t('features.f5Desc'),
    },
    {
      icon: BarChart3,
      title: t('features.f6Title'),
      desc: t('features.f6Desc'),
    },
  ]

  const plans = [
    {
      name: t('pricing.starter.name'),
      price: 299,
      desc: t('pricing.starter.desc'),
      features: [
        t('pricing.starter.f1'),
        t('pricing.starter.f2'),
        t('pricing.starter.f3'),
        t('pricing.starter.f4'),
        t('pricing.starter.f5'),
      ],
      cta: t('pricing.startFreeTrial'),
      highlighted: false,
    },
    {
      name: t('pricing.pro.name'),
      price: 499,
      desc: t('pricing.pro.desc'),
      features: [
        t('pricing.pro.f1'),
        t('pricing.pro.f2'),
        t('pricing.pro.f3'),
        t('pricing.pro.f4'),
        t('pricing.pro.f5'),
      ],
      cta: t('pricing.startFreeTrial'),
      highlighted: true,
    },
    {
      name: t('pricing.business.name'),
      price: 799,
      desc: t('pricing.business.desc'),
      features: [
        t('pricing.business.f1'),
        t('pricing.business.f2'),
        t('pricing.business.f3'),
        t('pricing.business.f4'),
        t('pricing.business.f5'),
      ],
      cta: t('pricing.contactSales'),
      highlighted: false,
    },
  ]

  const stylePhotos = [
    { src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&auto=format&fit=crop&q=80', label: 'Skin Fade' },
    { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80', label: 'Classic Cut' },
    { src: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&auto=format&fit=crop&q=80', label: 'Beard Trim' },
    { src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop&q=80', label: 'Taper Fade' },
    { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80', label: 'Line Up' },
    { src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&auto=format&fit=crop&q=80', label: 'The Shop' },
  ]

  const testimonials = [
    {
      name: 'Marcus Johnson',
      shop: 'King Cuts Barbershop, Atlanta',
      quote: t('testimonials.t1Quote'),
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Diego Ramirez',
      shop: "Diego's Classic Cuts, Miami",
      quote: t('testimonials.t2Quote'),
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Tariq Williams',
      shop: 'The Fade Factory, Chicago',
      quote: t('testimonials.t3Quote'),
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    },
  ]

  const mockupStats = [
    { label: t('mockup.today'), value: '8' },
    { label: t('mockup.thisWeek'), value: '42' },
    { label: t('mockup.pending'), value: '3' },
    { label: t('mockup.revenue'), value: '$1,240' },
  ]

  const problemCards = [
    { icon: '📵', title: t('problem.p1Title'), desc: t('problem.p1Desc') },
    { icon: '😤', title: t('problem.p2Title'), desc: t('problem.p2Desc') },
    { icon: '📋', title: t('problem.p3Title'), desc: t('problem.p3Desc') },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">BarberBook</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">{t('nav.features')}</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">{t('nav.pricing')}</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">{t('nav.reviews')}</a>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t('nav.startFreeTrial')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl" />
        </div>

        {/* Floating barber photos – decorative, xl+ only */}
        <div className="hidden xl:flex absolute left-4 top-28 flex-col gap-4 z-10">
          <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 rotate-[-5deg] opacity-80">
            <Image src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&auto=format&fit=crop&q=80" alt="Barber at work" width={128} height={160} className="object-cover w-full h-full" />
          </div>
          <div className="w-28 h-36 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 rotate-[4deg] opacity-70 ml-6">
            <Image src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&auto=format&fit=crop&q=80" alt="Skin fade" width={112} height={144} className="object-cover w-full h-full" />
          </div>
        </div>
        <div className="hidden xl:flex absolute right-4 top-28 flex-col gap-4 z-10">
          <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 rotate-[5deg] opacity-80">
            <Image src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80" alt="Classic cut" width={128} height={160} className="object-cover w-full h-full" />
          </div>
          <div className="w-28 h-36 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 rotate-[-4deg] opacity-70 mr-6">
            <Image src="https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=300&auto=format&fit=crop&q=80" alt="Beard trim" width={112} height={144} className="object-cover w-full h-full" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight text-balance">
            {t('hero.titleStart')}{' '}
            <span className="gradient-text">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="w-full sm:w-auto shadow-2xl shadow-amber-500/30">
                {t('hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-gray-700 text-white hover:bg-gray-800 hover:text-white bg-transparent">
                {t('hero.ctaSecondary')}
              </Button>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('hero.trust1')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('hero.trust2')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {t('hero.trust3')}
            </span>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-4xl mx-auto mt-20 relative">
          <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gray-900/80 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-gray-500 text-xs">barberbook.app/dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-4 gap-3">
              {[
                { label: t('mockup.today'), value: '8' },
                { label: t('mockup.thisWeek'), value: '42' },
                { label: t('mockup.pending'), value: '3' },
                { label: t('mockup.revenue'), value: '$1,240' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 space-y-2">
              {[
                { name: 'James Carter', service: 'Haircut + Beard', time: '9:00 AM', confirmed: true },
                { name: 'Devon Mills', service: 'Skin Fade', time: '10:00 AM', confirmed: true },
                { name: 'Marcus Lee', service: 'Beard Trim', time: '10:30 AM', confirmed: false },
              ].map((appt) => (
                <div key={appt.name} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-semibold">{appt.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{appt.service}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-300 text-xs">{appt.time}</div>
                    <div className={`text-xs mt-0.5 font-medium ${appt.confirmed ? 'text-green-400' : 'text-amber-400'}`}>
                      {appt.confirmed ? t('mockup.confirmed') : t('mockup.pending')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Styles Gallery */}
      <section className="py-14 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-gray-400 text-xs font-semibold uppercase tracking-[0.25em] mb-10">
            Styles your clients will love
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stylePhotos.map(({ src, label }) => (
              <div key={label} className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-default">
                <Image
                  src={src}
                  alt={label}
                  fill
                  sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white text-xs font-bold tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900">{t('problem.title')}</h2>
            <p className="mt-3 text-gray-500 text-lg">
              {t('problem.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📵', title: t('problem.p1Title'), desc: t('problem.p1Desc') },
              { icon: '😤', title: t('problem.p2Title'), desc: t('problem.p2Desc') },
              { icon: '📋', title: t('problem.p3Title'), desc: t('problem.p3Desc') },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900">{t('features.title')}</h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-8 rounded-3xl border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-amber-500 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">{t('pricing.title')}</h2>
            <p className="mt-3 text-gray-400 text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(({ name, price, desc, features: planFeatures, cta, highlighted }) => (
              <div
                key={name}
                className={`relative rounded-3xl p-8 border ${
                  highlighted
                    ? 'bg-amber-500 border-amber-400 shadow-2xl shadow-amber-500/30 scale-105'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-amber-600 text-xs font-bold px-4 py-1 rounded-full shadow">
                    {t('pricing.mostPopular')}
                  </div>
                )}
                <div className={`text-sm font-semibold mb-1 ${highlighted ? 'text-amber-100' : 'text-gray-400'}`}>
                  {name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-5xl font-black ${highlighted ? 'text-white' : 'text-white'}`}>
                    {price}
                  </span>
                  <span className={`text-sm mb-2 ml-1 ${highlighted ? 'text-amber-100' : 'text-gray-400'}`}>{tc('currency')}</span>
                  <span className={`text-sm mb-2 ${highlighted ? 'text-amber-100' : 'text-gray-400'}`}>{t('pricing.perMonth')}</span>
                </div>
                <p className={`text-sm mb-8 ${highlighted ? 'text-amber-100' : 'text-gray-500'}`}>{desc}</p>
                <ul className="space-y-3 mb-8">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-white' : 'text-amber-500'}`} />
                      <span className={highlighted ? 'text-white' : 'text-gray-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className={`w-full ${highlighted ? 'bg-white text-amber-600 hover:bg-amber-50 font-bold' : ''}`}
                    variant={highlighted ? 'outline' : 'default'}
                  >
                    {cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900">{t('testimonials.title')}</h2>
            <p className="mt-3 text-gray-500 text-lg">{t('testimonials.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, shop, quote, rating, avatar }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed text-sm mb-6">&quot;{quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-100 flex-shrink-0">
                    <Image src={avatar} alt={name} width={44} height={44} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{shop}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gray-950">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&auto=format&fit=crop&q=80"
            alt="Barber at work"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
          {/* Dark + amber gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/80 to-amber-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-28 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: copy */}
          <div className="flex-1 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">BarberBook</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5">
              {t('cta.title')}
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
              {t('cta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-white shadow-2xl shadow-amber-500/30 font-bold">
                  {t('cta.button')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="w-full sm:w-auto border-gray-600 text-white hover:bg-white/10 bg-transparent">
                  {t('nav.signIn')}
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[t('hero.trust1'), t('hero.trust2'), t('hero.trust3')].map((item) => (
                <span key={item} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: stat cards */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full max-w-xs">
            {[
              { value: '1 000+', label: 'Barbers' },
              { value: '60%', label: 'Fewer no-shows' },
              { value: '10 min', label: 'Setup time' },
              { value: '24/7', label: 'Online booking' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-amber-400">{value}</div>
                <div className="text-xs text-gray-400 mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">BarberBook</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a>
            </div>
            <p className="text-gray-600 text-sm">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
