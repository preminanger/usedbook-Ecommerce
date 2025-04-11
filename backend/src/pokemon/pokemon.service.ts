import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from './pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private pokemonRepository: Repository<Pokemon>,
  ) {}

  async findAll() {
    return await this.pokemonRepository.find({relations: ['user']});
  }

  async findOne(id: number) {
    return await this.pokemonRepository.findOne({ where: { id }});
  }
  async findByUser(user_id: number){
    return await this.pokemonRepository.find({ where: { user:{id:user_id} }});
  }

  async create(pokemon: any) {
    if (Array.isArray(pokemon.imageUrls)) {
      pokemon.imageUrls = JSON.stringify(pokemon.imageUrls);
    }
    let body = JSON.parse(JSON.stringify(pokemon));
    body.user = { id: body.user };
  
    console.log(' body to save:', body);
    return await this.pokemonRepository.save(body);
  }
  

  async update(id: number, pokemon: Pokemon) {
    if (Array.isArray(pokemon.imageUrls)) {
      pokemon.imageUrls = JSON.stringify(pokemon.imageUrls); // ✅ แปลง array เป็น string
    }
    await this.pokemonRepository.update(id, pokemon);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.pokemonRepository.delete(id);
  }

  
}
