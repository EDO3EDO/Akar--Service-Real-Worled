import { Component, inject, OnInit } from '@angular/core';
import { AuthanticationService } from '../../services/Authantication.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user',
  imports:[FormsModule , CommonModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  private Authant = inject(AuthanticationService)

  constructor(private _AuthanticationService:AuthanticationService) { }

  name:string = ''
  email:string = ''
  password:string = ''
  role: 'clint' | 'worker' = 'clint' ;
  job:'Electricity' | 'Plumbing' | 'Air Conditioning' | 'Carpentry' | 'Cleaning' | 'Pest Control' | 'None' = 'Electricity';


  adminEmail = 'admin123@gmail.com'
  adminPassword = 'Admin123@Password'


  userRole$ = this.Authant.getUserRole()


  OnCreateUser(){
    this._AuthanticationService.CreatUserEmail( this.name , this.email , this.password ,this.adminEmail , this.adminPassword  , this.role , this.job ).subscribe({
      next:(res) => {
        console.log('Gamed:', res)
        this.email = ''
        this.password = ''
      },
      error:(res) => {
        console.log('fk:' , res)
      }
    })
  }



  ngOnInit() {
  }

}
