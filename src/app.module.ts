import { Module } from '@nestjs/common';
import { GameService } from './application/use-cases/game/game.service';
import { GameModule } from './infrastructure/ioc/game.module';

@Module({
  imports: [GameModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
