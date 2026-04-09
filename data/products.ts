import { Product } from '@/types'

export const products: Product[] = [
  {
    id: '1',
    slug: 'coleira-anti-pulgas-premium',
    name: 'Coleira Anti-Pulgas Premium',
    category: 'Coleiras',
    price: 89.90,
    originalPrice: 129.90,
    rating: 4.8,
    reviewCount: 234,
    description: 'A Coleira Anti-Pulgas Premium oferece proteção completa para seu pet por até 8 meses. Desenvolvida com tecnologia de liberação gradual, combate pulgas, carrapatos e piolhos de forma eficaz e segura. Resistente à água, permite banhos e brincadeiras sem perder a eficácia.',
    shortDescription: 'Proteção completa por até 8 meses contra pulgas e carrapatos.',
    benefits: [
      'Proteção de longa duração (8 meses)',
      'Resistente à água',
      'Sem cheiro forte',
      'Seguro para filhotes acima de 7 semanas'
    ],
    specs: {
      'Duração': '8 meses',
      'Tamanho': 'Ajustável até 70cm',
      'Peso indicado': 'Cães de 8kg a 40kg',
      'Material': 'Polímero hipoalergênico'
    },
    badge: 'mais-vendido',
    inStock: true,
    imageColor: '#f97316'
  },
  {
    id: '2',
    slug: 'cama-ortopedica-confort',
    name: 'Cama Ortopédica Confort',
    category: 'Camas',
    price: 249.90,
    originalPrice: 349.90,
    rating: 4.9,
    reviewCount: 189,
    description: 'A Cama Ortopédica Confort foi desenvolvida especialmente para pets que precisam de suporte extra para articulações. Com espuma de memória de alta densidade, alivia pontos de pressão e proporciona noites de sono reparador. Ideal para pets idosos ou com problemas articulares.',
    shortDescription: 'Espuma de memória para máximo conforto e suporte articular.',
    benefits: [
      'Espuma de memória de alta densidade',
      'Capa removível e lavável',
      'Base antiderrapante',
      'Alivia dores articulares'
    ],
    specs: {
      'Tamanho': '80x60x15cm',
      'Peso suportado': 'Até 35kg',
      'Material interno': 'Espuma de memória',
      'Material externo': 'Tecido impermeável'
    },
    badge: 'mais-vendido',
    inStock: true,
    imageColor: '#2563eb'
  },
  {
    id: '3',
    slug: 'comedouro-inteligente-auto-feed',
    name: 'Comedouro Inteligente Auto-Feed',
    category: 'Alimentação',
    price: 459.90,
    rating: 4.7,
    reviewCount: 156,
    description: 'O Comedouro Inteligente Auto-Feed permite programar até 6 refeições diárias com porções precisas. Controle via aplicativo, gravação de voz para chamar seu pet e câmera integrada para acompanhar a alimentação. Capacidade para 4kg de ração.',
    shortDescription: 'Alimentação programada via app com câmera integrada.',
    benefits: [
      'Controle via aplicativo',
      'Gravação de voz personalizada',
      'Câmera HD integrada',
      'Bateria reserva para quedas de energia'
    ],
    specs: {
      'Capacidade': '4kg de ração',
      'Conectividade': 'Wi-Fi 2.4GHz',
      'Alimentação': 'Bivolt + bateria reserva',
      'Compatibilidade': 'iOS e Android'
    },
    badge: 'novo',
    inStock: true,
    imageColor: '#22c55e'
  },
  {
    id: '4',
    slug: 'brinquedo-interativo-puzzle',
    name: 'Brinquedo Interativo Puzzle',
    category: 'Brinquedos',
    price: 79.90,
    rating: 4.6,
    reviewCount: 312,
    description: 'O Brinquedo Interativo Puzzle estimula a inteligência do seu pet enquanto ele se diverte. Com 3 níveis de dificuldade, desafia seu cão a encontrar petiscos escondidos. Fabricado em plástico ABS atóxico e resistente a mordidas.',
    shortDescription: 'Estimula a inteligência com 3 níveis de dificuldade.',
    benefits: [
      '3 níveis de dificuldade',
      'Material atóxico e resistente',
      'Estimula o raciocínio',
      'Reduz ansiedade e tédio'
    ],
    specs: {
      'Material': 'Plástico ABS atóxico',
      'Dimensões': '30x30x5cm',
      'Peso': '450g',
      'Idade recomendada': 'A partir de 6 meses'
    },
    badge: 'mais-vendido',
    inStock: true,
    imageColor: '#f59e0b'
  },
  {
    id: '5',
    slug: 'shampoo-pelos-brancos',
    name: 'Shampoo Pelos Brancos Premium',
    category: 'Higiene',
    price: 49.90,
    rating: 4.5,
    reviewCount: 278,
    description: 'Shampoo especialmente formulado para pets de pelagem clara. Remove manchas amareladas e realça o branco natural dos pelos. Com extrato de camomila e aloe vera, hidrata profundamente sem ressecar a pele.',
    shortDescription: 'Realça pelos brancos e remove manchas amareladas.',
    benefits: [
      'Remove manchas amareladas',
      'Hidratação profunda',
      'pH balanceado para pets',
      'Fragrância suave e duradoura'
    ],
    specs: {
      'Volume': '500ml',
      'pH': 'Neutro (7.0)',
      'Indicação': 'Pelagens claras',
      'Ingredientes': 'Camomila, aloe vera, vitamina E'
    },
    inStock: true,
    imageColor: '#8b5cf6'
  },
  {
    id: '6',
    slug: 'guia-retratil-5-metros',
    name: 'Guia Retrátil 5 Metros',
    category: 'Passeio',
    price: 119.90,
    originalPrice: 159.90,
    rating: 4.4,
    reviewCount: 198,
    description: 'Guia retrátil com 5 metros de extensão para passeios com mais liberdade. Sistema de travamento instantâneo, cabo de nylon reforçado e empunhadura ergonômica com acabamento emborrachado antiderrapante.',
    shortDescription: 'Liberdade nos passeios com 5 metros de extensão.',
    benefits: [
      '5 metros de extensão',
      'Travamento instantâneo',
      'Empunhadura ergonômica',
      'Cabo reforçado antirruptura'
    ],
    specs: {
      'Comprimento': '5 metros',
      'Peso suportado': 'Até 30kg',
      'Material cabo': 'Nylon reforçado',
      'Garantia': '1 ano'
    },
    badge: 'oferta',
    inStock: true,
    imageColor: '#ec4899'
  },
  {
    id: '7',
    slug: 'arranhador-torre-felina',
    name: 'Arranhador Torre Felina',
    category: 'Gatos',
    price: 289.90,
    rating: 4.8,
    reviewCount: 145,
    description: 'Torre arranhador com 3 níveis para seu gato explorar, arranhar e descansar. Revestimento em sisal natural, plataformas acolchoadas e toca no nível inferior. Estrutura robusta que não tomba.',
    shortDescription: 'Torre de 3 níveis com sisal natural e toca aconchegante.',
    benefits: [
      'Sisal 100% natural',
      'Base antitombo estável',
      'Plataformas acolchoadas',
      'Toca para descanso'
    ],
    specs: {
      'Altura': '120cm',
      'Base': '50x50cm',
      'Níveis': '3 plataformas + toca',
      'Material': 'MDF + sisal + pelúcia'
    },
    inStock: true,
    imageColor: '#14b8a6'
  },
  {
    id: '8',
    slug: 'fonte-agua-automatica',
    name: 'Fonte de Água Automática',
    category: 'Alimentação',
    price: 159.90,
    rating: 4.7,
    reviewCount: 267,
    description: 'Fonte de água com circulação contínua que incentiva seu pet a beber mais água. Filtro de carvão ativado remove impurezas e odores. Sistema silencioso e design elegante que combina com qualquer ambiente.',
    shortDescription: 'Água sempre fresca e filtrada para seu pet.',
    benefits: [
      'Filtro de carvão ativado',
      'Funcionamento silencioso',
      'Incentiva hidratação',
      'Fácil limpeza'
    ],
    specs: {
      'Capacidade': '2.5 litros',
      'Alimentação': 'Bivolt',
      'Filtro': 'Carvão ativado (substituir a cada 30 dias)',
      'Material': 'Plástico livre de BPA'
    },
    badge: 'novo',
    inStock: true,
    imageColor: '#0ea5e9'
  },
  {
    id: '9',
    slug: 'roupinha-inverno-soft',
    name: 'Roupinha de Inverno Soft',
    category: 'Roupas',
    price: 69.90,
    rating: 4.6,
    reviewCount: 189,
    description: 'Roupinha quentinha para os dias frios. Tecido soft touch macio e confortável, forro térmico e fechamento em velcro para fácil vestir. Disponível em vários tamanhos para cães pequenos e médios.',
    shortDescription: 'Tecido soft touch com forro térmico para dias frios.',
    benefits: [
      'Tecido soft touch ultra macio',
      'Forro térmico',
      'Fechamento prático em velcro',
      'Lavável na máquina'
    ],
    specs: {
      'Material': 'Poliéster soft touch',
      'Tamanhos': 'PP ao G',
      'Cores': 'Vermelho, azul, cinza',
      'Lavagem': 'Máquina - água fria'
    },
    inStock: true,
    imageColor: '#ef4444'
  },
  {
    id: '10',
    slug: 'kit-higiene-dental',
    name: 'Kit Higiene Dental Completo',
    category: 'Higiene',
    price: 59.90,
    originalPrice: 79.90,
    rating: 4.5,
    reviewCount: 134,
    description: 'Kit completo para cuidar da saúde bucal do seu pet. Inclui escova de dentes ergonômica, dedeira de silicone, pasta dental sabor carne e spray refrescante. Previne tártaro, gengivite e mau hálito.',
    shortDescription: 'Kit completo para saúde bucal: escova, dedeira, pasta e spray.',
    benefits: [
      'Previne tártaro e gengivite',
      'Combate mau hálito',
      'Pasta dental sabor carne',
      'Dedeira de silicone inclusa'
    ],
    specs: {
      'Conteúdo': 'Escova + dedeira + pasta 50g + spray 60ml',
      'Sabor pasta': 'Carne',
      'Indicação': 'Cães e gatos',
      'Uso': 'Escovação 3x por semana'
    },
    badge: 'oferta',
    inStock: true,
    imageColor: '#06b6d4'
  }
]
