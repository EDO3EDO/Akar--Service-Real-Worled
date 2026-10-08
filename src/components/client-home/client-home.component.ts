import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthanticationService } from '../../services/Authantication.service';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { firstValueFrom, single, take } from 'rxjs';
import { Router, RouterLink } from "@angular/router";
import { UserData } from '../../interface/UserData';
import { AdminCatigoryService } from '../../services/AdminCatigory.service';
import { AdminCatigory } from '../../interface/AdminCatigory';
import { RecommendedOffer, ServiceItem } from '../../interface/RecommendedOffer';
import { SystemChatComponent } from "../system-chat/system-chat.component";

@Component({
  selector: 'app-client-home',
  templateUrl: './client-home.component.html',
  imports: [TranslateModule, CommonModule, DatePipe, SystemChatComponent],
  styleUrls: ['./client-home.component.css']
})
export class ClientHomeComponent implements OnInit {

  constructor(private router:Router) { }

  private Auth = inject(AuthanticationService)
  private following = inject(FolllowOrdersService)
  private catigory = inject(AdminCatigoryService)
  private priceCache = new Map<string, number>();


  showData = signal<UserData | null>(null)
  showCat = signal<RecommendedOffer[]>([])
  showSer = signal<ServiceItem[]>([])
  IsLoding = signal<boolean>(true)
  servicePrice = signal<number>(0);

  async ngOnInit() {

    /// get price
    const currentEdit = this.following.getEdit();
    if (currentEdit && currentEdit.id) {
      this.id = currentEdit.id;
      this.selectService = currentEdit.serviceTitle || '';
      this.sertype = currentEdit.type || '';
      this.selectIcon = currentEdit.icon || '';

      if (this.priceCache.has(this.id)) {
        this.servicePrice.set(this.priceCache.get(this.id)!);
      } else {
        const details = await this.following.getServicePriceAndDetails();
        if (details) {
          this.servicePrice.set(details.price);
          this.priceCache.set(this.id, details.price);
        }
      }
    }


    /// end get price


    //// get active service
    this.catigory.getActiveServices().subscribe({
      next: (data) => {
        if (data) {
          this.showSer.set(data);
        }
      },
      error: (err) => { console.log('no data serr' + err); }
    });

    //// end active service
    this.Auth.getUserData().subscribe({
      next: (data) => {
        if (data) {
          this.showData.set(data);
        }
      },
      error: (err) => { console.log(err); }
    });

    //// display cart for carirr
    this.catigory.getActiveOffers().subscribe({
      next: (data) => {
        if (data) {
          this.showCat.set(data);
          this.IsLoding.set(false);
        }
      },
      error: (err) => {
        console.log(`showCat Is : ${err}`);
        this.IsLoding.set(false);
      }
    });

  }



  ///// active for recommend card

    cardSelected = signal([
    {orderUid:1 , select:false , icon:'ac_unit' , service:'Air Conditioning' , card:'card'},
    {orderUid:2 , select:false , icon:'cleaning_services' , service:'Air Conditioning' , card:'card'},
    {orderUid:3 , select:false , icon:'electrical_services' , service:'Air Conditioning' , card:'card'},
  ])


  checkCard(id:number){
    this.resetser()
    this.cardSelected.update(select => select.map(card => {
      const end = !card.select
      if(card.orderUid === id){
        return {...card , select:end}
      }else{
        return {...card , select:false}
      }
    }))
  }


  resetCard(){
    this.cardSelected.update(select => select.map(card => ({...card , select:false})))
  }


/////////////////////////

  orderSelected = signal([
    {orderUid:1 , select:false , icon:'electrical_services' , ser:'ser'},
    {orderUid:2 , select:false , icon:'plumbing' , ser:'ser'},
    {orderUid:3 , select:false , icon:'ac_unit' , ser:'ser'},
    {orderUid:4 , select:false , icon:'carpenter' , ser:'ser'},
    {orderUid:5 , select:false , icon:'cleaning_services' , ser:'ser'},
    {orderUid:6 , select:false , icon:'pest_control', ser:'ser'},
  ])


  selectPrice = 300


  check(id:number){
    this.resetCard()
    this.orderSelected.update(up => up.map(order => {
      const end = !order.select
      if(order.orderUid === id){
        return{...order , select:end}
      }else {
        return{...order , select:false}
      }
    })
  )
  }

resetser(){
  this.orderSelected.update(select => select.map(order => ({...order , select:false})))
}


selectService = '';
sertype = ''
selectIcon:string = '';
id = ''




async selectSer(id:string , icon:string , ser:string , type:string) {
    this.selectService = ser;
    this.selectIcon = icon;
    this.sertype = type
    this.id = id



    this.following.CreatEdit({id:this.id, type:this.selectService , icon: this.selectIcon , serType:this.sertype });

if (this.priceCache.has(id)) {
        this.servicePrice.set(this.priceCache.get(id)!);
        return;
    }


    const details = await this.following.getServicePriceAndDetails();
    if (details) {
        this.servicePrice.set(details.price);
        this.priceCache.set(id, details.price);
    }



}


async Selected() {
  try {

    await this.router.navigate(['client/addlocation']);
  } catch (error) {
    console.error("fk on create order:", error)
  }
}




Sup(){
  this.router.navigate([('/client/sup')])
}






}
