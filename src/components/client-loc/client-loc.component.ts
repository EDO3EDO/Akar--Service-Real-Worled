import { AllFollwoingLocation } from './../../interface/All-Follwoing-Location';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { TranslateModule } from '@ngx-translate/core';
import { LocationSavedService } from '../../services/locationSaved.service';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { collection, doc } from '@angular/fire/firestore';
import { Location } from '../../interface/Location';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-client-loc',
  templateUrl: './client-loc.component.html',
  imports:[TranslateModule,FormsModule,CommonModule, ReactiveFormsModule],
  styleUrls: ['./client-loc.component.css']
})
export class ClientLocComponent implements OnInit {

  constructor() { }
  ////injectiotns
  private auth = inject(Auth)
  private LocationSer = inject(LocationSavedService)
  private following = inject(FolllowOrdersService)

/////////////signals

ShowLocation = signal<AllFollwoingLocation[]>([])
IsLoding = signal<boolean>(true)


  async ngOnInit() {

    this.generateDynamicDays();




    // old locations
    const clientId = this.auth.currentUser?.uid
if(clientId){
  (await this.LocationSer.getClientLocation(clientId)).subscribe({
    next: (data) => {
      console.log('Its Not Here',data)
      if(data){
        this.ShowLocation.set(data)
        this.IsLoding.set(false)
      }
    },
    error: (err) => {
      console.log(err);
      this.IsLoding.set(false)
    }
  })
}

  }



////////////////save location


Locate = signal<Location[]>([])

mainloc = signal({
  Compound:'',
  Building:'',
  Unit:'',
  Visit:'',
  Date:'',
  Time:'',
  Payment:'',
  firbaseId:'',
  NOTE:''
})


selectTime(event:any){

  const Time = event.target.value;

  switch(Time){
    case 0: 'BOOKING_DETAILS.TIME_MORNING';
    break;
    case 1: 'BOOKING_DETAILS.TIME_NOON';
    break;
    case 2: 'BOOKING_DETAILS.TIME_EVENING';
    break;
    default:'BOOKING_DETAILS.TIME_MORNING';
  }

  this.mainloc.update( prev => ({...prev , Time:Time}))

}




selectT(visit:string) {
this.selectVisit = visit;
}



  orderSelected = signal([
    {orderUid:1 , select:false},
    {orderUid:2 , select:false},
    {orderUid:3 , select:false},
    {orderUid:4 , select:false},
    {orderUid:5 , select:false},
    {orderUid:6 , select:false},
  ])


  LocSelected = signal([
    {orderUid:1 , select:false},
    {orderUid:2 , select:false},
    {orderUid:3 , select:false},
    {orderUid:4 , select:false},
  ])

  CheckLoc(id:number){
    this.LocSelected.update(up => up.map(loc => {
      const end = !loc.select
      if(loc.orderUid === id){
        return {...loc , select:end};
      }else{
        return {...loc , select:false}
      }
    }))
  }


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




    PymentSelected = signal([
    {orderUid:1 , select:false},
    {orderUid:2 , select:false},
  ])


  checkPyment(id:number){
    this.PymentSelected.update(up => up.map(order => {
      const end = !order.select
      if(order.orderUid === id){
        return{...order , select:end}
      }else {
        return{...order , select:false}
      }
    })
  )
  }


  selectPy:string = '';

selectPyment(pyment:string) {
this.selectPy = pyment;
}





selectVisit:string = '';
selectDate:string = '';

VisitDay: string[] = [];


  generateDynamicDays() {

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayShortName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      this.VisitDay.push(`BOOKING_DETAILS.DAY_${dayShortName}`);
    }
  }

  getCardDayNumber(index: number): number {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.getDate();
  }







selectdAte:number = parseInt(new Date().toLocaleDateString('en-Us', {day:'numeric'}));








  newCompound(comp:string){
  this.mainloc.update( prev => ({...prev , Compound:comp}))
}

  newBuilding(build:string){
  this.mainloc.update( prev => ({...prev , Building:build}))
}

  newUnit(unit:string){
  this.mainloc.update( prev => ({...prev , Unit:unit}))
}







async addLocate(){

  const currentUserId = this.auth.currentUser?.uid;

  if (!currentUserId) {
    console.log('loc:fk - User not authenticated yet!');
    return;
  }




  const generatedId = doc(collection(this.LocationSer['firestore'], this.LocationSer.LocationName)).id;
  const loc:Location = {
  Compound:this.mainloc().Compound,
  Building:this.mainloc().Building,
  Unit:this.mainloc().Unit,
  Visit:this.selectVisit,
  Date:this.selectdAte,
  Time:this.mainloc().Time,
  Payment:this.selectPy,
  firbaseId:generatedId,
  NOTE:this.mainloc().NOTE,
  clientId:currentUserId

}

try{
    const docRef = await this.LocationSer.creatItem(loc);
    const FirebaseId = docRef.id;
    loc.firbaseId = FirebaseId;
    await this.LocationSer.UpdateItem(FirebaseId, loc);
    this.mainloc.update(prev => ({ ...prev, firbaseId: FirebaseId }));
    this.mainloc.update(prev => ({...prev, Compound:'' , Building:''  , Unit:'' }))
  console.log('loc:good')
}catch(err){
  console.log('loc:fk' , err)
}


}



async deleteLoc(firebaseId:string){

  try{
    this.LocationSer.deleteItem(firebaseId);
    console.log('ez')
    this.ShowLocation.update(l => l.filter(m => m.firbaseId !== firebaseId))
  }catch{
    console.log('Not Ez')
  }


}

















}
