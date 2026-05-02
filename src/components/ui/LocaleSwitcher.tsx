'use client'

const LOCALES = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'ع' },
  { code: 'en', label: 'EN' },
]

export function LocaleSwitcher() {
  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000`
    window.location.reload()
  }

  const current =
    typeof document !== 'undefined'
      ? document.cookie.match(/locale=([^;]+)/)?.[1] ?? 'fr'
      : 'fr'

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            current === l.code
              ? 'bg-amber-500 text-white'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
