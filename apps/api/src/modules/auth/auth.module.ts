import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { OtpEntity } from './entities/otp.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { SmsService } from 'src/modules/payments/sms.service';
import { Users } from 'src/modules/users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, OtpEntity]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokensService, SmsService],
  exports: [AuthService, TokensService],
})
export class AuthModule {}
