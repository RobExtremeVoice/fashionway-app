import { Injectable, BadRequestException } from '@nestjs/common'
import { ViaCepService } from '../common/viacep/viacep.service'

export interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
}

@Injectable()
export class AddressesService {
  constructor(private viaCep: ViaCepService) {}

  async lookupCep(cep: string) {
    return this.viaCep.lookup(cep)
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
      // Fallback: geocodifica apenas cidade + estado se endereço completo não encontrado
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
