import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

let _client: MercadoPagoConfig | null = null

function getClient(): MercadoPagoConfig {
  if (!_client) {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN não configurado')
    }
    _client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  }
  return _client
}

export function getPreferenceClient() {
  return new Preference(getClient())
}

export function getPaymentClient() {
  return new Payment(getClient())
}
