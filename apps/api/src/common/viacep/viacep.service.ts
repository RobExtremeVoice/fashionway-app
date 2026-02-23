import { Injectable, BadRequestException } from '@nestjs/common'

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string   // cidade
  uf: string           // estado
  ibge: string
  erro?: boolean
}

@Injectable()
export class ViaCepService {
  private readonly BASE_URL = 'https://viacep.com.br/ws'

  async lookup(cep: string): Promise<ViaCepResponse> {
    const cleaned = cep.replace(/\D/g, '')

    if (cleaned.length !== 8) {
      throw new BadRequestException('CEP inválido')
    }

    const res = await fetch(`${this.BASE_URL}/${cleaned}/json/`)

    if (!res.ok) {
      throw new BadRequestException('Erro ao consultar CEP')
    }

    const data = (await res.json()) as ViaCepResponse

    if (data.erro) {
      throw new BadRequestException('CEP não encontrado')
    }

    return data
  }
}
