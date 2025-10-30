import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DrugService } from '../../services/drug.service';
import { ShopService } from '../../services/shop.service';
import { PersonService } from '../../services/person.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo">💊</div>
            <h1 class="app-title">Drug Management</h1>
          </div>
          <p class="tagline">Manage your medications with ease</p>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon drugs">💊</div>
            <div class="stat-info">
              <div class="stat-value">{{ drugCount }}</div>
              <div class="stat-label">Total Drugs</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon shops">🏪</div>
            <div class="stat-info">
              <div class="stat-value">{{ shopCount }}</div>
              <div class="stat-label">Pharmacies</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon persons">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ personCount }}</div>
              <div class="stat-label">People</div>
            </div>
          </div>
        </div>

        <!-- Action Cards -->
        <div class="actions-section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="action-cards">
            <button class="action-card" (click)="navigateTo('/drugs')">
              <div class="action-icon">💊</div>
              <h3 class="action-title">Manage Drugs</h3>
              <p class="action-description">View and manage your medication inventory</p>
              <div class="action-arrow">→</div>
            </button>

            <button class="action-card" (click)="navigateTo('/shops')">
              <div class="action-icon">🏪</div>
              <h3 class="action-title">Manage Pharmacies</h3>
              <p class="action-description">Add and manage pharmacy locations</p>
              <div class="action-arrow">→</div>
            </button>

            <button class="action-card" (click)="navigateTo('/persons')">
              <div class="action-icon">👥</div>
              <h3 class="action-title">Manage People</h3>
              <p class="action-description">Manage people associated with medications</p>
              <div class="action-arrow">→</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 48px 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 12px;
    }

    .logo {
      font-size: 48px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }

    .app-title {
      font-size: 42px;
      font-weight: 800;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      letter-spacing: -0.5px;
    }

    .tagline {
      font-size: 18px;
      margin: 0;
      opacity: 0.95;
      font-weight: 400;
    }

    .main-content {
      max-width: 1200px;
      margin: -40px auto 0;
      padding: 0 24px 48px;
      position: relative;
      z-index: 1;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      font-size: 48px;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      flex-shrink: 0;
    }

    .stat-icon.drugs {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-icon.shops {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-icon.persons {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .actions-section {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .section-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 32px 0;
      text-align: center;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .action-card {
      background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    }

    .action-card:hover::before {
      transform: scaleX(1);
    }

    .action-icon {
      font-size: 64px;
      margin-bottom: 16px;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }

    .action-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px 0;
    }

    .action-description {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 20px 0;
      line-height: 1.6;
    }

    .action-arrow {
      font-size: 24px;
      color: #667eea;
      font-weight: 700;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }

    .action-card:hover .action-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    @media (max-width: 768px) {
      .header {
        padding: 32px 16px;
      }

      .logo-section {
        flex-direction: column;
        gap: 8px;
      }

      .app-title {
        font-size: 32px;
      }

      .tagline {
        font-size: 16px;
      }

      .main-content {
        margin-top: -20px;
        padding: 0 16px 32px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-card {
        padding: 24px 20px;
      }

      .actions-section {
        padding: 24px 20px;
      }

      .section-title {
        font-size: 24px;
        margin-bottom: 24px;
      }

      .action-cards {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private drugService = inject(DrugService);
  private shopService = inject(ShopService);
  private personService = inject(PersonService);

  drugCount = 0;
  shopCount = 0;
  personCount = 0;

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.drugService.getAllDrugs().subscribe({
      next: (response) => this.drugCount = response.drugs.length,
      error: (err) => console.error('Error loading drugs:', err)
    });

    this.shopService.getAllShops().subscribe({
      next: (response) => this.shopCount = response.shops.length,
      error: (err) => console.error('Error loading shops:', err)
    });

    this.personService.getAllPersons().subscribe({
      next: (response) => this.personCount = response.persons.length,
      error: (err) => console.error('Error loading persons:', err)
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
