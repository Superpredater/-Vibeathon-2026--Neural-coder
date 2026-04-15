import clsx from 'clsx'

function getStrength(password: string): { score: number; label: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] ?? '' }
}

const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500']
const textColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-600']

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const { score, label } = getStrength(password)
  return (
    <div className="mt-1.5 space-y-1.5 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={clsx(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= score ? colors[score] : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      {label && (
        <p className={clsx('text-xs font-medium', textColors[score])}>
          {label} password
        </p>
      )}
    </div>
  )
}
