import { useState } from 'react'
import { login } from '@/services/authService'
import { User } from '@/types'
import { Lock, Mail } from 'lucide-react'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (result) {
        onLogin(result.user)
      } else {
        setError('Email o password non validi')
      }
    } catch (err) {
      setError('Si è verificato un errore. Riprova.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">MediLavoro</h1>
            <p className="text-gray-600 mt-2">Gestionale Medicina del Lavoro</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="nome@azienda.it"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Accesso in corso...</span>
                </>
              ) : (
                'Accedi'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-md p-4 text-sm">
              <p className="font-medium text-gray-700 mb-2">Credenziali di prova:</p>
              <p className="text-gray-600">Email: <code className="bg-gray-200 px-2 py-1 rounded">admin@medilavoro.it</code></p>
              <p className="text-gray-600">Password: <code className="bg-gray-200 px-2 py-1 rounded">admin123</code></p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          © 2025 MediLavoro - Tutti i diritti riservati
        </p>
      </div>
    </div>
  )
}
