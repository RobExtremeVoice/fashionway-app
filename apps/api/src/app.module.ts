import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AddressesModule } from './addresses/addresses.module'
import { ColetaModule } from './coleta/coleta.module'
import { PricingModule } from './pricing/pricing.module'
import { StripeModule } from './stripe/stripe.module'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { RolesGuard } from './auth/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    PricingModule,
    ColetaModule,
    StripeModule,
  ],
  providers: [
    // Guards globais: todos os endpoints precisam de JWT por padrão
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
