import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common'; //
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaymentService } from '../../services/payment.service';
import { PaymentPayload, PaymentResponse } from '../../interface/PaymentData';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { AuthanticationService } from '../../services/Authantication.service';
import { UserData } from '../../interface/UserData';
import localeAr from '@angular/common/locales/ar';
import { firstValueFrom } from 'rxjs';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { ServiceItem } from '../../interface/RecommendedOffer';
import { AdminCatigoryService } from '../../services/AdminCatigory.service';
registerLocaleData(localeAr);

@Component({
  selector: 'app-Supscription',
  templateUrl: './Supscription.component.html',
  styleUrls: ['./Supscription.component.css'],
  standalone: true,
  imports: [
    CommonModule, // 👈 تم إضافته هنا
    TranslateModule,
    RouterOutlet,
    RouterLinkWithHref,
    RouterLinkActive,
    DatePipe
  ]
})
export class SupscriptionComponent implements OnInit {

  private paymobService = inject(PaymentService);
  private sanitizer = inject(DomSanitizer);
  private Auth = inject(AuthanticationService)
  private following = inject(FolllowOrdersService)
  private router = inject(Router)
  private catigory = inject(AdminCatigoryService)

  showData = signal<UserData | null>(null)
  toggle: boolean = false;
  loading = signal<boolean>(false);
  IsLoding = signal<boolean>(true)
  iframeUrl = signal<SafeResourceUrl | null>(null);
  servicePrice = signal<number>(0);
  showSer = signal<ServiceItem[]>([])

  async ngOnInit() {

    ///get price
    const details = await this.following.getServicePriceAndDetails();`
    `
    if (details) {
      this.servicePrice.set(details.price);
      console.log(this.servicePrice())
    }



    //// get active service

    this.catigory.getActiveServices().subscribe({
      next:(data) => {
        if(data){
          this.showSer.set(data)
        }
      }, error: (err) => {console.log('no data serr' + err)}
    })



    ////end active service





        this.Auth.getUserData().subscribe({
      next:(data) => {
        if(data){
          this.showData.set(data)
          this.IsLoding.set(false)

        }
        console.log(this.showData()?.supscription?.status)
      },
      error:(err) => {console.log(err); this.IsLoding.set(false)}
    })

  }





  funtoggle() {
    this.toggle = !this.toggle;
  }




//// claculate %

visitsRemainingProgress = computed(() => {
  const usage = this.showData()?.supscription?.usage?.freeVisits ?? 0;
  const history = this.showData()?.supscription?.history?.freeVisitsHistory ?? 0;

  const total = usage + history;
  if (total === 0) return 0;

  return Math.round((usage / total) * 100);
});

CarrirRemainingProgress = computed(() => {
  const usage = this.showData()?.supscription?.usage?.acMaintenanceCount ?? 0;
  const history = this.showData()?.supscription?.history?.acMaintenanceCountHistory ?? 0;

  const total = usage + history;
  if (total === 0) return 0;

  return Math.round((usage / total) * 100);
});





/////////////.....creat order


  orderSelected = signal([
    {orderUid:1 , select:false , icon:'electrical_services' , ser:'ser'},
    {orderUid:2 , select:false , icon:'plumbing' , ser:'ser'},
    {orderUid:3 , select:false , icon:'ac_unit' , ser:'ser'},
    {orderUid:4 , select:false , icon:'carpenter' , ser:'ser'},
    {orderUid:5 , select:false , icon:'cleaning_services' , ser:'ser'},
    {orderUid:6 , select:false , icon:'pest_control', ser:'ser'},
  ])




  check(id:number){
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






selectService = '';
sertype = ''
selectIcon:string = '';
id = ''




selectSer(id:string , icon:string , ser:string , type:string) {
    this.selectService = ser;
    this.selectIcon = icon;
    this.sertype = type
    this.id = id
    console.log(this.selectIcon , this.selectService)
}


async Selected() {
  try {

    const pointer = await this.following.CreatEdit({id:this.id, type:this.selectService , icon: this.selectIcon , serType:this.sertype });
      await this.router.navigate(['client/addlocation']);
  } catch (error) {
    console.error("fk on create order:", error)
  }
}






}
