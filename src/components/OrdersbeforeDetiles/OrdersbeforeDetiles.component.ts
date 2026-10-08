import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { AllFollwoingLocation } from '../../interface/All-Follwoing-Location';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-OrdersbeforeDetiles',
  templateUrl: './OrdersbeforeDetiles.component.html',
  styleUrls: ['./OrdersbeforeDetiles.component.css'],
  imports:[TranslateModule]
})
export class OrdersbeforeDetilesComponent implements OnInit {

  private following = inject(FolllowOrdersService)
  private Auth = inject(Auth)
  constructor(private Router:Router) {}

  showing = signal<AllFollwoingLocation[]>([])
  IsLoding = signal<boolean>(true)

  async ngOnInit() {
    const currntId =  this.Auth.currentUser?.uid
    if(currntId){
      ((await this.following.getClientOrders(currntId)).subscribe({
        next:(data) => {
          if(data){
            console.log('hello' , data)
            this.showing.set(data)
            this.IsLoding.set(false)
          }
        },
        error:(err) => {
          console.log(err)
          this.IsLoding.set(false)
        }
      }))
    }
  }



  Deteils = signal([
  {id:1 , take:false},
  {id:2 , take:false},
  {id:3 , take:false},
  {id:4 , take:false},
  {id:5 , take:false},
  {id:6 , take:false},
  {id:7 , take:false},
  {id:8 , take:false},
])




  Check(id:number){
    this.Deteils.update(up => up.map(vers => {
      const end = !vers.take
      if(vers.id === id){
        return{...vers , take:end}
      }else{
        return vers;
      }
    }))
  }



  startFun(id:string){
    this.Router.navigate(['/client/order',id])
  }




}
