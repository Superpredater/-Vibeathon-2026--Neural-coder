import { useState, type FormEvent } from 'react'
import { DollarSign } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PasswordStrength from '../../components/ui/PasswordStrength'
import SignupLayout from '../../components/ui/SignupLayout'

interface Form { name: string; email: string; org: string; costCentre: string; approvalLimit: string; password: string; confirm: string }
interface Errors { name?: string; email?: string; org?: string; password?: string; confirm?: string; general?: string }

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Full name is required'
  if (!f.email) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email'
  if (!f.org.trim()) e.org = 'Organisation / department is required'
  if (!f.password) e.password = 'Password is required'
  else if (f.password.length < 8) e.password = 'Minimum 8 characters'
  if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
  return e
}

export default function FinanceSignup() {
  const [form, setForm] = useState<Form>({ name: '', email: '', org: '', costCentre: '', approvalLimit: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1200))
      setSuccess(true)
    } catch {
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SignupLayout
      title="Finance Staff Registration"
      subtitle="Create your financial department account"
      iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
      icon={<DollarSign size={20} className="text-white" />}
      success={success}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.general && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-in">
            {errors.general}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="Priya Sharma" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email Address" type="email" placeholder="priya@finance.com" value={form.email} onChange={set('email')} error={errors.email} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Organisation / Department" placeholder="Finance Dept" value={form.org} onChange={set('org')} error={errors.org} />
          <Input label="Cost Centre (optional)" placeholder="CC-4200" value={form.costCentre} onChange={set('costCentre')} />
        </div>
        <Input
          label="Approval Limit (optional)"
          type="number"
          placeholder="e.g. 50000"
          value={form.approvalLimit}
          onChange={set('approvalLimit')}
        />
        <div>
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
          <PasswordStrength password={form.password} />
        </div>
        <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Create Finance Account
        </Button>
      </form>
    </SignupLayout>
  )
}
