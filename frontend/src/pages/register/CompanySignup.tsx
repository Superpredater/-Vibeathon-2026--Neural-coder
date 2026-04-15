import { useState, type FormEvent } from 'react'
import { Building2 } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PasswordStrength from '../../components/ui/PasswordStrength'
import SignupLayout from '../../components/ui/SignupLayout'

interface Form { name: string; email: string; companyName: string; regNo: string; password: string; confirm: string }
interface Errors { name?: string; email?: string; companyName?: string; password?: string; confirm?: string; general?: string }

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Full name is required'
  if (!f.email) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email'
  if (!f.companyName.trim()) e.companyName = 'Company name is required'
  if (!f.password) e.password = 'Password is required'
  else if (f.password.length < 8) e.password = 'Minimum 8 characters'
  if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
  return e
}

export default function CompanySignup() {
  const [form, setForm] = useState<Form>({ name: '', email: '', companyName: '', regNo: '', password: '', confirm: '' })
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
      await new Promise(r => setTimeout(r, 1200)) // TODO: real API
      setSuccess(true)
    } catch {
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SignupLayout
      title="Company Registration"
      subtitle="Create your admin account"
      iconBg="bg-gradient-to-br from-violet-500 to-brand-600"
      icon={<Building2 size={20} className="text-white" />}
      success={success}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.general && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-in">
            {errors.general}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="Jane Smith" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email Address" type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} error={errors.email} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company Name" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} error={errors.companyName} />
          <Input label="Registration No. (optional)" placeholder="CIN / GST" value={form.regNo} onChange={set('regNo')} />
        </div>
        <div>
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
          <PasswordStrength password={form.password} />
        </div>
        <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Create Company Account
        </Button>
      </form>
    </SignupLayout>
  )
}
