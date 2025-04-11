import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { Pokemon } from './pokemon.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly _pokemon: PokemonService) { }

  @Get()
  findAll() {
    return this._pokemon.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._pokemon.findOne(+id);
  }
  @Get('/find-by-user/:id')
  findByUser(@Param('id') id: string) {
    console.log(id)
    return this._pokemon.findByUser(+id);
  }
  @Post('/poke')
  create(@Body() pokemon: Pokemon) {
    return this._pokemon.create(pokemon);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() pokemon: Pokemon) {
    return this._pokemon.update(+id, pokemon);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this._pokemon.delete(+id);
  }


  @Post('/create')
  @UseInterceptors(FilesInterceptor('images', 10, { // 👈 รับหลายไฟล์
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(16)
          .fill(null)
          .map(() => (Math.random() * 36).toString(36)[0])
          .join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async createWithFiles(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const imageUrls = files.map(file => `/uploads/${file.filename}`);

    const newPokemon = {
      ...body,
      imageUrls: imageUrls, // 👈 ส่งเป็น array
    };

    return this._pokemon.create(newPokemon);
  }
}
