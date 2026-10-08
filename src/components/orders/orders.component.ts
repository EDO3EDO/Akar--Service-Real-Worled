import { TranslateModule } from '@ngx-translate/core';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { collection, doc, docData, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { Following } from '../../interface/following';
import { ActivatedRoute } from '@angular/router';
import { AllFollwoingLocation } from '../../interface/All-Follwoing-Location';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  imports:[TranslateModule],
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  private following = inject(FolllowOrdersService)
  private Activate = inject(ActivatedRoute)
  IsLoding = signal<boolean>(true)
  constructor() {}



  currntId = this.Activate.snapshot.paramMap.get('id')

  showOrder = signal<AllFollwoingLocation[]>([])

  async ngOnInit() {
    if(this.currntId){
      (await this.following.getClientOrderId(this.currntId)).subscribe({
        next:(data) => {
          if(data){
            console.log('hello' , data)
            this.showOrder.set([data])
            this.IsLoding.set(false)
          }
        },
        error: (err) => {
          console.log('fk:',err)
          this.IsLoding.set(false)
        }
      })
    }
  }


  showing = computed(() => {
    return this.showOrder().filter(s => s.id === this.currntId)
  })



  async UpdateStatus(OrderId:string , Status:number ){

    try{
      await this.following.UpdateOrderStatus(OrderId , Status)

      this.showOrder.update(order =>
        order.map(o => o.id === OrderId ? {...o , status:Status} : o));
    }catch{
      console.log('fk')
    }






  }

}
