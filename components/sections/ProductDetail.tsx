'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Star, Check, Truck, ShieldCheck, RotateCcw, Minus, Plus,
  ChevronRight, Upload, X, Camera, Video,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { useCartStore } from '@/stores/cart-store'
import { CustomBadge } from '@/components/ui/custom-badge'
import { CustomButton } from '@/components/ui/custom-button'
import { ProductImage } from '@/components/ui/product-image'
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations'

interface ProductDetailProps {
  product: Product
}

type TabType = 'descricao' | 'especificacoes' | 'avaliacoes'

interface ReviewMediaItem {
  type: 'image' | 'video'
  name: string
  dataUrl?: string
  sessionUrl?: string
}

interface LocalReview {
  id: string
  author: string
  rating: number
  comment: string
  date: string
  media: ReviewMediaItem[]
}

interface MediaPreview {
  url: string
  type: 'image' | 'video'
  file: File
}

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      let { width: w, height: h } = img
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<TabType>('descricao')

  // Reviews
  const [reviews, setReviews] = useState<LocalReview[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [formAuthor, setFormAuthor] = useState('')
  const [formComment, setFormComment] = useState('')
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([])
  const [formError, setFormError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reviews_${product.slug}`)
      if (stored) setReviews(JSON.parse(stored))
    } catch {}
  }, [product.slug])

  const productImages = product.images ?? []
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPreviews: MediaPreview[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file,
    }))
    setMediaPreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removeMedia = (index: number) => {
    setMediaPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    mediaPreviews.forEach((m) => URL.revokeObjectURL(m.url))
    setFormRating(0)
    setHoverRating(0)
    setFormAuthor('')
    setFormComment('')
    setMediaPreviews([])
    setFormError('')
  }

  const handleSubmitReview = async () => {
    if (!formRating) { setFormError('Por favor, selecione uma nota.'); return }
    if (!formAuthor.trim()) { setFormError('Por favor, informe seu nome.'); return }
    if (!formComment.trim()) { setFormError('Por favor, escreva um comentário.'); return }
    setFormError('')

    const mediaItems: ReviewMediaItem[] = await Promise.all(
      mediaPreviews.map(async (m) => {
        if (m.type === 'image') {
          try {
            const dataUrl = await compressImage(m.file)
            return { type: 'image' as const, name: m.file.name, dataUrl }
          } catch {
            return { type: 'image' as const, name: m.file.name, sessionUrl: m.url }
          }
        }
        return { type: 'video' as const, name: m.file.name, sessionUrl: m.url }
      })
    )

    const newReview: LocalReview = {
      id: Date.now().toString(),
      author: formAuthor.trim(),
      rating: formRating,
      comment: formComment.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      media: mediaItems,
    }

    const updated = [newReview, ...reviews]
    setReviews(updated)

    try {
      const toStore = updated.map((r) => ({
        ...r,
        media: r.media.map(({ type, name, dataUrl }) => ({ type, name, dataUrl })),
      }))
      localStorage.setItem(`reviews_${product.slug}`, JSON.stringify(toStore))
    } catch {}

    setShowForm(false)
    resetForm()
  }

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }))

  const totalReviews = product.reviewCount + reviews.length

  return (
    <section className="pt-28 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/produtos" className="hover:text-primary transition-colors">
            Produtos
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Image */}
          <motion.div variants={scaleIn} initial="hidden" animate="visible">
            <div className="sticky top-28">
              {/* Imagem principal */}
              <div className="relative">
                <ProductImage
                  color={product.imageColor}
                  name={product.name}
                  className="w-full max-w-lg mx-auto"
                  src={productImages[selectedImageIndex]?.url}
                />
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {/* Thumbnails do carrossel */}
              {productImages.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center flex-wrap">
                  {productImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(i)}
                      className="rounded-lg overflow-hidden border-2 transition-all"
                      style={{
                        width: '64px',
                        height: '64px',
                        borderColor: selectedImageIndex === i ? '#f97316' : '#e5e7eb',
                        padding: 0,
                        background: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`Foto ${i + 1} de ${product.name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            {/* Category Badge */}
            <motion.div variants={fadeUp} className="mb-4">
              <CustomBadge variant="orange">{product.category}</CustomBadge>
              {product.badge && (
                <CustomBadge
                  variant={product.badge === 'mais-vendido' ? 'blue' : product.badge === 'novo' ? 'green' : 'orange'}
                  className="ml-2"
                >
                  {product.badge === 'mais-vendido' ? 'Mais Vendido' : product.badge === 'novo' ? 'Novo' : 'Oferta'}
                </CustomBadge>
              )}
            </motion.div>

            {/* Product Name */}
            <motion.h1
              variants={fadeUp}
              className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mb-4"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-gray-500">
                {product.rating.toFixed(1)} ({totalReviews} avaliacoes)
              </span>
            </motion.div>

            {/* Price */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    R$ {product.originalPrice!.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                em ate 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </p>
            </motion.div>

            {/* Short Description */}
            <motion.p variants={fadeUp} className="text-gray-600 leading-relaxed mb-6">
              {product.shortDescription}
            </motion.p>

            {/* Benefits */}
            <motion.div variants={fadeUp} className="mb-8">
              <h3 className="font-bold text-gray-800 mb-3">Beneficios:</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Quantity Selector */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
              <span className="font-bold text-gray-800">Quantidade:</span>
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="space-y-3 mb-8">
              <CustomButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => {
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    imageColor: product.imageColor,
                  }, quantity)
                  setQuantity(1)
                }}
              >
                Adicionar ao carrinho
              </CustomButton>
              <CustomButton
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => {
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    imageColor: product.imageColor,
                  }, quantity)
                  router.push('/checkout')
                }}
              >
                Comprar agora
              </CustomButton>
            </motion.div>

            {/* Trust Icons */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs text-gray-600">Entrega Rapida</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs text-gray-600">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs text-gray-600">30 dias garantia</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {(['descricao', 'especificacoes', 'avaliacoes'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab === 'descricao' ? 'Descrição' : tab === 'especificacoes' ? 'Especificações' : `Avaliações (${totalReviews})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'descricao' && (
              <motion.div
                key="descricao"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-gray max-w-none"
              >
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </motion.div>
            )}

            {activeTab === 'especificacoes' && (
              <motion.div
                key="especificacoes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'avaliacoes' && (
              <motion.div
                key="avaliacoes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Rating Summary */}
                <div className="flex flex-col sm:flex-row gap-8 mb-10 p-6 bg-gray-50 rounded-2xl">
                  <div className="flex flex-col items-center justify-center min-w-[140px]">
                    <span className="text-6xl font-extrabold text-gray-800">{product.rating.toFixed(1)}</span>
                    <div className="flex gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{totalReviews} avaliações</span>
                  </div>

                  {/* Star distribution bars (from user reviews) */}
                  <div className="flex-1 space-y-2 justify-center flex flex-col">
                    {starCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-2">{star}</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-4 text-right">{count}</span>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">Seja o primeiro a avaliar!</p>
                    )}
                  </div>
                </div>

                {/* Review Form Toggle */}
                {!showForm ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mb-8 flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    Escrever avaliação
                  </button>
                ) : (
                  <div className="mb-10 p-6 border border-gray-200 rounded-2xl">
                    <h3 className="font-bold text-gray-800 text-lg mb-5">Sua avaliação</h3>

                    {/* Star Selector */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nota *</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-9 h-9 transition-colors ${
                                star <= (hoverRating || formRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {formRating > 0 && (
                        <span className="text-sm text-gray-500 mt-1 block">
                          {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][formRating]}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>

                    {/* Comment */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comentário *</label>
                      <textarea
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Conte sua experiência com o produto..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                      />
                    </div>

                    {/* Media Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fotos e Vídeos <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-orange-50/50 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-sm text-gray-500">Clique para adicionar fotos ou vídeos</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 • máx. 50MB por arquivo</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleMediaChange}
                        />
                      </label>

                      {/* Media Previews */}
                      {mediaPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {mediaPreviews.map((m, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 group">
                              {m.type === 'image' ? (
                                <img src={m.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <video src={m.url} className="w-full h-full object-cover" muted />
                              )}
                              <button
                                onClick={() => removeMedia(i)}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                              {m.type === 'video' && (
                                <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1">
                                  <span className="text-[10px] text-white">vídeo</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {formError && (
                      <p className="text-sm text-red-500 mb-4">{formError}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <CustomButton variant="primary" onClick={handleSubmitReview}>
                        Publicar avaliação
                      </CustomButton>
                      <CustomButton
                        variant="ghost"
                        onClick={() => { setShowForm(false); resetForm() }}
                      >
                        Cancelar
                      </CustomButton>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-3 fill-gray-100 text-gray-200" />
                    <p className="font-medium text-gray-500">Nenhuma avaliação ainda</p>
                    <p className="text-sm mt-1">Seja o primeiro a compartilhar sua experiência!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-bold text-primary text-sm">
                            {review.author.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-gray-800">{review.author}</span>
                            <span className="text-xs text-gray-400 shrink-0">{review.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>

                          {/* Media Grid */}
                          {review.media.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {review.media.map((m, i) => {
                                const displayUrl = m.dataUrl || m.sessionUrl
                                return (
                                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {displayUrl ? (
                                      m.type === 'image' ? (
                                        <img src={displayUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <video src={displayUrl} className="w-full h-full object-cover" controls />
                                      )
                                    ) : (
                                      <div className="flex flex-col items-center justify-center gap-1">
                                        {m.type === 'image'
                                          ? <Camera className="w-6 h-6 text-gray-300" />
                                          : <Video className="w-6 h-6 text-gray-300" />
                                        }
                                        <span className="text-[10px] text-gray-400 text-center px-1 leading-tight truncate w-full text-center">
                                          {m.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
