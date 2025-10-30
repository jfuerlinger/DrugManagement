import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Shop } from '../../models/shop.model';

@Component({
  selector: 'app-shop-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-overlay" (click)="onCancel()">
      <div class="form-container" (click)="$event.stopPropagation()">
        <div class="form-header">
          <h2 class="form-title">{{ isEditMode ? '✏️ Edit Pharmacy' : '➕ Add New Pharmacy' }}</h2>
          <button class="close-button" (click)="onCancel()" type="button">✕</button>
        </div>

        <form [formGroup]="shopForm" (ngSubmit)="onSubmit()">
          <div class="form-body">
            <!-- Name -->
            <div class="form-group">
              <label for="name" class="form-label">
                Pharmacy Name <span class="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                class="form-input"
                formControlName="name"
                placeholder="Enter pharmacy name"
                [class.error]="isFieldInvalid('name')"
              />
              <div *ngIf="isFieldInvalid('name')" class="error-message">
                <span *ngIf="shopForm.get('name')?.errors?.['required']">
                  Pharmacy name is required
                </span>
                <span *ngIf="shopForm.get('name')?.errors?.['minlength']">
                  Name must be at least 2 characters
                </span>
              </div>
            </div>

            <!-- Street -->
            <div class="form-group">
              <label for="street" class="form-label">
                Street Address
              </label>
              <input
                id="street"
                type="text"
                class="form-input"
                formControlName="street"
                placeholder="Enter street address"
              />
            </div>

            <!-- Postal Code -->
            <div class="form-group">
              <label for="postalcode" class="form-label">
                Postal Code
              </label>
              <input
                id="postalcode"
                type="text"
                class="form-input"
                formControlName="postalcode"
                placeholder="Enter postal code"
              />
            </div>

            <!-- City -->
            <div class="form-group">
              <label for="city" class="form-label">
                City
              </label>
              <input
                id="city"
                type="text"
                class="form-input"
                formControlName="city"
                placeholder="Enter city"
              />
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label for="phone" class="form-label">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                class="form-input"
                formControlName="phone"
                placeholder="Enter phone number"
                [class.error]="isFieldInvalid('phone')"
              />
              <div *ngIf="isFieldInvalid('phone')" class="error-message">
                <span *ngIf="shopForm.get('phone')?.errors?.['pattern']">
                  Please enter a valid phone number
                </span>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="button" class="btn btn-cancel" (click)="onCancel()">
              Cancel
            </button>
            <button type="submit" class="btn btn-submit" [disabled]="shopForm.invalid">
              {{ isEditMode ? 'Update Pharmacy' : 'Add Pharmacy' }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

    .form-input:focus {
      outline: none;
      border-color: #f093fb;
      box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(240, 147, 251, 0.3);
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
export class ShopFormComponent implements OnInit {
  @Input() shop?: Shop;
  @Output() save = new EventEmitter<Omit<Shop, 'id'> | Shop>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  shopForm!: FormGroup;
  isEditMode = false;

  ngOnInit() {
    this.isEditMode = !!this.shop;
    this.initializeForm();
  }

  private initializeForm() {
    this.shopForm = this.fb.group({
      name: [
        this.shop?.name || '',
        [Validators.required, Validators.minLength(2)]
      ],
      street: [this.shop?.street || ''],
      postalcode: [this.shop?.postalcode || ''],
      city: [this.shop?.city || ''],
      phone: [
        this.shop?.phone || '',
        [Validators.pattern(/^[\d\s\+\-\(\)]+$/)]
      ]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shopForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.shopForm.valid) {
      const formValue = this.shopForm.value;
      
      // Remove empty optional fields
      if (!formValue.street) {
        delete formValue.street;
      }
      if (!formValue.postalcode) {
        delete formValue.postalcode;
      }
      if (!formValue.city) {
        delete formValue.city;
      }
      if (!formValue.phone) {
        delete formValue.phone;
      }

      if (this.isEditMode && this.shop) {
        this.save.emit({ ...formValue, id: this.shop.id });
      } else {
        this.save.emit(formValue);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
