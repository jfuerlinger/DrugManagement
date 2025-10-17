import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-success-message',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="success-container" *ngIf="appointment">
      <div class="success-content">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#4CAF50"/>
            <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <h2 class="success-title">Termin erfolgreich gebucht!</h2>

        <div class="appointment-details">
          <div class="detail-card">
            <h3>Ihre Buchungsdetails</h3>

            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ appointment.firstName }} {{ appointment.lastName }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">E-Mail:</span>
              <span class="detail-value">{{ appointment.email }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Telefon:</span>
              <span class="detail-value">{{ appointment.phoneNumber }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">SV-Nummer:</span>
              <span class="detail-value">{{ appointment.socialSecurityNumber }}</span>
            </div>

            <div class="appointment-time">
              <div class="time-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="time-details">
                <div class="date">{{ formatDate(appointment.appointmentSlot.date) }}</div>
                <div class="time">{{ appointment.appointmentSlot.startTime }} - {{ appointment.appointmentSlot.endTime }}</div>
              </div>
            </div>
          </div>

          <div class="confirmation-info">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="info-content">
              <h4>Wichtige Hinweise</h4>
              <ul>
                <li>Sie erhalten eine Bestätigungs-E-Mail an {{ appointment.email }}</li>
                <li>Bitte erscheinen Sie 10 Minuten vor Ihrem Termin</li>
                <li>Bringen Sie ein gültiges Ausweisdokument mit</li>
                <li>Bei Absagen kontaktieren Sie uns mindestens 24h vorher</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <div class="primary-action">
            <button
              class="btn-primary"
              (click)="onNewBooking()">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Neuen Termin buchen
            </button>
          </div>

          <div class="secondary-actions">
            <button
              class="btn-secondary"
              (click)="onDownloadCalendar()"
              title="Termin in Kalender hinzufügen">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Kalender-Datei
            </button>
            <button
              class="btn-secondary"
              (click)="onPrintConfirmation()">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"></path>
              </svg>
              Bestätigung drucken
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #1e5f99 0%, #b8368a 100%);
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .success-content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      text-align: center;
      animation: slideUp 0.8s ease-out 0.2s both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      animation: bounceIn 1s ease-out 0.4s both;
    }

    @keyframes bounceIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .success-icon svg {
      width: 100%;
      height: 100%;
    }

    .success-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin: 0 0 32px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .appointment-details {
      text-align: left;
      margin-bottom: 32px;
    }

    .detail-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }

    .detail-card h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #495057;
      text-align: center;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #6c757d;
      flex: 0 0 auto;
    }

    .detail-value {
      color: #495057;
      font-weight: 500;
      text-align: right;
    }

    .appointment-time {
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-top: 20px;
    }

    .time-icon {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .time-details {
      flex: 1;
    }

    .date {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .time {
      font-size: 16px;
      opacity: 0.9;
    }

    .confirmation-info {
      background: linear-gradient(135deg, rgba(30, 95, 153, 0.1), rgba(184, 54, 138, 0.1));
      border-radius: 12px;
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
      border: 1px solid rgba(30, 95, 153, 0.2);
    }

    .info-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      color: #1e5f99;
      margin-top: 4px;
    }

    .info-content h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e5f99;
    }

    .info-content ul {
      margin: 0;
      padding-left: 16px;
      color: #1e5f99;
    }

    .info-content li {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.4;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    }

    .primary-action {
      width: 100%;
    }

    .secondary-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary {
      width: 100%;
      min-height: 56px;
    }

    .btn-secondary {
      min-width: 140px;
      padding: 12px 20px;
      font-size: 14px;
    }

    .btn-icon {
      width: 18px;
      height: 18px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 95, 153, 0.4);
    }

    .btn-secondary {
      background: white;
      color: #1e5f99;
      border: 2px solid #1e5f99;
    }

    .btn-secondary:hover {
      background: #1e5f99;
      color: white;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .success-content {
        padding: 24px;
        margin: 20px;
      }

      .success-title {
        font-size: 24px;
      }

      .detail-card {
        padding: 16px;
      }

      .action-buttons {
        gap: 16px;
      }

      .secondary-actions {
        flex-direction: column;
        width: 100%;
        max-width: 300px;
        gap: 8px;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }

      .appointment-time {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .confirmation-info {
        flex-direction: column;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .detail-value {
        text-align: left;
      }
    }
  `]
})
export class SuccessMessageComponent {
  @Input() appointment: Appointment | null = null;

  onNewBooking() {
    window.location.reload();
  }

  onDownloadCalendar() {
    if (!this.appointment) return;

    const icalContent = this.generateICalContent();
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Termin_${this.formatDateForFilename(this.appointment.appointmentSlot.date)}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  onPrintConfirmation() {
    window.print();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private generateICalContent(): string {
    if (!this.appointment) return '';

    const appointment = this.appointment;
    const startDate = new Date(appointment.appointmentSlot.date);
    const [startHour, startMinute] = appointment.appointmentSlot.startTime.split(':').map(Number);
    const [endHour, endMinute] = appointment.appointmentSlot.endTime.split(':').map(Number);

    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(endHour, endMinute, 0, 0);

    const now = new Date();
    const uid = `${now.getTime()}@DrugManagement-bbrz.at`;

    const formatDateForICal = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const escapeiCalText = (text: string): string => {
      return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const summary = 'BBRZ DrugManagement';
    const description = `Termin bei BBRZ\\n\\nPersonendaten:\\n- Name: ${escapeiCalText(appointment.firstName + ' ' + appointment.lastName)}\\n- E-Mail: ${escapeiCalText(appointment.email)}\\n- Telefon: ${escapeiCalText(appointment.phoneNumber)}\\n- SV-Nummer: ${escapeiCalText(appointment.socialSecurityNumber)}`;
    const location = 'BBRZ Österreich';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BBRZ//DrugManagement//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `DTSTAMP:${formatDateForICal(now)}`,
      `SUMMARY:${escapeiCalText(summary)}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${escapeiCalText(location)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Erinnerung: BBRZ Termin in 15 Minuten',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  private formatDateForFilename(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
