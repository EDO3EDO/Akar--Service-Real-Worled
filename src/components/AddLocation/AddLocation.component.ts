import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocationSavedService } from '../../services/locationSaved.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { AuthanticationService } from '../../services/Authantication.service';
import { FolllowOrdersService } from '../../services/FolllowOrders.service';
import { Router } from '@angular/router';
import { Location } from '../../interface/Location';
import { Auth } from '@angular/fire/auth';
import { Edit } from '../../interface/Edit';
import { SupscribtionService } from '../../services/Supscribtion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaymentPayload, PaymentResponse } from '../../interface/PaymentData';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-AddLocation',
  templateUrl: './AddLocation.component.html',
  imports: [TranslateModule, FormsModule, CommonModule, ReactiveFormsModule],
  styleUrls: ['./AddLocation.component.css']
})
export class AddLocationComponent implements OnInit {
  private LocationSer = inject(LocationSavedService);
  private Auth = inject(AuthanticationService);
  private auth = inject(Auth);
  private following = inject(FolllowOrdersService);
  private sup = inject(SupscribtionService);
  private paymobService = inject(PaymentService);
  private sanitizer = inject(DomSanitizer);
  private firestore = inject(Firestore);

  constructor(private Router: Router, private cdr: ChangeDetectorRef) {}

  showser = signal<any>(null);
  ShowLocation = signal<Location[]>([]);
  ShowLoc = signal<any>(null);


  servicePrice = signal<number>(0);

