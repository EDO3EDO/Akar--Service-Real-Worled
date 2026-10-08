import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { doc, docData, Firestore, updateDoc } from '@angular/fire/firestore';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Following } from '../../interface/following';
import { AllFollwoingLocation } from '../../interface/All-Follwoing-Location';
import { Auth } from '@angular/fire/auth';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-WorkerOrder',
  templateUrl: './WorkerOrder.component.html',
  imports:[TranslateModule , CommonModule],
  styleUrls: ['./WorkerOrder.component.css']
})
export class WorkerOrderComponent implements OnInit {
  private firestore = inject(Firestore)
  private Auth = inject(Auth)
  private following = inject(FolllowOrdersService)
  private route = inject(ActivatedRoute)
  constructor() { }




  ShowOrder = signal<AllFollwoingLocation[]>([])

  orderId = this.route.snapshot.paramMap.get('id')
  async ngOnInit(){
    console.log(this.orderId)
    if(this.orderId){
      (await this.following.getOrderId(this.orderId)).subscribe({
        next:(data) => {
          console.log('First item structure:', data[0]);
          if(data){
            console.log('hello' , data)
            this.ShowOrder.set([data])

          }
        }
      })
    }
  }


  showing = computed(() => {
    return this.ShowOrder().filter(s => s.id === this.orderId)
  })



  async UpdateStatus(OrderId:string , NewStatus:number){

    try{
      await this.following.UpdateOrderStatus(OrderId , NewStatus);
      console.log('nice')
      this.ShowOrder.update(orders => orders.map(order => order.id === OrderId ? {...order , status:NewStatus} : order ))
    }catch(err){
      console.log(err)
    }

  }




}
