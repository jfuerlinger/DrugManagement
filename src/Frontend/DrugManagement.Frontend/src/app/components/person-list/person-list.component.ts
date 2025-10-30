import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/person.model';
import { PersonFormComponent } from '../person-form/person-form.component';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule, PersonFormComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <button class="back-button" (click)="goBack()">
          <span class="back-arrow">←</span> Back
        </button>
        <div class="header-content">
          <h1 class="page-title">👥 People Management</h1>
          <p class="page-subtitle">Manage people associated with medications</p>
        </div>
      </header>

      <!-- Content -->
      <main class="page-content">
        <div class="content-card">
          <!-- Loading State -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading people...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && persons.length === 0" class="empty-state">
            <div class="empty-icon">👥</div>
            <h3 class="empty-title">No people found</h3>
            <p class="empty-message">Start by adding your first person.</p>
            <button class="btn-add-person-empty" (click)="showAddForm()">
              ➕ Add New Person
            </button>
          </div>

          <!-- Persons Grid -->
          <div *ngIf="!loading && persons.length > 0">
            <div class="table-header">
              <h2 class="table-title">All People ({{ persons.length }})</h2>
              <button class="btn-add-person" (click)="showAddForm()">
                ➕ Add New Person
              </button>
            </div>

            <div class="persons-grid">
              <div *ngFor="let person of persons" class="person-card">
                <div class="person-header">
                  <div class="person-avatar">{{ getInitials(person) }}</div>
                  <div class="person-id">#{{ person.id }}</div>
                </div>
                <h3 class="person-name">{{ person.firstname }} {{ person.lastname }}</h3>
                <div class="person-details">
                  <div *ngIf="person.email" class="detail-row">
                    <span class="detail-icon">📧</span>
                    <span class="detail-text">{{ person.email }}</span>
                  </div>
                  <div *ngIf="person.phone" class="detail-row">
                    <span class="detail-icon">📞</span>
                    <span class="detail-text">{{ person.phone }}</span>
                  </div>
                </div>
                <div class="person-actions">
                  <button class="btn-action edit" title="Edit" (click)="showEditForm(person)">✏️ Edit</button>
                  <button class="btn-action delete" title="Delete" (click)="deletePerson(person.id)">🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Person Form Modal -->
      <app-person-form
        *ngIf="showForm"
        [person]="selectedPerson"
        (save)="savePerson($event)"
        (cancel)="hideForm()"
      ></app-person-form>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .page-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
      border-top: 4px solid #4facfe;
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

    .btn-add-person-empty {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
    }

    .btn-add-person-empty:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
    }

    .table-header {
      margin-bottom: 32px;
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

    .btn-add-person {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
    }

    .btn-add-person:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
    }

    .persons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .person-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .person-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    }

    .person-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(79, 172, 254, 0.2);
      border-color: #4facfe;
    }

    .person-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .person-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
    }

    .person-id {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    .person-name {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px 0;
    }

    .person-details {
      margin-bottom: 20px;
      min-height: 60px;
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
      word-break: break-all;
    }

    .person-actions {
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
      }      .page-title {
        font-size: 28px;
      }

      .page-content {
        padding: 0 16px 32px;
      }

      .content-card {
        padding: 24px 16px;
      }

      .persons-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PersonListComponent implements OnInit {
  private router = inject(Router);
  private personService = inject(PersonService);

  persons: Person[] = [];
  loading = true;
  showForm = false;
  selectedPerson?: Person;

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons() {
    this.loading = true;
    this.personService.getAllPersons().subscribe({
      next: (response) => {
        this.persons = response.persons;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading persons:', err);
        this.loading = false;
      }
    });
  }

  showAddForm() {
    this.selectedPerson = undefined;
    this.showForm = true;
  }

  showEditForm(person: Person) {
    this.selectedPerson = person;
    this.showForm = true;
  }

  hideForm() {
    this.showForm = false;
    this.selectedPerson = undefined;
  }

  savePerson(personData: Omit<Person, 'id'> | Person) {
    if ('id' in personData) {
      // Update existing person
      this.personService.updatePerson(personData.id, personData).subscribe({
        next: () => {
          this.loadPersons();
          this.hideForm();
        },
        error: (err) => console.error('Error updating person:', err)
      });
    } else {
      // Create new person
      this.personService.createPerson(personData).subscribe({
        next: () => {
          this.loadPersons();
          this.hideForm();
        },
        error: (err) => console.error('Error creating person:', err)
      });
    }
  }

  deletePerson(id: number) {
    if (confirm('Are you sure you want to delete this person?')) {
      this.personService.deletePerson(id).subscribe({
        next: () => this.loadPersons(),
        error: (err) => console.error('Error deleting person:', err)
      });
    }
  }

  getInitials(person: Person): string {
    const firstInitial = person.firstname.charAt(0).toUpperCase();
    const lastInitial = person.lastname.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