  locationForm = new FormGroup({
    Compound: new FormControl('', Validators.required),
    Building: new FormControl('', Validators.required),
    Unit: new FormControl('', Validators.required),
    NOTE: new FormControl(''),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)])
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  async ngOnInit() {
    this.generateDynamicDays();

    const tempService = this.following.getEdit();
    if (tempService) {
      this.showser.set(tempService);

      if (tempService.id) {
        this.fetchPriceForDisplay(tempService.id, tempService.type);
      }
    } else {
      console.log('fk we cant do this');
    }

    const clientId = this.auth.currentUser?.uid;

    if (clientId) {
      (await this.LocationSer.getClientLocation(clientId)).subscribe({
        next: (data) => {
          if (data) {
            this.ShowLocation.set(data);
          }
        },
        error: (err) => console.log(err)
      });
    }

    if (clientId) {
      this.LocationSer.getItem(clientId).subscribe({
        next: (data) => {
          if (data) {
            this.ShowLoc.set(data);
          }
        },
        error: (err) => console.log(err)
      });
    }
  }


  async fetchPriceForDisplay(id: string, type: string) {
    try {
      const colName = type === 'card' ? 'recommended_offers' : 'services';
      const docRef = doc(this.firestore, `${colName}/${id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const price = data?.['price'] || 0;
        this.servicePrice.set(price);
      }
    } catch (error) {
      console.error("خطأ في جلب السعر للعرض:", error);
    }
  }

  visitCount = computed(async () => await this.sup.consumeVisit());
  carrirCount = computed(async () => await this.sup.consumeAc());

  Locate = signal<Location[]>([]);

  mainloc = signal({
    Compound: '',
    Building: '',
    Unit: '',
    Visit: '',
    Date: '',
    Time: '',
    Payment: '',
    firbaseId: '',
    NOTE: '',
    phone: '',
  });

  followNavigate() {
    this.Router.navigate(['/client/orders']);
  }

  paymentNavigate() {
    this.Router.navigate(['/client/payment']);
  }

  Navigation() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const main = this.selectPy;

    if (main === 'BOOKING_DETAILS.PAYMENT_CASH') {
      this.followNavigate();
    } else if (main === 'BOOKING_DETAILS.PAYMENT_CREDIT') {
      return;
    }
  }

  orderSelected = signal([
    { orderUid: 1, select: false },
    { orderUid: 2, select: false },
    { orderUid: 3, select: false },
    { orderUid: 4, select: false },
    { orderUid: 5, select: false },
    { orderUid: 6, select: false },
  ]);

  LocSelected = signal([
    { orderUid: 1, select: false },
    { orderUid: 2, select: false },
    { orderUid: 3, select: false },
    { orderUid: 4, select: false },
  ]);

  CheckLoc(id: number) {
    this.LocSelected.update(up => up.map(loc => {
      const end = !loc.select;
      if (loc.orderUid === id) {
        return { ...loc, select: end };
      } else {
        return { ...loc, select: false };
      }
    }));
  }

  check(id: number) {
    this.orderSelected.update(up => up.map(order => {
      const end = !order.select;
      if (order.orderUid === id) {
        return { ...order, select: end };
      } else {
        return { ...order, select: false };
      }
    }));
  }

  PymentSelected = signal([
    { orderUid: 1, select: false },
    { orderUid: 2, select: false },
  ]);

  checkPyment(id: number) {
    this.PymentSelected.update(up => up.map(order => {
      const end = !order.select;
      if (order.orderUid === id) {
        return { ...order, select: end };
      } else {
        return { ...order, select: false };
      }
    }));
  }

  selectPy: string = '';

  selectPyment(pyment: string) {
    this.selectPy = pyment;
  }

  clientCheck: string | undefined = this.auth.currentUser?.uid;
  selectVisit: string = '';
  selectDate: string = '';

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

  selectdAte: number = parseInt(new Date().toLocaleDateString('en-Us', { day: 'numeric' }));
  slectDate: string = new Date().toLocaleDateString('en-US');

  selectT(visit: string) {
    this.selectVisit = visit;
  }

  newCompound(comp: string) {
    this.mainloc.update(prev => ({ ...prev, Compound: comp }));
  }

  newBuilding(build: string) {
    this.mainloc.update(prev => ({ ...prev, Building: build }));
  }

  newUnit(unit: string) {
    this.mainloc.update(prev => ({ ...prev, Unit: unit }));
  }

  newNOTE(newNote: string) {
    this.mainloc.update(prev => ({ ...prev, NOTE: newNote }));
  }

  newPhone(newPhone: string) {
    this.mainloc.update(prev => ({ ...prev, phone: newPhone }));
  }

  selectTime(event: any) {
    const Time = event.target.value;
    this.mainloc.update(prev => ({ ...prev, Time: Time }));
  }

  async addLocate() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const generatedId = doc(collection(this.LocationSer['firestore'], this.LocationSer.LocationName)).id;
    const loc: Location = {
      Compound: this.mainloc().Compound,
      Building: this.mainloc().Building,
      Unit: this.mainloc().Unit,
      Visit: this.selectVisit,
      Date: this.selectdAte,
      Time: this.mainloc().Time,
      Payment: this.selectPy,
      firbaseId: generatedId,
      NOTE: this.mainloc().NOTE,
      clientId: this.clientCheck,
      showDate: this.slectDate,
      phone: this.mainloc().phone
    };

    try {
      const docRef = await this.LocationSer.creatItem(loc);
      const FirebaseId = docRef.id;
      loc.firbaseId = FirebaseId;
      await this.LocationSer.UpdateItem(FirebaseId, loc);
      this.mainloc.update(prev => ({ ...prev, firbaseId: FirebaseId }));
    } catch {
      console.log('loc:fk');
    }
  }

  async UpdateOrder() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const Uid = await firstValueFrom(this.Auth.getCurrentUserId());
    const orderId = await this.following.getActiveOrderId();
    const editData = this.following.getEdit();

    const loc: Edit = {
      Compound: this.mainloc().Compound,
      Building: this.mainloc().Building,
      Unit: this.mainloc().Unit,
      Visit: this.selectVisit,
      Date: this.selectdAte,
      Time: this.mainloc().Time,
      Payment: this.selectPy,
      firbaseId: orderId,
      NOTE: this.mainloc().NOTE,
      clientId: Uid,
      showDate: this.slectDate,
      icon: editData ? editData.icon : '',
      phone: this.mainloc().phone
    };

    try {
      const ActiveOrder = await this.following.CreateCompleteOrder(loc);
      if (ActiveOrder) {
        this.following.setActiveOrder(ActiveOrder);
      }
    } catch {
      console.error('fk');
    }
  }

  SelectLoc: any = null;

  selectLocation(loc: any) {
    this.SelectLoc = loc;
  }

  saveSelectedLocation() {
    if (!this.SelectLoc) return;

    this.locationForm.patchValue({
      Compound: this.SelectLoc.Compound,
      Building: this.SelectLoc.Building,
      Unit: this.SelectLoc.Unit
    });

    this.mainloc.update(prev => ({
      ...prev,
      Compound: this.SelectLoc.Compound,
      Building: this.SelectLoc.Building,
      Unit: this.SelectLoc.Unit
    }));
  }

  loading = signal<boolean>(false);
  iframeUrl = signal<SafeResourceUrl | null>(null);

  pay() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const currentService = this.showser();
    const currentUser = this.auth.currentUser;

    if (!currentService || !currentService.id || !currentUser) {
      console.error("بيانات الطلب أو المستخدم غير مكتملة");
      return;
    }

    this.loading.set(true);
    this.iframeUrl.set(null);

    const paymentData: PaymentPayload = {
      paymentType: "service",
      user: {
        uid: currentUser.uid,
        email: currentUser.email || 'client@example.com',
        name: currentUser.displayName || 'عميل',
        phone: this.mainloc().phone || currentUser.phoneNumber || '+201000000000'
      },
      serviceInfo: {
        serviceId: currentService.id,
        type: currentService.type,
        icon: currentService.icon
      },

    };

    this.paymobService.getPaymentKey(paymentData).subscribe({
      next: (res: PaymentResponse) => {
        const integrationId = '5809243';
        const rawUrl = `https://accept.paymob.com/api/acceptance/iframes/${integrationId}?payment_token=${res.paymentKey}`;

        this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('فشل في جلب مفتاح الدفع:', err);
        this.loading.set(false);
      }
    });
  }
}
