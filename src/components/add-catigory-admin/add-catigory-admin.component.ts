import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCatigoryService } from '../../services/AdminCatigory.service';
import { RecommendedOffer } from '../../interface/RecommendedOffer';


@Component({
  selector: 'app-add-catigory-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-catigory-admin.component.html',
  styleUrls: ['./add-catigory-admin.component.css']
})
export class AddCatigoryAdminComponent implements OnInit {
  private adminCatigoryService = inject(AdminCatigoryService);

  offers = signal<RecommendedOffer[]>([]);
  selectedFile: File | null = null;
  isLoading = false;

  newOffer: Omit<RecommendedOffer, 'id'> = {
    title: '',
    description: '',
    price: 0,
    badgeText: 'خصم خاص',
    category: 'special_discount',
    imageUrl: '',
    rating: 4.8,
    ratingCount: 100,
    isActive: true
  };

  ngOnInit(): void {
    // جلب قائمة العروض الحالية
    this.adminCatigoryService.getAllOffers().subscribe({
      next: (data) => this.offers.set(data),
      error: (err) => console.error('خطأ أثناء جلب العروض:', err)
    });
  }

  // التقاط الملف عند اختياره من الـ Input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  // إضافة الكارت جديد
  async onSubmit(): Promise<void> {
    if (!this.newOffer.title || !this.newOffer.price) return;

    this.isLoading = true;
    try {
      let finalImageUrl = this.newOffer.imageUrl;

      // 1. رفع الصورة أولاً إذا تم اختيار ملف
      if (this.selectedFile) {
        finalImageUrl = await this.adminCatigoryService.uploadImage(this.selectedFile);
      }

      // 2. إنشاء الكارت في Firestore
      await this.adminCatigoryService.createOffer({
        ...this.newOffer,
        price: Number(this.newOffer.price),
        rating: Number(this.newOffer.rating),
        ratingCount: Number(this.newOffer.ratingCount),
        imageUrl: finalImageUrl
      });

      this.resetForm();
      alert('تم إضافة الكارت بنجاح!');
    } catch (error) {
      console.error('خطأ أثناء إضافة الكارت:', error);
      alert('حدث خطأ أثناء إضافة الكارت.');
    } finally {
      this.isLoading = false;
    }
  }

  // تبديل حالة التفعيل (إظهار / إخفاء)
  async toggleStatus(offer: RecommendedOffer): Promise<void> {
    if (offer.id) {
      await this.adminCatigoryService.toggleOfferStatus(offer.id, !offer.isActive);
    }
  }

  // حذف الكارت
  async removeOffer(id?: string): Promise<void> {
    if (id && confirm('هل أنت متأكد من حذف هذا الكارت؟')) {
      await this.adminCatigoryService.deleteOffer(id);
    }
  }

  // إعادة ضبط النموذج
  private resetForm(): void {
    this.selectedFile = null;
    this.newOffer = {
      title: '',
      description: '',
      price: 0,
      badgeText: 'خصم خاص',
      category: 'special_discount',
      imageUrl: '',
      rating: 4.8,
      ratingCount: 100,
      isActive: true
    };
  }
}
