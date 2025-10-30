import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DrugService } from '../../services/drug.service';
import { Drug } from '../../models/drug.model';
import { DrugFormComponent } from '../drug-form/drug-form.component';

@Component({
  selector: 'app-drug-list',
  standalone: true,
  imports: [CommonModule, DrugFormComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <button class="back-button" (click)="goBack()">
          <span class="back-arrow">←</span> Back
        </button>
        <div class="header-content">
          <h1 class="page-title">💊 Drug Management</h1>
          <p class="page-subtitle">View and manage your medication inventory</p>
        </div>
      </header>

      <!-- Content -->
      <main class="page-content">
        <div class="content-card">
          <!-- Loading State -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading drugs...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && drugs.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h3 class="empty-title">No drugs found</h3>
            <p class="empty-message">Start by adding your first medication to the inventory.</p>
            <button class="btn-add-drug-empty" (click)="showAddForm()">
              ➕ Add New Drug
            </button>
          </div>

          <!-- Drugs Table -->
          <div *ngIf="!loading && drugs.length > 0" class="table-container">
            <div class="table-header">
              <h2 class="table-title">All Medications ({{ drugs.length }})</h2>
              <button class="btn-add-drug" (click)="showAddForm()">
                ➕ Add New Drug
              </button>
            </div>
            
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Metadata ID</th>
                    <th>Package Size ID</th>
                    <th>Shop ID</th>
                    <th>Bought On</th>
                    <th>Amount Left</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let drug of drugs" class="table-row">
                    <td class="id-cell">{{ drug.id }}</td>
                    <td>{{ drug.metadataId }}</td>
                    <td>{{ drug.drugPackageSizeId }}</td>
                    <td>{{ drug.shopId }}</td>
                    <td>{{ drug.boughtOn ? (drug.boughtOn | date: 'short') : '-' }}</td>
                    <td>
                      <span *ngIf="drug.amountLeftInPercentage !== null && drug.amountLeftInPercentage !== undefined" 
                            class="amount-badge" 
                            [class.low]="drug.amountLeftInPercentage < 25"
                            [class.medium]="drug.amountLeftInPercentage >= 25 && drug.amountLeftInPercentage < 75"
                            [class.high]="drug.amountLeftInPercentage >= 75">
                        {{ drug.amountLeftInPercentage }}%
                      </span>
                      <span *ngIf="drug.amountLeftInPercentage === null || drug.amountLeftInPercentage === undefined">-</span>
                    </td>
                    <td class="actions-cell">
                      <button class="btn-icon" title="View details">👁️</button>
                      <button class="btn-icon" title="Edit" (click)="showEditForm(drug)">✏️</button>
                      <button class="btn-icon delete" title="Delete" (click)="deleteDrug(drug.id)">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Drug Form Modal -->
      <app-drug-form
        *ngIf="showForm"
        [drug]="selectedDrug"
        (save)="saveDrug($event)"
        (cancel)="hideForm()"
      ></app-drug-form>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 24px 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .back-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 16px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateX(-4px);
    }

    .back-arrow {
      font-size: 18px;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      min-height: 80px;
    }

    .page-title {
      font-size: 36px;
      font-weight: 800;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .page-subtitle {
      font-size: 16px;
      margin: 0;
      opacity: 0.95;
      line-height: 1.5;
    }

    .page-content {
      max-width: 1200px;
      margin: -40px auto 0;
      padding: 0 24px 48px;
      position: relative;
      z-index: 1;
    }

    .content-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      min-height: 400px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #64748b;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px 0;
    }

    .empty-message {
      font-size: 16px;
      color: #64748b;
      margin: 0 0 24px 0;
    }

    .btn-add-drug-empty {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-add-drug-empty:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .table-header {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .table-title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .btn-add-drug {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-add-drug:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead th {
      background: linear-gradient(135deg, #f8f9fc 0%, #e2e8f0 100%);
      color: #475569;
      font-weight: 700;
      font-size: 14px;
      text-align: left;
      padding: 16px;
      border-bottom: 2px solid #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-table tbody tr {
      transition: all 0.2s ease;
    }

    .data-table tbody tr:hover {
      background: #f8fafc;
    }

    .data-table tbody td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
      font-size: 14px;
    }

    .id-cell {
      font-weight: 700;
      color: #667eea;
    }

    .amount-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
    }

    .amount-badge.low {
      background: #fee2e2;
      color: #991b1b;
    }

    .amount-badge.medium {
      background: #fef3c7;
      color: #92400e;
    }

    .amount-badge.high {
      background: #d1fae5;
      color: #065f46;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: #f1f5f9;
      transform: scale(1.1);
    }

    .btn-icon.delete:hover {
      background: #fee2e2;
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 24px 16px 40px;
      }

      .page-title {
        font-size: 28px;
      }

      .page-content {
        padding: 0 16px 32px;
      }

      .content-card {
        padding: 24px 16px;
      }

      .table-wrapper {
        overflow-x: scroll;
      }

      .data-table {
        min-width: 800px;
      }
    }
  `]
})
export class DrugListComponent implements OnInit {
  private router = inject(Router);
  private drugService = inject(DrugService);

  drugs: Drug[] = [];
  loading = true;
  showForm = false;
  selectedDrug?: Drug;

  ngOnInit() {
    this.loadDrugs();
  }

  loadDrugs() {
    this.loading = true;
    this.drugService.getAllDrugs().subscribe({
      next: (response) => {
        this.drugs = response.drugs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading drugs:', err);
        this.loading = false;
      }
    });
  }

  showAddForm() {
    this.selectedDrug = undefined;
    this.showForm = true;
  }

  showEditForm(drug: Drug) {
    this.selectedDrug = drug;
    this.showForm = true;
  }

  hideForm() {
    this.showForm = false;
    this.selectedDrug = undefined;
  }

  saveDrug(drugData: Omit<Drug, 'id'> | Drug) {
    if ('id' in drugData) {
      // Update existing drug
      this.drugService.updateDrug(drugData.id, drugData).subscribe({
        next: () => {
          this.loadDrugs();
          this.hideForm();
        },
        error: (err) => console.error('Error updating drug:', err)
      });
    } else {
      // Create new drug
      this.drugService.createDrug(drugData).subscribe({
        next: () => {
          this.loadDrugs();
          this.hideForm();
        },
        error: (err) => console.error('Error creating drug:', err)
      });
    }
  }

  deleteDrug(id: number) {
    if (confirm('Are you sure you want to delete this drug?')) {
      this.drugService.deleteDrug(id).subscribe({
        next: () => this.loadDrugs(),
        error: (err) => console.error('Error deleting drug:', err)
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
