import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelpCenterService {

constructor() { }
private firestore = inject(Firestore)



async creatproblem(data:{input:string , userId:string}):Promise<any>{
  const docRef = collection(this.firestore ,`problems`)
  await addDoc(docRef , {
    ...data,
    creatdAt:serverTimestamp(
    )
  })
}


getproblem():Observable<any>{
  const docRef = collection(this.firestore , `problems`)
  return collectionData(docRef , {idField:'id'})
}






}
