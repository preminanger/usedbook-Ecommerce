import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { NavbarComponent } from "./layout/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ecommerce';
  constructor(
    private _auth : AuthService,
    private _user : UserService,
    private router: Router
  ){}

  ngOnInit(): void {
    let token = localStorage.getItem('access_token')
    console.log('fetch token ::-> ', token)
    if(token){
      this._auth.verify(token).subscribe(x=> {
        console.log('verify response ::-> ', x)
        if(x.status == 'success'){
          this._user.setCurrentUser(x.data)
        }else {
          this.router.navigate(['/log-in'])
        }
      })
    }else {
      this.router.navigate(['/log-in'])
    }
  }
}
