import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { RecommendedOffer, ServiceItem } from '../interface/RecommendedOffer';



@Injectable({
  providedIn: 'root'
})
export class AdminCatigoryService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private offersCollection = collection(this.firestore, 'recommended_offers');
  private servicesCollection = collection(this.firestore, 'services');

  constructor() { }

  getActiveOffers(): Observable<RecommendedOffer[]> {
    const q = query(this.offersCollection, where('isActive', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<RecommendedOffer[]>;
  }

  getAllOffers(): Observable<RecommendedOffer[]> {
    return collectionData(this.offersCollection, { idField: 'id' }) as Observable<RecommendedOffer[]>;
  }

async uploadImage(file: File): Promise<string> {
  const filePath = `offers/${Date.now()}_${file.name}`;
  const storageRef = ref(this.storage, filePath);
  const uploadResult = await uploadBytes(storageRef, file);
  console.log('تم رفع الملف بنجاح إلى المسار:', uploadResult.ref.fullPath);
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  console.log('تم استخراج رابط التحميل:', downloadUrl);
  return downloadUrl;
}

  async createOffer(offerData: Omit<RecommendedOffer, 'id'>): Promise<string> {
    const docRef = await addDoc(this.offersCollection, {
      ...offerData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }


  async toggleOfferStatus(id: string, isActive: boolean): Promise<void> {
    const docRef = doc(this.firestore, `recommended_offers/${id}`);
    await updateDoc(docRef, { isActive });
  }


  async deleteOffer(id: string): Promise<void> {
    const docRef = doc(this.firestore, `recommended_offers/${id}`);
    await deleteDoc(docRef);
  }





  /////// service


getActiveServices(): Observable<ServiceItem[]> {
    const q = query(
      this.servicesCollection,
      where('isActive', '==', true),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ServiceItem[]>;
  }



  getAllServices(): Observable<ServiceItem[]> {
    return collectionData(this.servicesCollection, { idField: 'id' }) as Observable<ServiceItem[]>;
  }

  async createService(serviceData: Omit<ServiceItem, 'id'>): Promise<string> {
    const docRef = await addDoc(this.servicesCollection, {
      ...serviceData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  }

  async updateService(id: string, serviceData: Partial<ServiceItem>): Promise<void> {
    const docRef = doc(this.firestore, `services/${id}`);
    await updateDoc(docRef, serviceData);
  }

  async toggleServiceStatus(id: string, isActive: boolean): Promise<void> {
    const docRef = doc(this.firestore, `services/${id}`);
    await updateDoc(docRef, { isActive });
  }

  async deleteService(id: string): Promise<void> {
    const docRef = doc(this.firestore, `services/${id}`);
    await deleteDoc(docRef);
  }

}
