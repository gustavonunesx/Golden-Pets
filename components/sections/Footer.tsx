import Link from 'next/link'

const footerLinks = {
  produtos: [
    { label: 'Cachorros', href: '/produtos?categoria=cachorros' },
    { label: 'Gatos', href: '/produtos?categoria=gatos' },
    { label: 'Alimentacao', href: '/produtos?categoria=alimentacao' },
    { label: 'Brinquedos', href: '/produtos?categoria=brinquedos' },
    { label: 'Higiene', href: '/produtos?categoria=higiene' }
  ],
  atendimento: [
    { label: 'Central de Ajuda', href: '#' },
    { label: 'Fale Conosco', href: '#' },
    { label: 'Rastrear Pedido', href: '#' },
    { label: 'Trocas e Devolucoes', href: '#' },
    { label: 'Perguntas Frequentes', href: '#' }
  ],
  legal: [
    { label: 'Termos de Uso', href: '#' },
    { label: 'Politica de Privacidade', href: '#' },
    { label: 'Politica de Cookies', href: '#' },
    { label: 'LGPD', href: '#' }
  ]
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 40 40" className="w-10 h-10" aria-hidden="true">
                <g fill="#f97316">
                  <ellipse cx="20" cy="26" rx="10" ry="8" />
                  <ellipse cx="8" cy="14" rx="4" ry="5" transform="rotate(-20, 8, 14)" />
                  <ellipse cx="32" cy="14" rx="4" ry="5" transform="rotate(20, 32, 14)" />
                  <ellipse cx="10" cy="21" rx="3.5" ry="4.5" transform="rotate(-10, 10, 21)" />
                  <ellipse cx="30" cy="21" rx="3.5" ry="4.5" transform="rotate(10, 30, 21)" />
                </g>
              </svg>
              <span className="text-2xl font-black">
                <span className="text-white">Golden</span>
                <span className="text-primary">Pets</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Cuidado que seu pet merece. Produtos premium para cachorros e gatos com entrega para todo o Brasil.
            </p>
            {/* Payment Icons */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-400" title="Pix">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M23.5 8.5l-4.5 4.5 4.5 4.5-3 3-4.5-4.5-4.5 4.5-3-3 4.5-4.5-4.5-4.5 3-3 4.5 4.5 4.5-4.5 3 3z"/>
                </svg>
              </div>
              <div className="flex items-center gap-1 text-gray-400" title="Cartao">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
                  <rect x="4" y="8" width="24" height="16" rx="2"/>
                  <rect x="4" y="12" width="24" height="4" fill="currentColor" opacity="0.5"/>
                </svg>
              </div>
              <div className="flex items-center gap-1 text-gray-400" title="Boleto">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
                  <rect x="6" y="8" width="2" height="16"/>
                  <rect x="10" y="8" width="4" height="16"/>
                  <rect x="16" y="8" width="2" height="16"/>
                  <rect x="20" y="8" width="4" height="16"/>
                  <rect x="26" y="8" width="2" height="16"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Produtos */}
          <div>
            <h3 className="font-bold text-lg mb-4">Produtos</h3>
            <ul className="space-y-3">
              {footerLinks.produtos.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="font-bold text-lg mb-4">Atendimento</h3>
            <ul className="space-y-3">
              {footerLinks.atendimento.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              2024 Golden Pets. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-sm">
              CNPJ: 12.345.678/0001-90 (Empresa Ficticia)
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
