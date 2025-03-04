import { Module } from '@nestjs/common';
import { UserModule } from '../../infrastructure/framework/modules/user.module';
import { AuthModule } from '../../infrastructure/framework/modules/auth.module';
import { SeedingService } from './seeding.service';
import { CommonModule } from '../../infrastructure/framework/modules/common.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.env.api' }),
    CacheModule.register({ isGlobal: true }),
    CommonModule,
    UserModule,
    AuthModule,
  ],
  providers: [SeedingService],
})
export class SeedingModule {}
