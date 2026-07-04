export default function Spinner({ label = 'Loading...', size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-10 w-10 border-4' : 'h-5 w-5 border-2'

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div
        className={`${sizeClass} animate-spin rounded-full border-primary-500 border-t-transparent`}
      />
      {label && <p className="text-sm font-medium text-secondary-500/70">{label}</p>}
    </div>
  )
}
