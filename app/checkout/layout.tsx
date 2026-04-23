import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
  display: 'swap',
})

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <div className={fraunces.variable}>{children}</div>
}
