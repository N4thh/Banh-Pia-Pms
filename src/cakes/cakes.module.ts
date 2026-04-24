import { Module } from '@nestjs/common';
import { CakeController } from './cake.controller';
import { CakesService } from './cake.service';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  controllers: [CakeController],
  providers: [CakesService],
})
export class CakesModule {}
