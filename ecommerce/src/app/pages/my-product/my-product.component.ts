import { Component, HostListener, OnInit } from '@angular/core';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Genre, Pokemon, PokemonService } from '../../services/pokemon.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-my-product',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './my-product.component.html',
  styleUrl: './my-product.component.scss'
})
export class MyProductComponent implements OnInit {
  constructor(private _pokemon: PokemonService, private http: HttpClient, private _user: UserService,) { }
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  pokemonList: Array<Pokemon> = [];
  selectedPokemonId: number | null = null;
  onePokemon: Pokemon | null = null;
  selectedFiles: File[] = [];
  imageUrls: string[] = [];
  selectedImage = '';
  selectedImageList: string[] = [];
  pageSize = 10;
  currentPage = 1;
  pokemonObject = {
    name: '',
    author: '',
    des: '',
    quantity: '',
    pages: '',
    price: '',
    publicationYear: '',
    genre: '',
    translator: '',
    publisher: '',
    isbn: '',
    imageFile: null as File | null,
    imageUrl: '',
    user: { id: '' }
  };
  editProduct: any = {}
  editGenreDropdownOpen = false;
  genreOptions = Object.values(Genre); 
  

  ngOnInit() {
    setTimeout(() => {
      this.getPokemonByUser()
      this.formInit()
    }, 500);
  }
  formInit() {
    if (!this._user.currentUser || !this._user.currentUser.id) {
      console.error('user is not logged in', this._user.currentUser);
      return;
    }
    this.pokemonObject = {
      name: '',
      author: '',
      des: '',
      pages: '',
      price: '',
      publicationYear: '',
      genre: '',
      translator: '',
      publisher: '',
      isbn: '',
      quantity: '',
      imageFile: null as File | null,
      imageUrl: '',
      user: { id: this._user.currentUser.id.toString() }
    };
  }
  get paginatedList(): Pokemon[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.pokemonList.slice(start, end);
  }
  
