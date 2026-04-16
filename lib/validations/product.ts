import { z } from 'zod'

export const productSchema = z.object({
  name:              z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  slug:              z.string().min(2, 'Slug deve ter ao menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug só pode conter letras minúsculas, números e hífens'),
  category_id:       z.string().uuid('Categoria inválida'),
  price:             z.number({ invalid_type_error: 'Preço inválido' }).positive('Preço deve ser positivo'),
  original_price:    z.number().positive().nullable().optional(),
  short_description: z.string().min(10, 'Descrição curta deve ter ao menos 10 caracteres'),
  description:       z.string().min(20, 'Descrição deve ter ao menos 20 caracteres'),
  benefits:          z.array(z.string().min(1)).min(1, 'Adicione ao menos 1 benefício'),
  specs:             z.record(z.string(), z.string()),
  badge:             z.enum(['mais-vendido', 'novo', 'oferta']).nullable().optional(),
  in_stock:          z.boolean(),
  image_color:       z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
  active:            z.boolean(),
})

export type ProductInput = z.infer<typeof productSchema>
