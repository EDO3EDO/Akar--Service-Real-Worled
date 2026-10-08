import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthanticationService } from '../../services/Authantication.service';
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [TranslateModule, RouterOutlet],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private Auth = inject(AuthanticationService)
  private AuthId = inject(Auth)
  constructor(private Router:Router) { }

  userPhoto = signal<any>('Avatar.png')
  userName = signal<string>(this.AuthId.currentUser?.displayName || '')
  userEmail = signal<string>(this.AuthId.currentUser?.email || '')
  clientId = this.AuthId.currentUser?.uid
  IsLoding = signal<boolean>(true)




  ngOnInit() {
    this.Auth.getuserPhoto().subscribe({
      next: (data) => {
          this.userPhoto.set(data)
          this.IsLoding.set(false)
      },
      error:(err) => {
        console.log(`user Photo Inside profile: ${err}`)
        this.IsLoding.set(false)
      }
    })


    this.Auth.getuserName().subscribe({
      next:(data) => {
        console.log(data)
        if(data){
          this.userName.set(data)
        }
      },
      error:(err) => {console.log(`user Name cant load ${err}`)}
    })



  }








  SignOut(){
    this.Auth.SignOut()
  }



  getLocation(){
    this.Router.navigate([('/client/clientloc')])
  }


  getPaymentPage(){
    this.Router.navigate([('/client/payment')])
  }

  getHistory(){
    this.Router.navigate([('/client/history')])
  }


  helpcenter(){
    this.Router.navigate([('/client/helpcenter')])
  }


  EditProfile(){
    this.Router.navigate([(`/client/profile/${this.clientId}`)])
  }



}
