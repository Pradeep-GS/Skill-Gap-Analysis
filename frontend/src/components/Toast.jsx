import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  const isError = type === 'error'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[fadeIn_0.2s_ease-out]">
      <div
        className={`flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
          isError
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-primary-500/20 bg-white text-secondary-500'
        }`}
      >
        <span
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
            isError ? 'bg-red-500' : 'bg-primary-500'
          }`}
        >
          {isError ? '!' : '✓'}
        </span>
        <p className="text-sm leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto flex-shrink-0 text-lg leading-none text-slate-400 hover:text-slate-600"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}
