import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon } from './pokemon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon])],
  providers: [PokemonService],
  controllers: [PokemonController],
  exports: [TypeOrmModule,PokemonService]
})
export class PokemonModule {}
