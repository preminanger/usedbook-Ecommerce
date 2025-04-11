import { Component, HostListener, OnInit } from '@angular/core';
import { Genre, Pokemon, PokemonService } from '../../services/pokemon.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from "../../layout/navbar/navbar.component";

@Component({
  selector: 'app-my-item',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    FormsModule,
    RouterLink,
    RouterOutlet, NavbarComponent,],
  templateUrl: './my-item.component.html',
  styleUrl: './my-item.component.scss'
})
export class MyItemComponent implements OnInit {

  constructor(private _pokemon: PokemonService, private http: HttpClient, private _user: UserService, private router: Router) { } // ฉีด HttpClient

  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  pokemonList: Array<Pokemon> = [];
  selectedPokemonId: number | null = null;
  onePokemon: Pokemon | null = null;
  selectedFiles: File[] = [];
  imageUrls: string[] = [];
  selectedImage = '';
  selectedImageList: string[] = [];
  pokemonObject = {
    name: '',
    author: '',
    des: '',
    quantity: '',
    pages: '',
    price: '',
    publicationYear: '',
    genre: [] as string[],
    translator: '',
    publisher: '',
    isbn: '',
    condition: '',
    imageFile: null as File | null,
    imageUrl: '',
    user: { id: '' }
  };
  editProduct: any = {};
  toastMessage: string | null = null;
  hasBankInfo: boolean = false;
  toastType: 'success' | 'error' = 'success';
  genreOptions = Object.values(Genre); // หรือจะ custom array ก็ได้
  genreDropdownOpen = false;
  formSubmitted = false;


  ngOnInit() {
    const userId = this._user.currentUser?.id;
    if (!userId) return;

    this._user.getUserProfile(userId).subscribe((user) => {
      this._user.setCurrentUser(user); // ✅ sync ใหม่
      this.hasBankInfo = !!(user.bank_name && user.account_name && user.account_number);
      this.getPokemonByUser();
      this.formInit();
    });
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
      genre: [] as string[],
      translator: '',
      publisher: '',
      isbn: '',
      quantity: '',
      condition: '',
      imageFile: null as File | null,
      imageUrl: '',
      user: { id: this._user.currentUser.id.toString() }
    };
  }
  toggleGenreDropdown() {
    this.genreDropdownOpen = !this.genreDropdownOpen;
  }
  onGenreCheckboxChange(event: Event, genre: string) {
    const checked = (event.target as HTMLInputElement).checked;
    const genreList = this.pokemonObject.genre;

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
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.genre-dropdown'); // class ของ dropdown container

    // ถ้า click อยู่ข้างนอก genre dropdown ให้ปิด
    if (this.genreDropdownOpen && dropdown && !dropdown.contains(target)) {
      this.genreDropdownOpen = false;
    }
  }

  handleAddClick() {
    this.formSubmitted = true; // ✅ trigger error message

    if (!this.hasBankInfo) {
      this.showToast('! Please add your bank account info first.', 'error');
      setTimeout(() => {
        this.toastMessage = null;
        this.router.navigate(['/bank-account']);
      }, 2500);
      return;
    }

    const isValid = this.isFormValid();

    if (!isValid) {
      this.showToast('! Please complete all required fields.', 'error');
      setTimeout(() => this.toastMessage = null, 3000);
      return;
    }

    this.submitPokemon();
    this.clearForm();
    this.scrollToMyProducts();
    this.showToast(':D product added successfully!', 'success');
    setTimeout(() => this.toastMessage = null, 3000);
  }


  isFormValid(): boolean {
    const f = this.pokemonObject;
    return !!(
      f.name &&
      f.des &&
      f.author &&
      f.genre.length > 0 &&
      f.pages &&
      f.price &&
      f.quantity &&
      f.publicationYear &&
      f.publisher &&
      f.translator &&
      f.isbn &&
      f.condition &&
      this.selectedFiles.length > 0
    );
  }


  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000); // toast จะหายไปใน 3 วินาที
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
      fields.condition &&
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
    formData.append('genre', fields.genre.join(','));
    formData.append('translator', fields.translator);
    formData.append('publisher', fields.publisher);
    formData.append('isbn', fields.isbn);
    formData.append('condition', fields.condition);

    formData.append('user', this._user.currentUser.id.toString());
    this._pokemon.postPokemon(formData).subscribe(
      res => {
        console.log('Book added with multiple images:', res);
        this.getPokemonByUser();
        this.clearForm();
        setTimeout(() => {
          this.showToast('Product added successfully!', 'success');
          this.router.navigate(['/my-product']);
        }, 1200);
      },
      error => {
        console.error(' Error adding book:', error);
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
      genre: [] as string[],
      translator: '',
      publisher: '',
      isbn: '',
      condition: '',
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
      formData.append('genre', this.pokemonObject.genre.join(','));
      formData.append('translator', this.pokemonObject.translator);
      formData.append('publisher', this.pokemonObject.publisher);
      formData.append('isbn', this.pokemonObject.isbn);
      formData.append('condition', this.pokemonObject.condition);

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
      this.closeEditModal()
    })
  }
}
