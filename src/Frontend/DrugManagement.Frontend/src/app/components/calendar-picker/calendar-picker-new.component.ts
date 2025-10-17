import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentSlot, DaySlots, ViewMode, TimeSlot } from '../../models/appointment.model';

@Component({
  selector: 'app-calendar-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="navigation">
          <button 
            class="nav-btn" 
            (click)="previousPeriod()"
            [disabled]="isLoading">
            ‹
          </button>
          <h3 class="period-title">{{ getCurrentPeriodTitle() }}</h3>
          <button 
            class="nav-btn" 
            (click)="nextPeriod()"
            [disabled]="isLoading">
            ›
          </button>
        </div>
        
        <div class="view-toggle">
          <button 
            class="toggle-btn"
            [class.active]="viewMode === ViewMode.WEEK"
            (click)="setViewMode(ViewMode.WEEK)"
            [disabled]="isLoading">
            Woche
          </button>
          <button 
            class="toggle-btn"
            [class.active]="viewMode === ViewMode.DAY"
            (click)="setViewMode(ViewMode.DAY)"
            [disabled]="isLoading">
            Tag
          </button>
        </div>
      </div>

      <div class="calendar-content" [class.loading]="isLoading">
        <div *ngIf="isLoading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Lade verfügbare Termine...</p>
        </div>

        <!-- Debug Info -->
        <div *ngIf="!isLoading" class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px;">
          Debug: Verfügbare Slots = {{ availableSlots.length }}, Loading = {{ isLoading }}, ViewMode = {{ viewMode }}
        </div>

        <div *ngIf="!isLoading && viewMode === ViewMode.WEEK" class="week-view">
          <div class="day-columns">
            <div 
              *ngFor="let daySlot of availableSlots; trackBy: trackByDate" 
              class="day-column">
              <div class="day-header">
                <div class="day-name">{{ getDayName(daySlot.date) }}</div>
                <div class="day-date">{{ formatDate(daySlot.date) }}</div>
              </div>
              <div class="time-slots">
                <button
                  *ngFor="let slot of daySlot.slots; trackBy: trackByTime"
                  class="time-slot"
                  [class.available]="slot.available"
                  [class.selected]="isSlotSelected(daySlot.date, slot.time)"
                  [disabled]="!slot.available"
                  (click)="selectSlot(daySlot.date, slot)">
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading && viewMode === ViewMode.DAY" class="day-view">
          <div *ngIf="availableSlots.length > 0" class="single-day">
            <div class="day-header-large">
              <h4>{{ getDayName(availableSlots[0].date) }}</h4>
              <p>{{ formatDate(availableSlots[0].date) }}</p>
            </div>
            <div class="time-slots-grid">
              <button
                *ngFor="let slot of availableSlots[0].slots; trackBy: trackByTime"
                class="time-slot-large"
                [class.available]="slot.available"
                [class.selected]="isSlotSelected(availableSlots[0].date, slot.time)"
                [disabled]="!slot.available"
                (click)="selectSlot(availableSlots[0].date, slot)">
                <span class="slot-time">{{ slot.time }}</span>
                <span class="slot-status">{{ slot.available ? 'Verfügbar' : 'Belegt' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading && availableSlots.length === 0" class="no-slots">
          <p>Keine Termine verfügbar</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .calendar-header {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .navigation {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .period-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      min-width: 200px;
      text-align: center;
    }

    .view-toggle {
      display: flex;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: white;
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .toggle-btn.active {
      background: rgba(255, 255, 255, 0.3);
    }

    .toggle-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .calendar-content {
      padding: 24px;
      min-height: 400px;
      position: relative;
    }

    .calendar-content.loading {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-spinner {
      text-align: center;
      color: #666;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .week-view .day-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .day-column {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .day-header {
      background: #f8f9fa;
      padding: 12px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
    }

    .day-name {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .day-date {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .time-slots {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 300px;
      overflow-y: auto;
    }

    .time-slot {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .time-slot.available {
      background: #e8f5e8;
      border-color: #4caf50;
      color: #2e7d32;
    }

    .time-slot.available:hover {
      background: #c8e6c9;
      transform: translateY(-1px);
    }

    .time-slot.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .time-slot:disabled {
      background: #ffebee;
      border-color: #ffcdd2;
      color: #c62828;
      cursor: not-allowed;
    }

    .day-view .single-day {
      max-width: 600px;
      margin: 0 auto;
    }

    .day-header-large {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e0e0e0;
    }

    .day-header-large h4 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }

    .day-header-large p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .time-slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }

    .time-slot-large {
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .time-slot-large.available {
      background: #e8f5e8;
      border-color: #4caf50;
    }

    .time-slot-large.available:hover {
      background: #c8e6c9;
      transform: translateY(-2px);
    }

    .time-slot-large.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .time-slot-large:disabled {
      background: #ffebee;
      border-color: #ffcdd2;
      cursor: not-allowed;
    }

    .slot-time {
      font-weight: 600;
      font-size: 16px;
    }

    .slot-status {
      font-size: 12px;
      opacity: 0.8;
    }

    .no-slots {
      text-align: center;
      color: #666;
      font-size: 16px;
      margin-top: 60px;
    }

    @media (max-width: 768px) {
      .calendar-header {
        flex-direction: column;
        text-align: center;
      }
      
      .navigation {
        flex-direction: column;
        gap: 12px;
      }
      
      .period-title {
        font-size: 18px;
        min-width: auto;
      }
      
      .week-view .day-columns {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .time-slots-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
      }
    }
  `]
})
export class CalendarPickerComponent implements OnInit, OnDestroy {
  @Input() selectedSlot: AppointmentSlot | null = null;
  @Output() slotSelected = new EventEmitter<AppointmentSlot>();

  // Enum für Template-Zugriff verfügbar machen
  ViewMode = ViewMode;
  
  viewMode: ViewMode = ViewMode.WEEK;
  currentDate = new Date(); // Aktuelles Datum
  availableSlots: DaySlots[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {
    // Stelle sicher, dass wir ein valides heutiges Datum haben
    console.log('Initialisierung - Heutiges Datum:', this.currentDate);
  }

  ngOnInit() {
    this.loadAvailableSlots();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableSlots() {
    this.isLoading = true;
    const { startDate, endDate } = this.getCurrentPeriodRange();
    
    console.log('Lade Slots für Zeitraum:', startDate, 'bis', endDate);
    console.log('View Mode:', this.viewMode);
    
    this.appointmentService.getAvailableSlots(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slots) => {
          console.log('Erhaltene Slots:', slots);
          this.availableSlots = slots;
          this.isLoading = false;
          this.cdr.detectChanges(); // Manuell Change Detection triggern
        },
        error: (error) => {
          console.error('Error loading slots:', error);
          this.isLoading = false;
        }
      });
  }

  getCurrentPeriodRange(): { startDate: Date; endDate: Date } {
    const startDate = new Date(this.currentDate);
    let endDate = new Date(this.currentDate);

    console.log('Current Date:', this.currentDate);
    console.log('View Mode:', this.viewMode);

    if (this.viewMode === ViewMode.WEEK) {
      // Start der Woche (Montag)
      const dayOfWeek = startDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate.setDate(startDate.getDate() + mondayOffset);
      
      // Ende der Woche (Freitag)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4);
    } else {
      // Einzelner Tag
      endDate = new Date(startDate);
    }

    console.log('Calculated range:', startDate, 'to', endDate);
    return { startDate, endDate };
  }

  getCurrentPeriodTitle(): string {
    const { startDate, endDate } = this.getCurrentPeriodRange();
    
    if (this.viewMode === ViewMode.WEEK) {
      const weekStart = startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      const weekEnd = endDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      const year = startDate.getFullYear();
      return `${weekStart} - ${weekEnd}.${year}`;
    } else {
      return startDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  }

  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
    this.loadAvailableSlots();
  }

  previousPeriod() {
    if (this.viewMode === ViewMode.WEEK) {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    this.loadAvailableSlots();
  }

  nextPeriod() {
    if (this.viewMode === ViewMode.WEEK) {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    }
    this.loadAvailableSlots();
  }

  selectSlot(date: Date, timeSlot: TimeSlot) {
    if (!timeSlot.available) return;

    const slot: AppointmentSlot = {
      id: `${date.toISOString().split('T')[0]}-${timeSlot.time}`,
      date: new Date(date),
      startTime: timeSlot.time,
      endTime: this.calculateEndTime(timeSlot.time),
      isAvailable: timeSlot.available
    };

    this.slotSelected.emit(slot);
  }

  private calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + 30, 0, 0);
    return endDate.toTimeString().substr(0, 5);
  }

  isSlotSelected(date: Date, time: string): boolean {
    if (!this.selectedSlot) return false;
    
    return this.selectedSlot.date.toDateString() === date.toDateString() &&
           this.selectedSlot.startTime === time;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }

  trackByDate(index: number, item: DaySlots): string {
    return item.date.toISOString();
  }

  trackByTime(index: number, item: TimeSlot): string {
    return item.time;
  }
}
