import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthanticationService } from '../../services/Authantication.service';
import { Auth } from '@angular/fire/auth';
import { LocationSavedService } from '../../services/locationSaved.service';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-editProfileClient',
  templateUrl: './editProfileClient.component.html',
  styleUrls: ['./editProfileClient.component.css'],
  imports: [FormsModule ,CommonModule , ReactiveFormsModule , TranslateModule]
})
export class EditProfileClientComponent implements OnInit {

  constructor() { }
  private Authantication = inject(AuthanticationService)
  private Auth = inject(Auth)
  private location = inject(LocationSavedService)

  userPhoto = signal<any>('Avatar.png')
  userName = signal<string>(this.Auth.currentUser?.displayName || '')
  userPhone = signal<any>('0100000000')
  userEmail = signal<string>(this.Auth.currentUser?.email || '')
  IsLoding = signal<boolean>(true)





  ngOnInit() {
    //// user photo
    this.Authantication.getuserPhoto().subscribe({
      next:(data) => {
        if(data){
          this.userPhoto.set(data)
          this.IsLoding.set(false)
        }
      },
      error:(err) => { console.log(`loaded user Photo ${err}`); this.IsLoding.set(false)}
    })

    //// user Name

    this.Authantication.getuserName().subscribe({
      next:(data) => {
        console.log(data)
        if(data){
          this.userName.set(data)
        }
      },
      error:(err) => {console.log(`user Name cant load ${err}`)}
    })

    ////user phone


    this.location.getuserPhone().subscribe({
      next:(data) => {
        console.log(data)
        if(data){
          this.userPhone.set(data)
        }
      },
      error:(err) => {console.log(`Error In phone Edit: ${err}`)}
    })


  }




  onfileSelect(event:any){
    const file:File = event.target.files[0];
    if(file && file.type.startsWith('image/')){
      const reader = new FileReader();
      reader.onload = async (e:any) => {
        const baseUrl = e.target.result;
        this.userPhoto.set(baseUrl)
        try{
          this.Authantication.updateuserPhoto(baseUrl)
          console.log('file selected')
        }catch{
          console.log('file not selcted ')
        }
      }
      reader.readAsDataURL(file);
    }
  }


async onNameChange(name:string){
  try{
    await this.Authantication.updateuserName(name)
  }catch{
    console.log('can not change name')
  }
}
onPhoneChange(phone:string){
  const currntUser = this.Auth.currentUser?.uid
if(currntUser){
    try{
    this.location.updateLatestUserPhone(currntUser , phone)
  }catch{
    console.log('can not change name')
  }
}
}



}
