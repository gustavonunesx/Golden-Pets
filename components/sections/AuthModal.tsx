'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, PawPrint } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

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

function LoginForm() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    // TODO: integrar autenticação real
    await new Promise((r) => setTimeout(r, 1200))
    console.log('Login:', data)
    setLoading(false)
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

      <div className="text-right">
        <button type="button" className="text-xs text-primary hover:underline">
          Esqueceu a senha?
        </button>
      </div>

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

      <div className="relative flex items-center gap-3 text-gray-300">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">ou continue com</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continuar com Google
      </motion.button>
    </form>
  )
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterData) => {
    setLoading(true)
    // TODO: integrar criação de conta real
    await new Promise((r) => setTimeout(r, 1200))
    console.log('Register:', data)
    setLoading(false)
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
  const [prevTab, setPrevTab] = useState<'login' | 'register'>(defaultTab)

  const direction = tab === 'register' ? 1 : -1

  const switchTab = (next: 'login' | 'register') => {
    if (next === tab) return
    setPrevTab(tab)
    setTab(next)
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
                    {tab === 'login' ? <LoginForm /> : <RegisterForm />}
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
