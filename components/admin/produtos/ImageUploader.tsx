'use client'

import { useState, useRef } from 'react'

interface ProductImage {
  id: string
  url: string
  position: number
}

interface ImageUploaderProps {
  productId: string
  initialImages: ProductImage[]
}

export function ImageUploader({ productId, initialImages }: ImageUploaderProps) {
  const [images, setImages] = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => a.position - b.position)
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5 MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Formato inválido. Use JPEG, PNG, WebP ou GIF.')
      return
    }

    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao fazer upload')
        return
      }
      setImages(prev => [...prev, data.image])
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' })
    if (res.ok) {
      setImages(prev => prev.filter(img => img.id !== imageId))
    }
  }

  async function saveOrder(newImages: ProductImage[]) {
    await fetch(`/api/admin/products/${productId}/images/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newImages.map(img => img.id) }),
    })
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragEnter(index: number) {
    setDragOverIndex(index)
  }

  function handleDragEnd() {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const newImages = [...images]
    const [moved] = newImages.splice(dragIndex, 1)
    newImages.splice(dragOverIndex, 0, moved)
    const reindexed = newImages.map((img, i) => ({ ...img, position: i }))
    setImages(reindexed)
    setDragIndex(null)
    setDragOverIndex(null)
    saveOrder(reindexed)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
            Imagens do produto
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            A primeira imagem é a principal (capa). Arraste para reordenar.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '8px 16px', background: '#f97316', border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: 600, fontSize: '14px',
            cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? 'Enviando...' : '+ Adicionar imagem'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
        />
      </div>

      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: '2px dashed #e5e7eb', borderRadius: '12px', padding: '48px',
            textAlign: 'center', color: '#9ca3af', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#f97316')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
          <p style={{ fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            Nenhuma imagem ainda
          </p>
          <p style={{ fontSize: '13px' }}>Clique para adicionar a primeira imagem</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              style={{
                position: 'relative', borderRadius: '10px', overflow: 'hidden',
                border: dragOverIndex === index && dragIndex !== index
                  ? '2px solid #f97316'
                  : index === 0 ? '2px solid #f97316' : '2px solid #e5e7eb',
                aspectRatio: '1',
                cursor: 'grab',
                opacity: dragIndex === index ? 0.5 : 1,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`Imagem ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {index === 0 && (
                <div style={{
                  position: 'absolute', top: '6px', left: '6px',
                  background: '#f97316', color: '#fff', fontSize: '10px',
                  fontWeight: 700, padding: '2px 6px', borderRadius: '10px',
                }}>
                  CAPA
                </div>
              )}

              <button
                onClick={() => handleDelete(image.id)}
                style={{
                  position: 'absolute', top: '6px', right: '6px',
                  background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '50%',
                  width: '24px', height: '24px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#fff',
                  fontSize: '14px', lineHeight: 1,
                }}
                title="Remover imagem"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
