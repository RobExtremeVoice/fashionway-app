import { Injectable } from '@nestjs/common'
import { ServiceTier } from '@prisma/client'
import { PRICING, PLATFORM_FEE_PERCENT } from '@fashionway/shared'

interface PriceInput {
  distanciaKm: number
  serviceTier: ServiceTier
}

interface PriceResult {
  valorFrete: number      // centavos — cobrado do cliente
  valorRepasse: number    // centavos — pago ao motoboy
  taxaPlataforma: number  // centavos — retido pela FashionWay
  etaMinutes: number
}

@Injectable()
export class PricingService {
  /**
   * Calcula preços com base na distância e tier de serviço.
   * Todos os valores em centavos BRL.
   */
  calculate(input: PriceInput): PriceResult {
    const config = PRICING[input.serviceTier]

    const valorFrete = Math.round(
      config.basePrice + config.pricePerKm * input.distanciaKm,
    )

    const taxaPlataforma = Math.round(valorFrete * (PLATFORM_FEE_PERCENT / 100))
    const valorRepasse = valorFrete - taxaPlataforma

    return {
      valorFrete,
      valorRepasse,
      taxaPlataforma,
      etaMinutes: config.etaMinutes,
    }
  }

  /**
   * Retorna cotações para os 3 tiers ao mesmo tempo.
   * Usado na tela de seleção de serviço.
   */
  quote(distanciaKm: number) {
    return (['URGENTE', 'PADRAO', 'AGENDADO'] as ServiceTier[]).map((tier) => {
      const config = PRICING[tier]
      const prices = this.calculate({ distanciaKm, serviceTier: tier })
      return {
        serviceTier: tier,
        label: config.label,
        description: config.description,
        distanciaKm,
        ...prices,
      }
    })
  }

  /**
   * Distância entre dois pontos (fórmula Haversine).
   * Retorna km.
   */
  haversineKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number {
    const R = 6371
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  private toRad(deg: number) {
    return (deg * Math.PI) / 180
  }
}
