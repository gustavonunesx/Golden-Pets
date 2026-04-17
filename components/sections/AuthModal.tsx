'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, PawPrint } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

// ─── Animation variants ───────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 16,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
}

const tabContentVariants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -30,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  }),
}

// ─── Shared field component ───────────────────────────────────────────────────

interface FieldProps {
  icon: React.ReactNode
  type?: string
  placeholder: string
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any
  rightElement?: React.ReactNode
}

function Field({ icon, type = 'text', placeholder, error, registration, rightElement }: FieldProps) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          'flex items-center gap-3 border rounded-xl px-4 py-3 bg-gray-50 transition-colors focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
          error ? 'border-red-400' : 'border-gray-200'
        )}
      >
        <span className={cn('shrink-0', error ? 'text-red-400' : 'text-gray-400')}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          {...registration}
        />
        {rightElement}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    setServerError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        icon={<Mail className="w-4 h-4" />}
        type="email"
        placeholder="Seu e-mail"
        error={errors.email?.message}
        registration={register('email')}
      />
      <Field
        icon={<Lock className="w-4 h-4" />}
        type={showPass ? 'text' : 'password'}
        placeholder="Sua senha"
        error={errors.password?.message}
        registration={register('password')}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {serverError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        className="w-full bg-primary text-white font-bold py-3 rounded-full text-sm transition-opacity disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
            />
            Entrando...
          </span>
        ) : (
          'Entrar'
        )}
      </motion.button>
    </form>
  )
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterData) => {
    setLoading(true)
    setServerError(null)

    const supabase = createClient()

    // 1. Cria conta no Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setServerError('Este e-mail já está cadastrado. Tente fazer login.')
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
      setLoading(false)
      return
    }

    // 2. Cria registro na tabela customers para vincular dados de compra
    if (authData.user) {
      await supabase.from('customers').insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.name,
      })
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field
        icon={<User className="w-4 h-4" />}
        placeholder="Seu nome completo"
        error={errors.name?.message}
        registration={register('name')}
      />
      <Field
        icon={<Mail className="w-4 h-4" />}
        type="email"
        placeholder="Seu e-mail"
        error={errors.email?.message}
        registration={register('email')}
      />
      <Field
        icon={<Lock className="w-4 h-4" />}
        type={showPass ? 'text' : 'password'}
        placeholder="Crie uma senha"
        error={errors.password?.message}
        registration={register('password')}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      <Field
        icon={<Lock className="w-4 h-4" />}
        type={showConfirm ? 'text' : 'password'}
        placeholder="Confirme a senha"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword')}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {serverError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <p className="text-xs text-gray-500 leading-relaxed">
        Ao criar uma conta você concorda com nossos{' '}
        <button type="button" className="text-primary hover:underline">Termos de Uso</button>{' '}
        e{' '}
        <button type="button" className="text-primary hover:underline">Política de Privacidade</button>.
      </p>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        className="w-full bg-primary text-white font-bold py-3 rounded-full text-sm transition-opacity disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
            />
            Criando conta...
          </span>
        ) : (
          'Criar conta grátis'
        )}
      </motion.button>
    </form>
  )
}

// ─── Main AuthModal ───────────────────────────────────────────────────────────

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const direction = tab === 'register' ? 1 : -1

  const switchTab = (next: 'login' | 'register') => {
    if (next === tab) return
    setTab(next)
  }

  const handleSuccess = () => {
    onClose()
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto">

              {/* Decorative top bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-8 pt-8 pb-10">
                {/* Brand mark */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-center gap-2 mb-6"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xl font-black">
                    <span className="text-gray-800">Golden</span>
                    <span className="text-primary">Pets</span>
                  </span>
                </motion.div>

                {/* Tab switcher */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                  {(['login', 'register'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => switchTab(t)}
                      className={cn(
                        'relative flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors',
                        tab === t ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      {tab === t && (
                        <motion.span
                          layoutId="auth-tab-indicator"
                          className="absolute inset-0 bg-white rounded-xl shadow-sm"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">
                        {t === 'login' ? 'Entrar' : 'Criar conta'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Heading */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`heading-${tab}`}
                    custom={direction}
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mb-6"
                  >
                    <h2 className="text-2xl font-black text-gray-800">
                      {tab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {tab === 'login'
                        ? 'Entre para ver seus pedidos e favoritos.'
                        : 'Cadastre-se e aproveite benefícios exclusivos.'}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Form content */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`form-${tab}`}
                    custom={direction}
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {tab === 'login'
                      ? <LoginForm onSuccess={handleSuccess} />
                      : <RegisterForm onSuccess={handleSuccess} />
                    }
                  </motion.div>
                </AnimatePresence>

                {/* Footer link */}
                <p className="text-center text-xs text-gray-500 mt-6">
                  {tab === 'login' ? (
                    <>
                      Não tem uma conta?{' '}
                      <button
                        onClick={() => switchTab('register')}
                        className="text-primary font-semibold hover:underline"
                      >
                        Cadastre-se grátis
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem uma conta?{' '}
                      <button
                        onClick={() => switchTab('login')}
                        className="text-primary font-semibold hover:underline"
                      >
                        Entrar
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
