import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Drug } from '../../models/drug.model';
import { Shop } from '../../models/shop.model';
import { ShopService } from '../../services/shop.service';
import { ShopFormComponent } from '../shop-form/shop-form.component';

@Component({
  selector: 'app-drug-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShopFormComponent],
  template: `
    <div class="form-overlay" (click)="onCancel()">
      <div class="form-container" (click)="$event.stopPropagation()">
        <div class="form-header">
          <h2 class="form-title">{{ isEditMode ? '✏️ Edit Drug' : '➕ Add New Drug' }}</h2>
          <button class="close-button" (click)="onCancel()" type="button">✕</button>
        </div>

        <form [formGroup]="drugForm" (ngSubmit)="onSubmit()">
          <div class="form-body">
            <!-- Metadata ID -->
            <div class="form-group">
              <label for="metadataId" class="form-label">
                Metadata ID <span class="required">*</span>
              </label>
              <input
                id="metadataId"
                type="number"
                class="form-input"
                formControlName="metadataId"
                placeholder="Enter metadata ID"
                [class.error]="isFieldInvalid('metadataId')"
              />
              <div *ngIf="isFieldInvalid('metadataId')" class="error-message">
                <span *ngIf="drugForm.get('metadataId')?.errors?.['required']">
                  Metadata ID is required
                </span>
              </div>
            </div>

            <!-- Package Size ID -->
            <div class="form-group">
              <label for="drugPackageSizeId" class="form-label">
                Package Size ID <span class="required">*</span>
              </label>
              <input
                id="drugPackageSizeId"
                type="number"
                class="form-input"
                formControlName="drugPackageSizeId"
                placeholder="Enter package size ID"
                [class.error]="isFieldInvalid('drugPackageSizeId')"
              />
              <div *ngIf="isFieldInvalid('drugPackageSizeId')" class="error-message">
                <span *ngIf="drugForm.get('drugPackageSizeId')?.errors?.['required']">
                  Package Size ID is required
                </span>
              </div>
            </div>

            <!-- Shop -->
            <div class="form-group">
              <label for="shopId" class="form-label">
                Shop <span class="required">*</span>
              </label>
              <div class="shop-select-wrapper">
                <select
                  id="shopId"
                  class="form-input"
                  formControlName="shopId"
                  [class.error]="isFieldInvalid('shopId')"
                  (change)="onShopChange($event)"
                >
                  <option value="" disabled>Select a shop</option>
                  <option value="new" class="create-new-option">➕ Create New Shop</option>
                  <option *ngFor="let shop of shops" [value]="shop.id">
                    {{ shop.name }} - {{ shop.city || 'No city' }}
                  </option>
                </select>
              </div>
              <div *ngIf="isFieldInvalid('shopId')" class="error-message">
                <span *ngIf="drugForm.get('shopId')?.errors?.['required']">
                  Shop is required
                </span>
              </div>
            </div>

            <!-- Bought On -->
            <div class="form-group">
              <label for="boughtOn" class="form-label">
                Bought On <span class="required">*</span>
              </label>
              <input
                id="boughtOn"
                type="datetime-local"
                class="form-input"
                formControlName="boughtOn"
                [class.error]="isFieldInvalid('boughtOn')"
              />
              <div *ngIf="isFieldInvalid('boughtOn')" class="error-message">
                <span *ngIf="drugForm.get('boughtOn')?.errors?.['required']">
                  Bought On is required
                </span>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="button" class="btn btn-cancel" (click)="onCancel()">
              Cancel
            </button>
            <button type="submit" class="btn btn-submit" [disabled]="drugForm.invalid">
              {{ isEditMode ? 'Update Drug' : 'Add Drug' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shop Form Modal -->
    <app-shop-form
      *ngIf="showShopForm"
      (save)="saveNewShop($event)"
      (cancel)="hideShopForm()"
    ></app-shop-form>
  `,
  styles: [`
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .form-container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px 32px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }

    .close-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }

    .form-body {
      padding: 32px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }

    .required {
      color: #ef4444;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 15px;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    select.form-input {
      cursor: pointer;
      background-color: white;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 40px;
    }

    .create-new-option {
      font-weight: 700;
      color: #667eea;
      background-color: #f0f4ff;
    }

    .shop-select-wrapper {
      position: relative;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .form-input.error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      margin-top: 6px;
      font-size: 13px;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-message::before {
      content: '⚠';
      font-size: 14px;
    }

    .form-footer {
      padding: 24px 32px;
      background: #f8fafc;
      border-radius: 0 0 20px 20px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .btn-cancel {
      background: white;
      color: #64748b;
      border-color: #e2e8f0;
    }

    .btn-cancel:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .btn-submit {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 576px) {
      .form-container {
        max-width: 100%;
        border-radius: 20px 20px 0 0;
        align-self: flex-end;
      }

      .form-header,
      .form-body,
      .form-footer {
        padding-left: 20px;
        padding-right: 20px;
      }

      .form-footer {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class DrugFormComponent implements OnInit {
  @Input() drug?: Drug;
  @Output() save = new EventEmitter<Omit<Drug, 'id'> | Drug>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private shopService = inject(ShopService);
  
  drugForm!: FormGroup;
  isEditMode = false;
  shops: Shop[] = [];
  showShopForm = false;

  ngOnInit() {
    this.isEditMode = Boolean(this.drug);
    this.loadShops();
    this.initializeForm();
  }

  private loadShops() {
    this.shopService.getAllShops().subscribe({
      next: (response) => {
        this.shops = response.shops;
      },
      error: (err) => console.error('Error loading shops:', err)
    });
  }

  private initializeForm() {
    // Set boughtOn to current time for new drugs
    const currentDateTime = this.drug?.boughtOn 
      ? this.formatDateForInput(this.drug.boughtOn) 
      : this.formatDateForInput(new Date());

    this.drugForm = this.fb.group({
      metadataId: [
        this.drug?.metadataId ?? null,
        [Validators.required]
      ],
      drugPackageSizeId: [
        this.drug?.drugPackageSizeId ?? null,
        [Validators.required]
      ],
      shopId: [
        this.drug?.shopId ?? null,
        [Validators.required]
      ],
      boughtOn: [currentDateTime, [Validators.required]]
    });
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.drugForm.get(fieldName);
    return Boolean(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.drugForm.valid) {
      const formValue = { ...this.drugForm.value };
      
      // Convert boughtOn to Date if provided
      if (formValue.boughtOn) {
        formValue.boughtOn = new Date(formValue.boughtOn);
      }

      if (this.isEditMode && this.drug) {
        // For edit mode, keep existing amountLeftInPercentage
        if (this.drug.amountLeftInPercentage !== undefined) {
          formValue.amountLeftInPercentage = this.drug.amountLeftInPercentage;
        }
        this.save.emit({ ...formValue, id: this.drug.id });
      } else {
        // For new drugs, initialize amountLeftInPercentage to 100
        formValue.amountLeftInPercentage = 100;
        this.save.emit(formValue);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onShopChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'new') {
      this.showShopForm = true;
      // Reset to empty selection
      this.drugForm.patchValue({ shopId: '' });
    }
  }

  hideShopForm() {
    this.showShopForm = false;
  }

  saveNewShop(shopData: Omit<Shop, 'id'>) {
    this.shopService.createShop(shopData).subscribe({
      next: (response) => {
        // Reload shops to include the new one
        this.loadShops();
        // Select the newly created shop
        setTimeout(() => {
          // Find the new shop (assuming it has the highest ID)
          this.shopService.getAllShops().subscribe({
            next: (shopsResponse) => {
              const newShop = shopsResponse.shops[shopsResponse.shops.length - 1];
              this.drugForm.patchValue({ shopId: newShop.id });
            }
          });
        }, 100);
        this.hideShopForm();
      },
      error: (err) => console.error('Error creating shop:', err)
    });
  }
}
