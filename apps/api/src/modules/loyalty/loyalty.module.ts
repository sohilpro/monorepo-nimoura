import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyLedger } from './entities/loyalty-ledger.entity';
import { LoyaltyVisit } from './entities/loyalty-visit.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyAdminController } from './controllers/loyalty-admin.controller';

@Module({ imports: [TypeOrmModule.forFeature([LoyaltyLedger, LoyaltyVisit, LoyaltySettings])], providers: [LoyaltyService], controllers: [LoyaltyController, LoyaltyAdminController], exports: [LoyaltyService] })
export class LoyaltyModule {}
