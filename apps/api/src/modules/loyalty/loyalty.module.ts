import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyLedger } from './entities/loyalty-ledger.entity';
import { LoyaltyVisit } from './entities/loyalty-visit.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import { LoyaltyWithdrawal } from './entities/loyalty-withdrawal.entity';
import { Referral } from './entities/referral.entity';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyAdminController } from './controllers/loyalty-admin.controller';
import { SmsService } from 'src/modules/payments/sms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoyaltyLedger,
      LoyaltyVisit,
      LoyaltySettings,
      LoyaltyWithdrawal,
      Referral,
    ]),
  ],
  providers: [LoyaltyService, SmsService],
  controllers: [LoyaltyController, LoyaltyAdminController],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
