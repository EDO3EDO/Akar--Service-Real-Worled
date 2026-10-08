import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SupService {

constructor() { }
private firestore = inject(Firestore)
SupName = 'Supscription'



async CreateSup(clientId:string , packageData:any):Promise<any>{
  const docRef = doc(this.firestore ,`UserSup/${clientId}`)

  await setDoc(docRef , {
    clientId: clientId,
    packageId: packageData.id,
    packageName: packageData.name,
    discount: packageData.discount,
    remainingACMaintenance: packageData.freeACMaintenanceCount,
    startDate: Timestamp.now(),
    expiryDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
  })
}








}
