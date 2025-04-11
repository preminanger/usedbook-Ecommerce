import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CartItem } from './cart-item.service';
import { User } from './user.service';
import { map } from 'rxjs';

export interface Pokemon {
  id: number;
  name: string;
  des: string;
  price: number;
  quantity:number;
  cartItems: CartItem
  author: string;
  publicationYear: number;
  genre: string;
  translator: string;
  publisher: string;
  isbn: string;
  pages: number;
  imageUrls?: string[];
  condition: string
  user_id?: number;
  user?: User
  selectedQuantity?: number;
  imageUrlsParsed?: string[];
}

export enum Genre {
  FICTION = 'Fiction',
  NONFICTION = 'Non-fiction',
  ROMANCE = 'Romance',
  FANTASY = 'Fantasy',
  SCIFI = 'Sci-Fi',
  HISTORY = 'History',
  SELFHELP = 'Self-help',
  BIOGRAPHY = 'Biography',
  MYSTERY = 'Mystery',
  EDUCATION = 'Education',
  KID = 'Kid'
}


@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) { }
  GetAllPokemon() {
    return this.http.get<Pokemon[]>(environment.api_url + '/pokemon').pipe(
      map(pokemons => pokemons.map(p => ({
        ...p,
        imageUrls: (typeof p.imageUrls === 'string' && (p.imageUrls as string).startsWith('['))
          ? JSON.parse(p.imageUrls as string)
          : (p.imageUrls || [])
      })))
    );
  }
  
  getReviewsByProduct(productId: number) {
    return this.http.get<any[]>(`http://localhost:3000/review/product/${productId}`);
  }
  
  getOnePokemon(id:number){
    return this.http.get<Pokemon>(environment.api_url + '/pokemon/' + id )
  }
  postPokemon(formData: FormData) {
    return this.http.post(environment.api_url + '/pokemon/create', formData);
  }
  getPokemonByUser(id: number) {
    return this.http.get<Pokemon[]>(environment.api_url + '/pokemon/find-by-user/' + id).pipe(
      map(pokemons => pokemons.map(p => ({
        ...p,
        imageUrls: (typeof p.imageUrls === 'string' && (p.imageUrls as string).startsWith('['))
          ? JSON.parse(p.imageUrls as string)
          : (p.imageUrls || [])
      })))
    );
  }
  
  deletePokemon(id: number) {
    return this.http.delete(environment.api_url + '/pokemon/' + id);
  }
  updatePokemon(id: number, productData: any){
    return this.http.put(environment.api_url + '/pokemon/' + id, productData)
  }
  postReview(body: { user: number; pokemon: number; rating: number; comment: string; }) {
    return this.http.post(environment.api_url + '/review/create', body);
  }
  
}
