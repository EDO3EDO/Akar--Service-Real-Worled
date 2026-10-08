import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { map, Observable, of, switchMap } from 'rxjs';
import { Location } from '../interface/Location';
import { Auth, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class LocationSavedService {

private firestore = inject(Firestore)
private Auth = inject(Auth)
LocationName = 'Locations';

constructor() {}

async creatItem(data:Location):Promise<any>{
  const docRef = collection(this.firestore,this.LocationName)



  const Q = query(docRef ,
    where('Compound' , '==' , data.Compound),
    where('Building' , '==' , data.Building),
    where('Unit' , '==' , data.Unit)
  )

  const queryCheck = await getDocs(Q);

  if(!queryCheck.empty){
    const exist = queryCheck.docs[0];
    return {id:exist.id , ...exist.data() , alreadyExists: true}
  }
  return addDoc(docRef , data)
}


getItem(docId:string):Observable<any>{
  const docRef = doc(this.firestore , this.LocationName , docId) ;
  return docData(docRef , {idField:'firebaseId'}) as Observable<any>;
}



async deleteItem(firebaseId:string):Promise<any>{
  const docRef = doc(this.firestore , `${this.LocationName}/${firebaseId}`)
  return deleteDoc(docRef)
}


async UpdateItem(firebaseId: string, loc: Location): Promise<any> {
  const itemDoc = doc(this.firestore, `${this.LocationName}/${firebaseId}`);
  return updateDoc(itemDoc, { ...loc, firbaseId: firebaseId });
}





async getClientLocation(clientId:string):Promise<Observable<any>>{
  const docRef = collection(this.firestore , this.LocationName)
  const Query = query(docRef , where('clientId' , '==' , clientId));
  return collectionData(Query , {idField:'id'})
}





////// get phone number


getuserPhone(): Observable<string | null> {
  return user(this.Auth).pipe(
    switchMap(currentUser => {
      if (!currentUser) {
        return of(null);
      }
      const colRef = collection(this.firestore, this.LocationName);
      const q = query(colRef, where('clientId', '==', currentUser.uid));
      return collectionData(q).pipe(
        map((locations: any[]) => {
          if (locations && locations.length > 0) {
            return locations[0]?.phone ?? null;
          }
          return null;
        })
      );
    })
  );
}


async updateLatestUserPhone(clientId: any, newPhone: string): Promise<void> {
    const colRef = collection(this.firestore, this.LocationName);
    const q = query(
      colRef,
      where('clientId', '==', clientId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const latestDoc = querySnapshot.docs[0];
      const latestDocRef = doc(this.firestore, `${this.LocationName}/${latestDoc.id}`);
      await updateDoc(latestDocRef, { phone: newPhone });
    }
  }




}
