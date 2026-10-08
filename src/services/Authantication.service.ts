import { AdminId, UserSubscription, workerData } from './../interface/UserData';
import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, user } from '@angular/fire/auth';
import { collection, collectionData, doc, docData, Firestore, getDoc, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, from, map, Observable, of, startWith, switchMap } from 'rxjs';
import { UserData } from '../interface/UserData';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthanticationService {

  private firestore = inject(Firestore)
  private Auth = inject(Auth)
  private admin = 'admin123@gmail.com'
  private storage = inject(Storage)

constructor(private _Router:Router) {

user(this.Auth).subscribe((u)=>{
    if(u){
      this.IslogedIn.next(true)
    }else{
      this.IslogedIn.next(false)
    }
})

}

IslogedIn = new BehaviorSubject<boolean>(false)




SignIn(email: string, password: string) {
  return from(signInWithEmailAndPassword(this.Auth, email, password)).pipe(
    switchMap((userCredential) => {
      const user = userCredential.user;
      const userDoc = doc(this.firestore, `users/${user.uid}`);
      return from(setDoc(userDoc, {
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL
      }, { merge: true })).pipe(
        map(() => user)
      );
    })
  );
}
async SignOut(){
  await signOut(this.Auth)
  this._Router.navigate([('/Sign-In')])
}






CreatUserEmail(name:string , email:string ,  password:string , adminEmail:string , adminPassword:string , role:'clint' | 'worker' , job:'Electricity' | 'Plumbing' | 'Air Conditioning' | 'Carpentry' | 'Cleaning' | 'Pest Control' | 'None'):Observable<any>{

return from(createUserWithEmailAndPassword(this.Auth , email , password)).pipe(
  switchMap((save) => {
    const user = save.user
    const DocRef = doc(this.firestore , `users/${user.uid}`)
    return from(setDoc(DocRef, {
      email:user.email,
      uid:user.uid,
      role:role,
      IsActive:false,
      job:job,
      name:name,
      phone:'',
      photo:'Avatar.png',
      Bio:'',
      IdPhoto:['' , ''],
      CreatDat: new Date(),
      supscription:{
          plan: 'free',
          billingCycle: 'none',
          status: 'inactive',
          startDate:null,
          endDate: null,
          usage: {
              freeVisits: 0,
              acMaintenanceCount: 0
            },
            history: {
              freeVisitsHistory:0,
              acMaintenanceCountHistory:0
            }
      },

    },{merge:true}))
  }),
  switchMap(() => {
    return from(signOut(this.Auth))
  }),
  switchMap(() => {
    return from(signInWithEmailAndPassword(this.Auth , adminEmail , adminPassword))
  }),
  map(() => {
    return {success:true , message:'hello from another side'}
  })
)

}



////// get user IsActive ===> complete the profile

getUserIsActive():Observable<boolean | null>{
  return user(this.Auth).pipe(
    switchMap(currentuser => {
      if(!currentuser) return of(null);
      const docRef = doc(this.firestore , `users/${currentuser?.uid}`)
      return docData(docRef).pipe(
        map((Data:any) => {return Data && Data['IsActive'] ? Data['IsActive'] : false} )
      )
    }),
    startWith(false)
  )
}


//////////////// Update User IsActive to True after submit


  async UpdateUserIsActive():Promise<any>{
  const data = this.Auth.currentUser
  if(data){
    const docRef = doc(this.firestore , `users/${data.uid}`)
    await updateDoc(docRef , {IsActive:true})
  }else{
    throw new Error('can not Update this promise')
  }
}




//////////// get user role






getUserRole():Observable<string | null>{
  return new Observable<any>((observ) => {
    this.Auth.onAuthStateChanged((user) => observ.next(user));
  }).pipe(
    switchMap((user) => {
      if(!user) return of(null);
      if(user.email === this.admin){
        return of('admin')
      }
      const docRef = doc(this.firestore , `users/${user.uid}`)
      return from(getDoc(docRef)).pipe(
        map((snap) => {
          if(snap.exists()){
            return snap.data()['role'];
          }
          return null;
        })

      )
    }),
  catchError(() => of(null))
);
}


//////// Get User Data


getUserData():Observable<UserData | null>{
  return user(this.Auth).pipe(
    switchMap(currentUser => {
      if(!currentUser) return of(null);
        const docRef = doc(this.firestore , `users/${currentUser.uid}`)
        return docData(docRef).pipe(
          map((Data : any) =>  (Data as UserData) || null )
        )
    })
  )
}

getAllWorkerData(worker:string):Observable<workerData[]>{
  return user(this.Auth).pipe(
    switchMap(currentUser => {
      if(!currentUser) return of([]);
        const docRef = collection(this.firestore , `users`)
        const q = query(docRef , where('role', '==' , worker))
        return collectionData(q).pipe(
          map((Data : any) =>  (Data as workerData[]) || [] )
        )
    })
  )
}



getCurrentUserId(): Observable<string | null> {
  return new Observable<any>((observ) => {
    const unsup = this.Auth.onAuthStateChanged((user) => {
      observ.next(user)
    });
    return () => unsup();
  }).pipe(
    map((user) => (user ? user.uid : null))
  );
}






signout(){
  signOut(this.Auth);
  this._Router.navigate([('/login')])
  localStorage.clear()
}






////// Photo && Name && Bio && IdPhoto



getIdPhoto():Observable<AdminId | null>{
  return user(this.Auth).pipe(
    switchMap(currentuser => {
      if(!currentuser) return of(null);
      const docRef = doc(this.firestore , `users/${currentuser.uid}`)
      return docData(docRef).pipe(
        map((Data : any)=> {
          if(Data && Data['IdPhoto']){
            return Data['IdPhoto'] as AdminId
          }
          return null;
        }),
        startWith(null)
      )
    })
  )
}


private async uploadImageFile(file:File , path:string):Promise<string>{
    const storagRef = ref(this.storage , path)
    const uploadResult = await uploadBytes(storagRef , file)
    return await getDownloadURL(uploadResult.ref)
}


async updateIdPhoto(frontFile:File , backFile:File):Promise<any>{
  const data = this.Auth.currentUser
  const uid = data?.uid
  if (!data) throw new Error('Not Logged In')

    const frontUrl = await this.uploadImageFile(frontFile, `worker_ids/${uid}_front_${Date.now()}`);
    const backUrl  = await this.uploadImageFile(backFile , `worker_ids/${uid}_back_${Date.now()}`);

    const docRef = doc(this.firestore , `users/${uid}`)
    await setDoc(docRef , {IdPhoto:{front:frontUrl , back:backUrl}},{merge:true})
}


getuserPhoto():Observable<string | null>{
  return user(this.Auth).pipe(
    switchMap(currntUser => {
      if(!currntUser){
        return of(null)
      }
      const docRef = doc(this.firestore , `users/${currntUser.uid}`)
      return docData(docRef).pipe(
        map((userData :any) => {
          return userData && userData['photo'] ? userData['photo'] : 'Avatar.png';
        }),
        startWith('Avatar.png')
      )
    })
  )
}


async updateuserPhoto(newPhoto:string):Promise<any>{
  const data = this.Auth.currentUser;
  if(data){
    const docRef = doc(this.firestore , `users/${data.uid}`)
    return updateDoc(docRef , {photo:newPhoto})
  }else{
    return new Error('can not Update')
  }

}


/////// get usetphone and update

getuserPhone():Observable<string | null>{
  return user(this.Auth).pipe(
    switchMap(currntUser => {
      if(!currntUser){
        return of(null)
      }
      const docRef = doc(this.firestore , `users/${currntUser.uid}`)
      return docData(docRef).pipe(
        map((userData :any) => {
          return userData && userData['phone'] ? userData['phone'] : '';
        }),
        startWith('')
      )
    })
  )
}


async updateuserPhone(newPhone:string):Promise<any>{
  const data = this.Auth.currentUser;
  if(data){
    const docRef = doc(this.firestore , `users/${data.uid}`)
    return updateDoc(docRef , {phone:newPhone})
  }else{
    return new Error('can not Update')
  }

}



getuserName():Observable<string | any >{
  return user(this.Auth).pipe(
    switchMap(currntUser => {
      if(!currntUser){
        return of(null)
      }
      const docRef = doc(this.firestore , `users/${currntUser.uid}`)
      return docData(docRef).pipe(
        map((userData :any) => {
          return userData && userData['name'] || userData['Name'] || ''
        }),
        startWith('')
      )
    })
  )
}

async updateuserName(newName:string):Promise<any>{
  const data = this.Auth.currentUser;
  if(data){
    const docRef = doc(this.firestore , `users/${data.uid}`)
    return updateDoc(docRef , {name:newName})
  }else{
    return new Error('can not update name')
  }
}


getuserBio():Observable<string | any>{
  return user(this.Auth).pipe(
    switchMap(currntUser => {
      if(!currntUser){
        return of(null)
      }
      const docRef = doc(this.firestore , `users/${currntUser}`)
      return docData(docRef).pipe(
        map((userData :any) => {
          return userData && userData['Bio'] ? userData['Bio'] : ''
        }),
        startWith('')
      )
    })
  )
}



async updatUserBio(newbio:string):Promise<any>{
  const data = this.Auth.currentUser;
  if(data){
    const docRef = doc(this.firestore , `users/${data}`)
    return updateDoc(docRef , {Bio:newbio})
  }else{
    return new Error('can not update bio')
  }
}


/// get email

getuserEmail():Observable<string | null>{
  return user(this.Auth).pipe(
    switchMap(currntuser => {
      if(!currntuser){
        return of(null)
      }
      const docRef = doc(this.firestore , `users/${currntuser}`)
      return docData(docRef).pipe(
        map((userdata:any) => userdata && userdata?.['email'] || null)
      )
    })
  )
}





///////// update passowrd

async updatePassowrd(newPass:string):Promise<any>{
  const user = this.Auth.currentUser
  if(user){
    await updatePassword(user , newPass)
  }else{
    throw new Error('can not update the passowrd')
  }
}





}
