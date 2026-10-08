import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop'; // استيراد toSignal

import { AdminCatigoryService } from '../../services/AdminCatigory.service';
import { ServiceItem } from '../../interface/RecommendedOffer';

@Component({
  selector: 'app-AdminCreatService',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './AdminCreatService.component.html',
  styleUrls: ['./AdminCreatService.component.css']
})
export class AdminCreatServiceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicesService = inject(AdminCatigoryService);

  serviceForm!: FormGroup;

  // تحويل البيانات القادمة من الـ Service إلى Signal مباشرة
  services = toSignal(this.servicesService.getAllServices(), { initialValue: [] });

  // متغيرات الحالة كـ Signals
  isEditing = signal<boolean>(false);
  editingServiceId = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    // مش محتاجين loadServices تقليدية لأن toSignal هتدير الـ Observable لوحدها
  }

  initForm(): void {
    this.serviceForm = this.fb.group({
      code: ['SRV-AC-02', [Validators.required]],
      name: ['', [Validators.required]],
      price: [250, [Validators.required, Validators.min(0)]],
      icon: ['', [Validators.required]],
      isActive: [true]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const formValues = this.serviceForm.value;

    try {
      if (this.isEditing() && this.editingServiceId()) {
        await this.servicesService.updateService(this.editingServiceId()!, formValues);
      } else {
        await this.servicesService.createService(formValues);
        console.log('تمت إضافة الخدمة بنجاح');
      }
      this.onReset();
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ الخدمة:', error);
    }
  }

  onEdit(service: ServiceItem): void {
    this.isEditing.set(true);
    this.editingServiceId.set(service.id || null);

    this.serviceForm.patchValue({
      code: service.code,
      name: service.name,
      price: service.price,
      icon: service.icon,
      isActive: service.isActive
    });
  }

  async onToggleStatus(service: ServiceItem): Promise<void> {
    if (!service.id) return;
    try {
      await this.servicesService.toggleServiceStatus(service.id, !service.isActive);
    } catch (error) {
      console.error('خطأ في تغيير حالة الخدمة:', error);
    }
  }

  async onDelete(id?: string): Promise<void> {
    if (!id) return;
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        await this.servicesService.deleteService(id);
      } catch (error) {
        console.error('خطأ أثناء الحذف:', error);
      }
    }
  }

  onReset(): void {
    this.isEditing.set(false);
    this.editingServiceId.set(null);

    this.serviceForm.reset({
      code: 'SRV-AC-02',
      price: 250,
      isActive: true
    });
  }
}
