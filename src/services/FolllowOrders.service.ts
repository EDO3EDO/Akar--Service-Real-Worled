import { inject, Injectable, signal } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, getDoc, getDocs, onSnapshot, query, runTransaction, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { Following } from '../interface/following';
import { Auth } from '@angular/fire/auth';
import { Location } from '../interface/Location';

@Injectable({
  providedIn: 'root'
})
export class FolllowOrdersService {
  ActiveOrderId: any;
  constructor() { }


private firestore = inject(Firestore)
private Auth = inject(Auth)
private cachedServiceDetails: any = null;
OrderName = 'orders'



async getActiveOrderId(): Promise<string | null> {
  const uid = this.Auth.currentUser?.uid;
  if (!uid) return null;

  const docRef = doc(this.firestore, `users/${uid}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data()['activeOrderId'] || null;
  }
  return null;
}


async setActiveOrder(orderId: string): Promise<void> {
  const uid = this.Auth.currentUser?.uid;
  if (!uid) return;
  const docRef = doc(this.firestore, `users/${uid}`);
  await setDoc(docRef, { activeOrderId: orderId }, { merge: true });
}

async clearActiveOrder(): Promise<void> {
  const uid = this.Auth.currentUser?.uid;
  if (!uid) return;
  const docRef = doc(this.firestore, `users/${uid}`);
  await setDoc(docRef, { activeOrderId: null }, { merge: true });
}


creatSerialNumber(){
  return Math.floor(10000 + Math.random() * 50000);
}


CreateFollowing(clientId:string , serviceType:string , icon:string):Observable<any>{
  const serial = this.creatSerialNumber()
  const customId = `#${serial}`
  const order:Following = {
    clientId:clientId,
          workerstatus:'pending',
          icon:icon,
          workerId:'',
          serviceType:serviceType,
          status: 1,
          serialNumber:`#${serial}`,
          creatdAt: new Date(),
        }

        const docRef = collection(this.firestore,this.OrderName)
  return from(addDoc(docRef , order)).pipe(
    map( (ref) => ref.id)
  )
}

getFollowing(Docid:string):Observable<any>{
  const docRef = doc(this.firestore , this.OrderName , Docid)
  return docData(docRef);
}



async CreatPointerSelectService(clientId: string, serviceType: string, icon: string): Promise<any> {
  try {
    const pointerDocRef = doc(this.firestore, `service_pointers/${serviceType}`);
    const workersCollectionRef = collection(this.firestore, 'users');


    return await runTransaction(this.firestore, async (transaction) => {

      const WorkesQuery = query(workersCollectionRef, where('role', '==', 'worker'), where('job', '==', serviceType));
      const WorkesList = await getDocs(WorkesQuery);
      const WorkeUidAll = WorkesList.docs.map(v => v.id);

      if (WorkeUidAll.length === 0) throw new Error("لا يوجد عمال متاحين");


      const pointerSnap = await transaction.get(pointerDocRef);
      let nextIndex = pointerSnap.exists() ? (pointerSnap.data()['nextWorkerIndex'] || 0) : 0;


      if (nextIndex >= WorkeUidAll.length) nextIndex = 0;
      const assignedWorkerId = WorkeUidAll[nextIndex];


      transaction.set(pointerDocRef, { nextWorkerIndex: (nextIndex + 1) % WorkeUidAll.length }, { merge: true });


      const orderRef = collection(this.firestore, this.OrderName);
      const newOrderRef = doc(orderRef);
      transaction.set(newOrderRef, {
        clientId,
        workerId: assignedWorkerId,
        workerstatus: 'assigned',
        icon,
        serviceType,
        status: 1,
        serialNumber: `#${this.creatSerialNumber()}`,
        creatdAt: new Date(),
        id:newOrderRef.id
      });

      return newOrderRef.id;
    });
  } catch (err) {
    console.error("خطأ في الـ Transaction:", err);
    return null;
  }
}


getPointerSelectSer(workerId:string):Observable<any>{
  const docRef = doc(this.firestore , this.OrderName , workerId)
  return docData(docRef)
}

//Worker Showing

async getWorkerOrders(workerId:string):Promise<Observable<any>>{
  const docRef = collection(this.firestore , this.OrderName)
  const Query = query(docRef , where('workerId', '==' , workerId));
  return collectionData(Query , {idField:'id'})
}

async getOrderId(Id:string):Promise<Observable<any>>{
  const docRef = doc(this.firestore ,`${this.OrderName}/${Id}`)
  return docData(docRef, {idField:'id'})
}

// Client Showing

async getClientOrders(clientId:string):Promise<Observable<any>>{
  const docRef = collection(this.firestore , this.OrderName)
  const Query = query(docRef , where('clientId' , '==' , clientId));
  return collectionData(Query , {idField:'id'})
}


async getClientOrderId(Id:string):Promise<Observable<any>>{
  const docRef = doc(this.firestore ,`${this.OrderName}/${Id}`)
  return docData(docRef , {idField:'id'})
}



////Area:string , Bullding:string , Unit:string , Date:string , Time:string , Pyment:string

async UpdatePointerSelectSer(firbaseId:string | null , Addres:Location):Promise<any>{
  const docRef = doc(this.firestore , `${this.OrderName}/${firbaseId}`)
  await updateDoc(docRef , {...Addres , firbaseId:firbaseId})
}




async UpdateOrderStatus(OrderId:string , NewStatus:number):Promise<any>{
  const docRef = doc(this.firestore , `${this.OrderName}/${OrderId}`)
  return updateDoc(docRef , {
    status:NewStatus
  });
}


//////////////////edit on addLocation & client Home To Fix Fake Order Problem

ServiceEdit = signal<{ id: string; type:string; icon: string; serType:string} | null>(null);

CreatEdit(serviceItem: { id: string; type:string; icon: string; serType:string}) {
  this.ServiceEdit.set(serviceItem);
  localStorage.setItem('serviceEdit', JSON.stringify(serviceItem));
}

getEdit() {
  const savedService = localStorage.getItem('serviceEdit');
  if (savedService) {
    const parsed = JSON.parse(savedService);
    this.ServiceEdit.set(parsed);
    return parsed;
  }
  return this.ServiceEdit();
}

clearEdit() {
  this.ServiceEdit.set(null);
  localStorage.removeItem('serviceEdit');
}
async CreateCompleteOrder(locationData: any): Promise<any> {
  const Uid = this.Auth.currentUser?.uid;
  const serviceInfo = this.getEdit();

  if (!Uid || !serviceInfo) throw new Error("Missing data");

  try {
    const collectionName = serviceInfo.type === "card" ? "recommended_offers" : "services";
    const serviceDocRef = doc(this.firestore, `${collectionName}/${serviceInfo.id}`);

    const serviceSnap = await getDoc(serviceDocRef);
    if (!serviceSnap.exists()) {
      throw new Error("الخدمة المطلوبة غير موجودة");
    }
    const serviceData = serviceSnap.data();
    const serviceTypeName = serviceData?.['name'] || serviceData?.['title'] || '';
    const serviceJob = serviceData?.['job'] || serviceData?.['category'] || serviceTypeName;
    const serviceIcon = serviceInfo.icon || serviceData?.['icon'] || serviceData?.['imageUrl'] || '';
    const servicePrice = serviceData?.['price'] || 0;

    const pointerDocRef = doc(this.firestore, `service_pointers/${serviceInfo.id}`);
    const workersCollectionRef = collection(this.firestore, 'users');

    return await runTransaction(this.firestore, async (transaction) => {

      const WorkesQuery = query(workersCollectionRef, where('role', '==', 'worker'), where('job', '==', serviceJob));
      const WorkesList = await getDocs(WorkesQuery);
      const WorkeUidAll = WorkesList.docs.map(v => v.id);
      if (WorkeUidAll.length === 0) throw new Error("لا يوجد عمال متاحين لهذه الخدمة");

      const pointerSnap = await transaction.get(pointerDocRef);
      let nextIndex = pointerSnap.exists() ? (pointerSnap.data()['nextWorkerIndex'] || 0) : 0;
      if (nextIndex >= WorkeUidAll.length) nextIndex = 0;
      const assignedWorkerId = WorkeUidAll[nextIndex];

      transaction.set(pointerDocRef, { nextWorkerIndex: (nextIndex + 1) % WorkeUidAll.length }, { merge: true });

      const orderRef = collection(this.firestore, this.OrderName);
      const newOrderRef = doc(orderRef);

      transaction.set(newOrderRef, {
        clientId: Uid,
        workerId: assignedWorkerId,
        workerstatus: 'assigned',
        serviceType: serviceTypeName,
        price: servicePrice,
        icon: serviceIcon,
        ...locationData,
        status: 1,
        serialNumber: `#${this.creatSerialNumber()}`,
        creatdAt: new Date(),
        id: newOrderRef.id,
      });
      return newOrderRef.id;
    });
  } catch (err) {
    console.error("خطأ:", err);
    return null;
  }
}




private lastFetchedServiceId: string | null = null;

async getServicePriceAndDetails(): Promise<any> {
    const serviceInfo = this.getEdit();
    if (!serviceInfo || !serviceInfo.id) return null;

    try {
      const isCard = serviceInfo.serType === 'card' || serviceInfo.type === 'card';
      const colName = isCard ? 'recommended_offers' : 'services';



      const docRef = doc(this.firestore, `${colName}/${serviceInfo.id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const serverData = docSnap.data();
        return {
          ...serviceInfo,
          price: serverData?.['price'] || 0,
          title: serverData?.['title'] || serverData?.['name'] || ''
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    }
}




}
