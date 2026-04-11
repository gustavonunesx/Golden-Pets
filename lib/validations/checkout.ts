import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .regex(/^\d+$/, 'Apenas números'),
  cpf: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d+$/, 'Apenas números'),
})

export const addressSchema = z.object({
  zip_code: z
    .string()
    .length(8, 'CEP deve ter 8 dígitos')
    .regex(/^\d+$/, 'Apenas números'),
  street: z.string().min(3, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
})

export const checkoutSchema = z.object({
  customer: customerSchema,
  address: addressSchema,
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type AddressInput = z.infer<typeof addressSchema>