  get totalPages(): number {
    return Math.ceil(this.pokemonList.length / this.pageSize);
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  toggleEditGenreDropdown() {
    this.editGenreDropdownOpen = !this.editGenreDropdownOpen;
  }
  
  onEditGenreCheckboxChange(event: Event, genre: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const genreList = this.editProduct.genre || [];
  
    if (checked) {
      if (!genreList.includes(genre)) {
        genreList.push(genre);
      }
    } else {
      const index = genreList.indexOf(genre);
      if (index !== -1) {
        genreList.splice(index, 1);
      }
    }
  
    this.editProduct.genre = genreList;
  }
  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const dropdown = document.querySelector('.genre-dropdown'); 

  if (this.editGenreDropdownOpen && dropdown && !dropdown.contains(target)) {
    this.editGenreDropdownOpen = false;
  }
}

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
  }
  openEditModal(product: any) {
    this.editProduct = { ...product };
    const modal = document.getElementById('edit_modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }
  
  closeEditModal() {
    const modal = document.getElementById('edit_modal') as HTMLDialogElement;
    if (modal) modal.close();
  }
  openImageModal(imageList: string[], selected: string) {
    this.selectedImageList = imageList;
    this.selectedImage = selected;

    const modal = document.getElementById('image_modal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  closeImageModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      const modal = document.getElementById('image_modal') as HTMLDialogElement;
      if (modal) modal.close();
    }
  }



  getAllPokemon() {
    this._pokemon.GetAllPokemon().subscribe(res => {
      console.log(res);
      this.pokemonList = res;
    });
  }

  getOnePokemon(id: number) {
    this._pokemon.getOnePokemon(id).subscribe(res => {
      console.log(res);
      this.onePokemon = res;
    });
  }
  getPokemonByUser() {
    this._pokemon.getPokemonByUser(this._user.currentUser.id).subscribe(res => {
      console.log(res);
      this.pokemonList = res;
    });
  }

  submitPokemon() {
    const fields = this.pokemonObject;
    const isValid =
      fields.name &&
      fields.des &&
      fields.author &&
      fields.genre &&
      fields.pages &&
      fields.price &&
      fields.quantity &&
      fields.publicationYear &&
      fields.publisher &&
      fields.translator &&
      fields.isbn &&
      this.selectedFiles.length > 0;
    if (!isValid) {
      console.log('❌ กรุณากรอกข้อมูลให้ครบ และเลือกอย่างน้อย 1 รูปภาพ');
      return;
    }
    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('images', file); // ต้องตรงกับชื่อ field ที่ backend รับ
    });
    formData.append('name', fields.name);
    formData.append('author', fields.author);
    formData.append('des', fields.des);
    formData.append('quantity', fields.quantity);
    formData.append('pages', fields.pages);
    formData.append('price', fields.price);
    formData.append('publicationYear', fields.publicationYear);
    formData.append('genre', fields.genre);
    formData.append('translator', fields.translator);
    formData.append('publisher', fields.publisher);
    formData.append('isbn', fields.isbn);
    formData.append('user', this._user.currentUser.id.toString());
    this._pokemon.postPokemon(formData).subscribe(
      res => {
        console.log('Book added with multiple images:', res);
        this.getPokemonByUser();
        this.clearForm();
      },
      error => {
        console.error('🚨 Error adding book:', error);
      }
    );
  }



  clearForm() {
    this.pokemonObject = {
      name: '',
      author: '',
      des: '',
      pages: '',
      price: '',
      quantity: '',
      publicationYear: '',
      genre: '',
      translator: '',
      publisher: '',
      isbn: '',
      imageFile: null as File | null,
      imageUrl: '',
      user: { id: this._user.currentUser.id.toString() }
    };
    this.selectedFiles = [];
    this.imageUrls = [];
  }

  deletePokemon(id: number) {
    this.selectedPokemonId = id;
    this._pokemon.deletePokemon(id).subscribe(res => {
      console.log(res);
      this.getAllPokemon();
    })

  }

  onClickDeletePokemon() {
    if (this.selectedPokemonId === null) {
      console.error('No Pokemon selected to delete');
      return;
    }

    this._pokemon.deletePokemon(this.selectedPokemonId).subscribe(res => {
      console.log('Pokemon deleted successfully', res);
      this.getAllPokemon();
    });
  }

  // onFileSelected(event: any): void {
  //   const file: File = event.target.files[0];
  //   if (file) {
  //     this.selectedFile = file;

  //     // การแสดง preview รูปภาพ
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.imageUrl = reader.result; // แสดงผลลัพธ์ของการอ่านไฟล์เป็น Data URL
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }
  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  removeImage(index: number) {
    this.imageUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('imageFile', this.selectedFile, this.selectedFile.name); // ตรวจสอบว่าชื่อฟิลด์ตรงกับใน interceptor
      formData.append('name', this.pokemonObject.name);
      formData.append('author', this.pokemonObject.author);
      formData.append('des', this.pokemonObject.des);
      formData.append('pages', this.pokemonObject.pages);
      formData.append('price', this.pokemonObject.price);
      formData.append('publicationYear', this.pokemonObject.publicationYear);
      formData.append('genre', this.pokemonObject.genre);
      formData.append('translator', this.pokemonObject.translator);
      formData.append('publisher', this.pokemonObject.publisher);
      formData.append('isbn', this.pokemonObject.isbn);

    }
    this.closeModal();
  }

  closeModal() {
    const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
    if (modal) {
      modal.close()
    }
  }
  openAddModal() {
    const modal = document.getElementById('my_modal_5') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }
  scrollToMyProducts() {
    const myProductsSection = document.getElementById('my-products');
    if (myProductsSection) {
      myProductsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  updateProduct() {
    this._pokemon.updatePokemon(this.editProduct.id, this.editProduct).subscribe(res => {
      console.log('Upload Product: ', res);
      this.getPokemonByUser();
      this.closeEditModal();
    }
    )
  }
}
