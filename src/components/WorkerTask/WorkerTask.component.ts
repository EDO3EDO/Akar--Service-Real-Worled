import { AllFollwoingLocation } from './../../interface/All-Follwoing-Location';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { single, tap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-WorkerTask',
  templateUrl: './WorkerTask.component.html',
  imports: [TranslateModule, FormsModule,CommonModule],
  styleUrls: ['./WorkerTask.component.css']
})
export class WorkerTaskComponent implements OnInit {

  constructor(private Router:Router) { }

  private following = inject(FolllowOrdersService)
  private Auth = inject(Auth)


  ShowOrder = signal<AllFollwoingLocation[]>([])

  async ngOnInit(){
    const workerId = this.Auth.currentUser?.uid;
    console.log('start' , workerId)
    if(workerId){
      (await this.following.getWorkerOrders(workerId)).subscribe({
        next:(data) => {
          if(data){
            this.ShowOrder.set(data)
          }
        }
      })
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
    this.Router.navigate(['/worker/workerorder' , id])
  }




}
