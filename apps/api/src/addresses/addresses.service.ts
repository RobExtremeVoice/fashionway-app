import { Injectable, BadRequestException } from '@nestjs/common'
import { ViaCepService } from '../common/viacep/viacep.service'

export interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
}

// Mapeia nome do estado para sigla UF
function stateAbbr(name: string): string {
  const map: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO',
    'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
    'Sergipe': 'SE', 'Tocantins': 'TO',
  }
  return map[name] ?? name.substring(0, 2).toUpperCase()
}

@Injectable()
export class AddressesService {
  constructor(private viaCep: ViaCepService) {}

  async lookupCep(cep: string) {
    return this.viaCep.lookup(cep)
  }

  async searchAddresses(q: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=8&addressdetails=1&q=${encodeURIComponent(q)}`
    const res = await fetch(url, { headers: { 'User-Agent': 'FashionWayApp/1.0' } })
    if (!res.ok) return []

    const results = (await res.json()) as Array<{
      display_name: string
      lat: string
      lon: string
      address: {
        road?: string
        pedestrian?: string
        suburb?: string
        neighbourhood?: string
        city?: string
        town?: string
        village?: string
        state?: string
        postcode?: string
      }
    }>

    return results.map((r) => ({
      label: r.display_name.split(',').slice(0, 3).join(',').trim(),
      logradouro: r.address?.road ?? r.address?.pedestrian ?? '',
      bairro: r.address?.suburb ?? r.address?.neighbourhood ?? '',
      cidade: r.address?.city ?? r.address?.town ?? r.address?.village ?? '',
      estado: stateAbbr(r.address?.state ?? ''),
      cep: r.address?.postcode?.replace(/\D/g, '') ?? '',
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }))
  }

  async geocode(dto: {
    logradouro: string
    numero: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }): Promise<GeocodeResult> {
    const query = encodeURIComponent(
      `${dto.logradouro}, ${dto.numero}, ${dto.bairro}, ${dto.cidade}, ${dto.estado}, Brasil`,
    )

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FashionWayApp/1.0' },
    })

    if (!res.ok) {
      throw new BadRequestException('Erro ao geocodificar endereço')
    }

    const results = (await res.json()) as Array<{
      lat: string
      lon: string
      display_name: string
    }>

    if (!results.length) {
      const fallbackQuery = encodeURIComponent(`${dto.cidade}, ${dto.estado}, Brasil`)
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${fallbackQuery}`
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'FashionWayApp/1.0' },
      })
      const fallback = (await fallbackRes.json()) as Array<{
        lat: string
        lon: string
        display_name: string
      }>

      if (!fallback.length) {
        throw new BadRequestException('Endereço não encontrado para geocodificação')
      }

      return {
        lat: parseFloat(fallback[0].lat),
        lng: parseFloat(fallback[0].lon),
        formattedAddress: fallback[0].display_name,
      }
    }

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
      formattedAddress: results[0].display_name,
    }
  }
}
