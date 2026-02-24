import { Module } from '@nestjs/common'
import { MotoboysController } from './motoboys.controller'
import { MotoboysService } from './motoboys.service'

@Module({
  controllers: [MotoboysController],
  providers: [MotoboysService],
})
export class MotoboysModule {}
