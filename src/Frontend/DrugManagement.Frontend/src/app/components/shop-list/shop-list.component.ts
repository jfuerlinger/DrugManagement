import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShopService } from '../../services/shop.service';
import { Shop } from '../../models/shop.model';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <button class="back-button" (click)="goBack()">
          <span class="back-arrow">←</span> Back
        </button>
        <div class="header-content">
          <h1 class="page-title">🏪 Pharmacy Management</h1>
          <p class="page-subtitle">Manage your pharmacy locations</p>
        </div>
      </header>

      <!-- Content -->
      <main class="page-content">
        <div class="content-card">
          <!-- Loading State -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading pharmacies...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && shops.length === 0" class="empty-state">
            <div class="empty-icon">🏪</div>
            <h3 class="empty-title">No pharmacies found</h3>
            <p class="empty-message">Start by adding your first pharmacy location.</p>
          </div>

          <!-- Shops Grid -->
          <div *ngIf="!loading && shops.length > 0">
            <div class="table-header">
              <h2 class="table-title">All Pharmacies ({{ shops.length }})</h2>
            </div>

            <div class="shops-grid">
              <div *ngFor="let shop of shops" class="shop-card">
                <div class="shop-header">
                  <div class="shop-icon">🏪</div>
                  <div class="shop-id">#{{ shop.id }}</div>
                </div>
                <h3 class="shop-name">{{ shop.name }}</h3>
                <div class="shop-details">
                  <div *ngIf="shop.street" class="detail-row">
                    <span class="detail-icon">📍</span>
                    <span class="detail-text">{{ shop.street }}</span>
                  </div>
                  <div *ngIf="shop.postalcode || shop.city" class="detail-row">
                    <span class="detail-icon">🏙️</span>
                    <span class="detail-text">{{ shop.postalcode }} {{ shop.city }}</span>
                  </div>
                  <div *ngIf="shop.phone" class="detail-row">
                    <span class="detail-icon">📞</span>
                    <span class="detail-text">{{ shop.phone }}</span>
                  </div>
                </div>
                <div class="shop-actions">
                  <button class="btn-action edit" title="Edit">✏️ Edit</button>
                  <button class="btn-action delete" title="Delete" (click)="deleteShop(shop.id)">🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .page-header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
      border-top: 4px solid #f093fb;
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
      margin: 0;
    }

    .table-header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }

    .table-title {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .shops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .shop-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .shop-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    }

    .shop-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(240, 147, 251, 0.2);
      border-color: #f093fb;
    }

    .shop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .shop-icon {
      font-size: 40px;
    }

    .shop-id {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    .shop-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px 0;
    }

    .shop-details {
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      color: #475569;
      font-size: 14px;
    }

    .detail-icon {
      font-size: 16px;
      width: 24px;
    }

    .detail-text {
      flex: 1;
    }

    .shop-actions {
      display: flex;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .btn-action {
      flex: 1;
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-action.edit {
      background: white;
      color: #667eea;
      border-color: #667eea;
    }

    .btn-action.edit:hover {
      background: #667eea;
      color: white;
    }

    .btn-action.delete {
      background: white;
      color: #ef4444;
      border-color: #ef4444;
    }

    .btn-action.delete:hover {
      background: #ef4444;
      color: white;
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

      .shops-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ShopListComponent implements OnInit {
  private router = inject(Router);
  private shopService = inject(ShopService);

  shops: Shop[] = [];
  loading = true;

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    this.shopService.getAllShops().subscribe({
      next: (response) => {
        this.shops = response.shops;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading shops:', err);
        this.loading = false;
      }
    });
  }

  deleteShop(id: number) {
    if (confirm('Are you sure you want to delete this pharmacy?')) {
      this.shopService.deleteShop(id).subscribe({
        next: () => this.loadShops(),
        error: (err) => console.error('Error deleting shop:', err)
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
