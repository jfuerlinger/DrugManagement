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
            type="button"
            class="nav-btn" 
            (click)="previousPeriod()"
            [disabled]="isLoading">
            ‹
          </button>
          <h3 class="period-title">{{ getCurrentPeriodTitle() }}</h3>
          <button 
            type="button"
            class="nav-btn" 
            (click)="nextPeriod()"
            [disabled]="isLoading">
            ›
          </button>
        </div>
        
        <div class="view-toggle">
          <button 
            type="button"
            class="toggle-btn"
            [class.active]="viewMode === ViewMode.WEEK"
            (click)="setViewMode(ViewMode.WEEK)"
            [disabled]="isLoading">
            Woche
          </button>
          <button 
            type="button"
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
                <div
                  *ngFor="let slot of daySlot.slots; trackBy: trackByTime"
                  class="time-slot-wrapper"
                  [class.flipping]="isSlotFlipping(daySlot.date, slot.time)">
                  <div class="time-slot-flipper">
                    <button
                      type="button"
                      class="time-slot front"
                      [class.available]="slot.available"
                      [class.selected]="isSlotSelected(daySlot.date, slot.time)"
                      [disabled]="!slot.available"
                      (click)="selectSlotWithAnimation(daySlot.date, slot); $event.stopPropagation()">
                      {{ slot.time }}
                    </button>
                    <button
                      type="button"
                      class="time-slot back selected-state"
                      [disabled]="!slot.available">
                      <svg class="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <span class="selected-text">{{ slot.time }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading && viewMode === ViewMode.DAY" class="day-view">
          <div *ngIf="availableSlots.length > 0" class="single-day">
            <div class="time-slots-grid">
              <div
                *ngFor="let slot of availableSlots[0].slots; trackBy: trackByTime"
                class="time-slot-wrapper-large"
                [class.flipping]="isSlotFlipping(availableSlots[0].date, slot.time)">
                <div class="time-slot-flipper-large">
                  <button
                    type="button"
                    class="time-slot-large front"
                    [class.available]="slot.available"
                    [class.selected]="isSlotSelected(availableSlots[0].date, slot.time)"
                    [disabled]="!slot.available"
                    (click)="selectSlotWithAnimation(availableSlots[0].date, slot); $event.stopPropagation()">
                    <span class="slot-time">{{ slot.time }}</span>
                    <span class="slot-status">{{ slot.available ? 'Verfügbar' : 'Belegt' }}</span>
                  </button>
                  <button
                    type="button"
                    class="time-slot-large back selected-state"
                    [disabled]="!slot.available">
                    <div class="selected-content">
                      <svg class="checkmark-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <span class="slot-time">{{ slot.time }}</span>
                      <span class="slot-status">✓ Gewählt</span>
                    </div>
                  </button>
                </div>
              </div>
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
      background: linear-gradient(135deg, #1e5f99 0%, #b8368a 100%);
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
      border-top: 4px solid #1e5f99;
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
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .day-column {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }

    .day-column:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .day-header {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 16px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
    }

    .day-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #1e5f99, #b8368a);
      border-radius: 1px;
    }

    .day-name {
      font-weight: 700;
      font-size: 15px;
      color: #1e293b;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .day-date {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .time-slots {
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 320px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }

    .time-slots::-webkit-scrollbar {
      width: 4px;
    }

    .time-slots::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 2px;
    }

    .time-slots::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }

    .time-slots::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .time-slot-wrapper {
      perspective: 1000px;
      height: 44px;
      transition: transform 0.3s ease;
    }

    .time-slot-wrapper.flipping {
      transform: scale(1.05);
    }

    .time-slot-flipper {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .time-slot-wrapper.flipping .time-slot-flipper {
      transform: rotateY(180deg);
    }

    .time-slot {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .time-slot.back {
      transform: rotateY(180deg);
    }

    .time-slot.selected-state {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      border-color: #1e5f99;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      box-shadow: 0 4px 20px rgba(30, 95, 153, 0.4);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .checkmark {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .selected-text {
      font-weight: 600;
      font-size: 13px;
    }

    .time-slot.available {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #22c55e;
      color: #15803d;
    }

    .time-slot.available:hover {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
    }

    .time-slot.selected {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      border-color: #1e5f99;
      box-shadow: 0 4px 16px rgba(30, 95, 153, 0.3);
    }

    .time-slot:disabled {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-color: #fca5a5;
      color: #dc2626;
      cursor: not-allowed;
      opacity: 0.7;
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
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
      max-width: 800px;
      margin: 0 auto;
    }

    .time-slot-wrapper-large {
      perspective: 1000px;
      height: 80px;
      transition: transform 0.3s ease;
    }

    .time-slot-wrapper-large.flipping {
      transform: scale(1.05);
    }

    .time-slot-flipper-large {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .time-slot-wrapper-large.flipping .time-slot-flipper-large {
      transform: rotateY(180deg);
    }

    .time-slot-large {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .time-slot-large.back {
      transform: rotateY(180deg);
    }

    .time-slot-large.selected-state {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      border-color: #1e5f99;
      box-shadow: 0 8px 25px rgba(30, 95, 153, 0.4);
      padding: 20px 16px;
    }

    .selected-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 100%;
      text-align: center;
    }

    .checkmark-large {
      width: 20px;
      height: 20px;
      margin-bottom: 2px;
      flex-shrink: 0;
    }

    .time-slot-large.available {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #22c55e;
      color: #15803d;
    }

    .time-slot-large.available:hover {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(34, 197, 94, 0.25);
    }

    .time-slot-large.selected {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      border-color: #1e5f99;
      box-shadow: 0 8px 25px rgba(30, 95, 153, 0.3);
    }

    .time-slot-large:disabled {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-color: #fca5a5;
      color: #dc2626;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .slot-time {
      font-weight: 700;
      font-size: 17px;
      color: inherit;
    }

    .slot-status {
      font-size: 12px;
      opacity: 0.9;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
        gap: 16px;
        max-width: none;
      }
      
      .time-slots-grid {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 12px;
        max-width: none;
      }

      .time-slot-wrapper {
        height: 40px;
      }

      .time-slot-wrapper-large {
        height: 70px;
      }
    }
  `]
})
export class CalendarPickerComponent implements OnInit, OnDestroy {
  @Input() selectedSlot: AppointmentSlot | null = null;
  @Output() slotSelected = new EventEmitter<AppointmentSlot>();

  // Enum für Template-Zugriff verfügbar machen
  ViewMode = ViewMode;
  
  viewMode: ViewMode = ViewMode.DAY;
  currentDate = this.getTomorrowDate(); // Nächster Tag als Standard
  availableSlots: DaySlots[] = [];
  isLoading = false;
  private flippingSlots = new Set<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  private getTomorrowDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
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
    
    this.appointmentService.getAvailableSlots(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slots) => {
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

  selectSlotWithAnimation(date: Date, timeSlot: TimeSlot) {
    if (!timeSlot.available) return;

    const slotKey = `${date.toISOString().split('T')[0]}-${timeSlot.time}`;
    
    // Animation starten
    this.flippingSlots.add(slotKey);
    this.cdr.detectChanges();

    // Nach der Animation die Auswahl durchführen
    setTimeout(() => {
      this.selectSlot(date, timeSlot);
      
      // Animation nach 800ms beenden (länger für bessere Sichtbarkeit)
      setTimeout(() => {
        this.flippingSlots.delete(slotKey);
        this.cdr.detectChanges();
      }, 400);
    }, 400);
  }

  isSlotFlipping(date: Date, time: string): boolean {
    const slotKey = `${date.toISOString().split('T')[0]}-${time}`;
    return this.flippingSlots.has(slotKey);
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
    return date.toLocaleDateString('de-DE', { weekday: 'long' });
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
