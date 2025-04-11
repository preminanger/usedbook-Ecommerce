import { CartService } from './../../services/cart.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Genre, Pokemon, PokemonService } from '../../services/pokemon.service';
import { CartItem, CartItemService } from '../../services/cart-item.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../layout/footer/footer.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent,
    CommonModule,
    RouterLink,
    RouterModule,
    FormsModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  filteredPokemonList: Pokemon[] = [];
  isDetail: boolean = false
  onePokemon: Pokemon | null = null
  pokemonList: Array<Pokemon> = []
  paginatedPokemonList: Array<Pokemon> = []
  selectedFile: File | null = null;
  selectedImageList: string[] = [];
  selectedImage: string = '';
  isAdding = false;
  imageUrl: string | ArrayBuffer | null = null;
  pokemonObject = {
    id: '', name: '', des: '', price: '', imageFile: null as File | null, imageUrl: '', quantity: ''
  }
  showModal: boolean = false;
  cartItems: CartItem[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5; // กำหนดจำนวนรายการต่อหน้า (เช่น 6 รายการต่อหน้า)
  totalPages: number = 1;
  searchQuery: string = '';
  messageContent: string = '';
  selectedCondition: string = '';
  selectedGenres: string[] = [];
selectedConditions: string[] = [];
conditionOptions = ['Like New', 'Very Good', 'Good', 'Acceptable', 'Poor'];
genreOptions = Object.values(Genre);
reviews: any[] = [];
canWriteReview: boolean = false;
reviewRating: number = 5;
reviewComment: string = '';

  constructor(private _pokemon: PokemonService, private _cart: CartService, private _cartItem: CartItemService, public _user: UserService) { }

  ngOnInit(): void {
    this.fetchPokemonList()
    // this.getAllPokemon();
  }
  scrollToProducts() {
    const productSection = document.getElementById('product-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  openMessageModal() {
    const currentUserId = this._user.getCurrentUser()?.id;
    const sellerId = this.onePokemon?.user?.id;
    if (currentUserId === sellerId) {
      alert('❌ คุณไม่สามารถคุยกับตัวเองได้');
      return;
    }
  
    const modal = document.getElementById('message_modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }
  getReviews(productId: number) {
    this._pokemon.getReviewsByProduct(productId).subscribe(res => {
      this.reviews = res; 
      console.log(' Reviews:', res);
    });
  }
  
  sendMessageToSeller() {
    const senderId = this._user.currentUser?.id;
    const receiverId = this.onePokemon?.user?.id;
    const content = this.messageContent;
  
    if (!senderId || !receiverId || !content.trim()) return;
  
    this._user.sendMessage({ senderId, receiverId, content }).subscribe(res => {
      alert('✅ Message sent!');
      (document.getElementById('message_modal') as HTMLDialogElement).close();
      this.messageContent = '';
    });
  }
  openImageModal(img: string) {
    this.selectedImage = img;
    const modal = document.getElementById('image_modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }
 
  closeImageModal(event?: MouseEvent) {
    const modal = document.getElementById('image_modal') as HTMLDialogElement;
    if (modal) modal.close();
  }
  handleAddToCartAnimation() {
    if (!this.onePokemon) return;
  
    this.isAdding = true;
    this.addToCartOnePokemon(this.onePokemon);
    this.showCartToast();
    const drawerToggle = document.getElementById('my-drawer-4') as HTMLInputElement;
  if (drawerToggle) {
    drawerToggle.checked = false;
  }
    // ให้มันเด้งแป๊บนึงแล้วค่อยกลับมา
    setTimeout(() => {
      this.isAdding = false;
    }, 200);
  }
  filterProducts() {
    const query = this.searchQuery.toLowerCase();
  
    this.filteredPokemonList = [...this.pokemonList].filter(item => {
      const matchesQuery =
        item.name.toLowerCase().includes(query) ||
        item.des.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query);
  
      const matchesCondition = this.selectedConditions.length > 0
        ? this.selectedConditions.includes(item.condition)
        : true;
  
      const matchesGenre = this.selectedGenres.length > 0
        ? this.selectedGenres.some(g => item.genre.includes(g))
        : true;
  
      return matchesQuery && matchesCondition && matchesGenre;
    });
  
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredPokemonList.length / this.itemsPerPage);
    this.updatePagination();
  }
  
  
  onGenreFilterChange(event: any, genre: string) {
    if (event.target.checked) {
      this.selectedGenres.push(genre);
    } else {
      this.selectedGenres = this.selectedGenres.filter(g => g !== genre);
    }
    this.filterProducts();
  }
  
  onConditionFilterChange(event: any, condition: string) {
    if (event.target.checked) {
      this.selectedConditions.push(condition);
    } else {
      this.selectedConditions = this.selectedConditions.filter(c => c !== condition);
    }
    this.filterProducts();
  }

  getAllPokemon() {
    this._pokemon.GetAllPokemon().subscribe(res => {
      console.log(res);
      res.map(pokemon => {
        pokemon.quantity = 1
      })
      this.pokemonList = res;
    });
  }
  toggle(id: number) {
    this._pokemon.getOnePokemon(id).subscribe(res => {
      console.log(res);
      this.onePokemon = res
      this.isDetail = !this.isDetail
    })
  }
  
  clickOnePokemon(item: Pokemon) {
    this.onePokemon = { ...item, selectedQuantity: item.selectedQuantity ?? 1 };

    // แปลง imageUrls จาก string → array ถ้ายังไม่ได้
    if (typeof item.imageUrls === 'string') {
      try {
        item.imageUrls = JSON.parse(item.imageUrls);
      } catch {
        item.imageUrls = [];
      }
    }   
    this.getReviews(item.id);
    this.selectedImageList = (item.imageUrls ?? []).map(url => 'http://localhost:3000' + url);
    this.selectedImage = this.selectedImageList[0] || '';

    this.openModal();
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  updateQuantity(status: string, pokemon: Pokemon) {
    if (status == 'decrease') {
      if (pokemon.quantity > 1) pokemon.quantity -= 1
    } else {
      pokemon.quantity += 1
    }
  }
  showCartToast() {
    const toast = document.getElementById('cart-toast');
    if (toast) {
      toast.classList.remove('opacity-0'); 
      setTimeout(() => {
        toast.classList.add('opacity-0'); 
      }, 2500);
    }
  }
  openModal() {
    this.showModal = true
  }
  closeModal() {
    this.showModal = false;
  }

  addToCart(pokemon: Pokemon) {
    const cart_id = this._user.currentUser?.cart?.id
    if (!cart_id) {
      console.log('cart id is missing')
      return
    } else {
      console.log('Your cart_id is ::->', cart_id)
    }

    const body = {
      pokemon: { id: pokemon.id },
      cart: { id: cart_id },
      quantity: pokemon.quantity
    }
    this._cartItem.addToCart(body).subscribe(res => {
      console.log(res)
    })
  }
  updateQuantityOnePokemon(status: string, pokemon: Pokemon | null) {
    if (!pokemon) return; // ป้องกัน error ถ้าไม่มีข้อมูล

    if (!pokemon.selectedQuantity) {
      pokemon.selectedQuantity = 1; // ตั้งค่าเริ่มต้น
    }

    if (status === 'increase' && pokemon.selectedQuantity < pokemon.quantity) {
      pokemon.selectedQuantity++;
    } else if (status === 'decrease' && pokemon.selectedQuantity > 1) {
      pokemon.selectedQuantity--;
    }
  }

  addToCartOnePokemon(pokemon: Pokemon) {
    const cart_id = this._user.currentUser.cart.id;
    if (!cart_id) {
      console.log('cart id is missing');
      return;
    } else {
      console.log('Your cart_id is ::->', cart_id);
    }
    const quantity = pokemon.selectedQuantity ?? 1

    const body = {
      pokemon: {
        id: pokemon.id,
        stockQuantity: pokemon.quantity  // ส่ง stockQuantity ที่มีอยู่ในสินค้าทั้งหมด
      },
      cart: { id: cart_id },
      quantity: quantity  // ใช้ selectedQuantity ที่ผู้ใช้เลือก
    };

    this._cartItem.addToCart(body).subscribe(res => {
      this._cart.addLocalItem({
        ...pokemon,
        selectedQuantity: quantity,  // ใช้ selectedQuantity ที่ผู้ใช้เลือก
        stockQuantity: pokemon.quantity      // ใช้ stockQuantity เพื่อเก็บจำนวนสินค้า
      });
      console.log('Add to cart response:', res);
    });

    // ✅ อัปเดตข้อมูลใหม่ใน localStorage และ broadcast ไปยัง Navbar
    this._cart.saveCartToStorage();
    this._cart.broadcastCart();
  }


  fetchPokemonList() {
    this._pokemon.GetAllPokemon().subscribe((data: Pokemon[]) => {
      this.pokemonList = data.map(pokemon => ({
        ...pokemon,
        selectedQuantity: 1
      }));
  
      // 🔥 ต้องมีบรรทัดนี้ เพื่อให้ filtered เริ่มจากทั้งหมดก่อน
      this.filteredPokemonList = [...this.pokemonList];
  
      this.totalPages = Math.ceil(this.filteredPokemonList.length / this.itemsPerPage);
      this.updatePagination();
    });
  }
  

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPokemonList = this.filteredPokemonList.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.filteredPokemonList.length / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

}
