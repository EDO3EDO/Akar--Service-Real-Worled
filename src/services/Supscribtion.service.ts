import { computed, Injectable, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { doc, docData, Firestore, increment, updateDoc } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { UserData } from '../interface/UserData';
import { PRICING } from '../config/price.config';

@Injectable({
  providedIn: 'root'
})
export class SupscribtionService {

  currentuser = signal<UserData | null>(null)

constructor(private Auth:Auth , private firestore:Firestore) {
  user(this.Auth).pipe(
    switchMap(currntUser => {
      if(currntUser){
        const docRef = doc(this.firestore , `users/${currntUser.uid}`)
        return docData(docRef) as Observable<UserData>;
      }else{
        return of(null)
      }
    })
  ).subscribe(data => {
    this.currentuser.set(data)
  });

}


// like Isloding => to show this client isSup or Not
isSupscriped = computed(() => {
  const sup = this.currentuser()?.supscription

  if(!sup || sup.status !== 'active')return false;

  if(sup.endDate){
    return new Date(sup.endDate) > new Date() ;
  }

  return false;

})



//// cheak client plan


currntPlan = computed(() => this.currentuser()?.supscription?.plan || 'free')




//// get price from plans by Id

getPrice(planId:'basic' | 'premium' , cycle:'monthly' | 'yearly'):number{
  const plan = PRICING.find(p => p.id === planId)
  if(!plan) return 0;
  return cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice ;
}



///// get discound but Not calculat just get

getDiscound():number{
  if(!this.isSupscriped) return 0;
  const planId = this.currntPlan()
  const planInfo = PRICING.find(p => p.id === planId)
  return planInfo ? planInfo.discountPercentage : 0 ;
}

//// calculat discound just calculat not use here



  calculatDiscound(orginalPric:number):number{
    const discound = this.getDiscound();
    if(discound === 0) return orginalPric;
    const discoundAmount = (orginalPric * discound) / 100;
    return orginalPric - discoundAmount ;
  }





  //// quta decrimant from visit

  async consumeVisit():Promise<boolean>{
    const userdata = this.currentuser()
    const userplan = userdata?.supscription
    if(this.isSupscriped() && (userplan?.usage?.freeVisits ?? 0) > 0 ){
      const docRef = doc(this.firestore , `users/${userdata!.uid}`)
      await updateDoc(docRef , {'supscription.usage.freeVisits': increment(-1)})
      await updateDoc(docRef , {'supscription.history.freeVisitsHistory': increment(+1)})
      return true;
    }
    return false;
  }


  ///// quta decrimant from acMaintenanceCount


  async consumeAc():Promise<boolean>{
    const userdata = this.currentuser()
    const userPlan = userdata?.supscription
    if(this.isSupscriped() && (userPlan?.usage?.acMaintenanceCount ?? 0 ) > 0){
      const docRef = doc(this.firestore , `users/${userdata!.uid}`)
      await updateDoc(docRef , {'supscription.usage.acMaintenanceCount':increment(-1)})
      await updateDoc(docRef , {'supscription.history.acMaintenanceCountHistory':increment(+1)})
      return true ;
    }
    return false;
  }


async activateSupscribtion(cycle: 'monthly' | 'yearly', plan: 'basic' | 'premium'): Promise<void> {
  let user = this.currentuser();

  if (!user) {
    const firebaseUser = this.Auth.currentUser;
    if (firebaseUser) {
      user = { uid: firebaseUser.uid } as any;
    } else {
      console.error('لا يوجد مستخدم مسجل الدخول لتفعيل الاشتراك');
      return;
    }
  }

  const selectedPlan = PRICING.find(p => p.id === plan);
  if (!selectedPlan) {
    console.error('الباقة غير موجودة:', plan);
    return;
  }

  const startDate = new Date();
  const endDate = new Date(startDate);

  if (cycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (cycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const usgeQuta = { ...selectedPlan.quta };
  const HistoryQuta = { ...selectedPlan.history };

  const newSupscribtion = {
    plan: plan,
    billingCycle: cycle,
    status: 'active' as const,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    usage: usgeQuta,
    history:HistoryQuta
  };

  try {
    const docRef = doc(this.firestore, `users/${user?.uid}`);

    await updateDoc(docRef, {
      supscription: newSupscribtion
    });

    console.log('تم تحديث الفايرستور بنجاح!');

    this.currentuser.update(curr => {
      if (!curr) return curr;
      return {
        ...curr,
        supscription: newSupscribtion
      };
    });

  } catch (err) {
    console.error('خطأ أثناء الكتابة في Firestore:', err);
    throw err;
  }
}







}
