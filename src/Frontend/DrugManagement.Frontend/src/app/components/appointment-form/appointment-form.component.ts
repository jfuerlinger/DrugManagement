import { Component, OnInit, ChangeDetectionStrategy, inject, ChangeDetectorRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalendarPickerComponent } from '../calendar-picker/calendar-picker.component';
import { SuccessMessageComponent } from '../success-message/success-message.component';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentSlot } from '../../models/appointment.model';
import { HttpClient } from '@angular/common/http';
import { WeatherForecasts } from '../../../types/weatherForecast';

@Injectable()
@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarPickerComponent,
    SuccessMessageComponent
  ],
  template: `
    <div class="appointment-container">
      <!-- Erfolgsmeldung -->
      <app-success-message 
        *ngIf="bookedAppointment" 
        [appointment]="bookedAppointment">
      </app-success-message>

      Forecasts: {{ this.forecasts.length }}

      <!-- Hauptformular -->
      <div *ngIf="!bookedAppointment" class="form-container">
        <header class="header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="title-section">
              <div class="title-container">
                <h1 class="main-title">Termin buchen</h1>
                <p class="subtitle">Buchen Sie schnell und einfach Ihren gewünschten Termin</p>
              </div>
            </div>
          </div>
        </header>

        <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()" class="appointment-form">
          
          <!-- Terminauswahl -->
          <div id="appointment-section" class="form-section">
            <h2 class="section-title">
              <div class="section-content">
                <span class="section-number">1</span>
                <span class="section-text">Terminauswahl</span>
              </div>
            </h2>
            
            <div class="calendar-section">
              <app-calendar-picker
                [selectedSlot]="selectedSlot"
                (slotSelected)="onSlotSelected($event)">
              </app-calendar-picker>
              
              <div 
                *ngIf="!selectedSlot && appointmentForm.get('selectedSlot')?.touched" 
                class="error-message calendar-error">
                Bitte wählen Sie einen Termin aus.
              </div>
            </div>
          </div>

          <!-- Persönliche Daten -->
          <div id="personal-section" class="form-section">
            <h2 class="section-title">
              <div class="section-content">
                <span class="section-number">2</span>
                <span class="section-text">Persönliche Daten</span>
              </div>
            </h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="firstName" class="form-label">
                  Vorname *
                </label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="form-input"
                  [class.error]="isFieldInvalid('firstName')"
                  placeholder="Ihr Vorname"
                  autocomplete="given-name">
                <div 
                  *ngIf="isFieldInvalid('firstName')" 
                  class="error-message">
                  {{ getFieldError('firstName') }}
                </div>
              </div>

              <div class="form-group">
                <label for="lastName" class="form-label">
                  Nachname *
                </label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="form-input"
                  [class.error]="isFieldInvalid('lastName')"
                  placeholder="Ihr Nachname"
                  autocomplete="family-name">
                <div 
                  *ngIf="isFieldInvalid('lastName')" 
                  class="error-message">
                  {{ getFieldError('lastName') }}
                </div>
              </div>

              <div class="form-group full-width">
                <label for="socialSecurityNumber" class="form-label">
                  Sozialversicherungsnummer *
                </label>
                <input
                  id="socialSecurityNumber"
                  type="text"
                  formControlName="socialSecurityNumber"
                  class="form-input"
                  [class.error]="isFieldInvalid('socialSecurityNumber')"
                  placeholder="1232 150184"
                  maxlength="11"
                  (input)="onSvNumberInput($event)">
                <div 
                  *ngIf="isFieldInvalid('socialSecurityNumber')" 
                  class="error-message">
                  {{ getFieldError('socialSecurityNumber') }}
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">
                  E-Mail Adresse *
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  [class.error]="isFieldInvalid('email')"
                  placeholder="ihre.email@beispiel.de"
                  autocomplete="email">
                <div 
                  *ngIf="isFieldInvalid('email')" 
                  class="error-message">
                  {{ getFieldError('email') }}
                </div>
              </div>

              <div class="form-group">
                <label for="phoneNumber" class="form-label">
                  Telefonnummer *
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  formControlName="phoneNumber"
                  class="form-input"
                  [class.error]="isFieldInvalid('phoneNumber')"
                  placeholder="+43 1 234 5678"
                  autocomplete="tel"
                  (input)="onPhoneNumberInput($event)">
                <div 
                  *ngIf="isFieldInvalid('phoneNumber')" 
                  class="error-message">
                  {{ getFieldError('phoneNumber') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Zusammenfassung und Absenden -->
          <div class="form-section" *ngIf="selectedSlot">
            <h2 class="section-title">
              <div class="section-content">
                <span class="section-number">3</span>
                <span class="section-text">Zusammenfassung</span>
              </div>
            </h2>
            
            <div class="summary-card">
              <div class="summary-item">
                <div class="summary-appointment">
                  <div class="appointment-info">
                    <div class="appointment-date">
                      <span class="date-desktop">{{ formatAppointmentDate(selectedSlot.date) }}</span>
                      <span class="date-mobile">{{ formatAppointmentDateMobile(selectedSlot.date) }}</span>
                    </div>
                    <div class="appointment-time">
                      {{ selectedSlot.startTime }} - {{ selectedSlot.endTime }}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    class="edit-button" 
                    (click)="scrollToSection('appointment')"
                    title="Termin ändern">
                    <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="m18.5 2.5 3 3L8 18l-4 1 1-4 13.5-13.5z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-item">
                <div class="summary-personal-data">
                  <button 
                    type="button" 
                    class="edit-button" 
                    (click)="scrollToSection('personal')"
                    title="Persönliche Daten ändern">
                    <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="m18.5 2.5 3 3L8 18l-4 1 1-4 13.5-13.5z"></path>
                    </svg>
                  </button>
                  <div class="personal-data-content">
                    <div class="personal-data-row">
                      <span class="data-label">👤 Name:</span>
                      <span class="data-value">{{ appointmentForm.get('firstName')?.value }} {{ appointmentForm.get('lastName')?.value }}</span>
                    </div>
                    <div class="personal-data-row">
                      <span class="data-label">🆔 Sozialversicherungsnr.:</span>
                      <span class="data-value">{{ appointmentForm.get('socialSecurityNumber')?.value }}</span>
                    </div>
                    <div class="personal-data-row">
                      <span class="data-label">📧 E-Mail:</span>
                      <span class="data-value">{{ appointmentForm.get('email')?.value }}</span>
                    </div>
                    <div class="personal-data-row">
                      <span class="data-label">📱 Telefon:</span>
                      <span class="data-value">{{ appointmentForm.get('phoneNumber')?.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button
              type="submit"
              class="submit-button"
              [disabled]="!isFormReadyForSubmit()">
              <span *ngIf="!isSubmitting" class="button-content">
                <svg class="button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Termin buchen
              </span>
              <span *ngIf="isSubmitting" class="button-content">
                <div class="loading-spinner"></div>
                Wird gebucht...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .appointment-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .form-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      position: relative;
      margin-bottom: 40px;
      padding: 0;
      background: linear-gradient(135deg, #1e5f99 0%, #b8368a 100%);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(30, 95, 153, 0.25);
      overflow: hidden;
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #1e5f99 0%, #b8368a 100%);
      opacity: 0.95;
    }

    .header-background::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.08)"/><circle cx="70" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="80" r="2" fill="rgba(255,255,255,0.06)"/></svg>');
      background-size: 200px 200px;
    }

    .header-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 32px;
    }

    .title-section {
      text-align: center;
    }

    .title-container {
      max-width: 500px;
    }

    .main-title {
      font-size: 42px;
      font-weight: 800;
      color: white;
      margin: 0 0 16px 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-weight: 400;
      line-height: 1.4;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    .appointment-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section {
      background: white;
      border-radius: 0 0 16px 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      position: relative;
      border: 1px solid #f1f5f9;
      margin-bottom: 32px;
    }

    .form-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1e5f99 0%, #b8368a 100%);
    }

    .form-section:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .section-title {
      display: flex;
      align-items: center;
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 24px;
    }

    .section-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .section-number {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      font-weight: 700;
      font-size: 18px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(30, 95, 153, 0.3);
      flex-shrink: 0;
    }

    .section-text {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .section-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      border-radius: 50%;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      align-items: start;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field-hint {
      font-size: 12px;
      color: #888;
      font-weight: 400;
    }

    .form-input {
      padding: 14px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #f44336;
      background: #fef5f5;
    }

    .form-input::placeholder {
      color: #aaa;
    }

    .error-message {
      color: #f44336;
      font-size: 14px;
      margin-top: 6px;
      font-weight: 500;
    }

    .calendar-section {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      position: relative;
      overflow: hidden;
    }

    .calendar-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, rgba(30, 95, 153, 0.1), rgba(184, 54, 138, 0.1));
    }

    .calendar-error {
      margin-top: 16px;
      text-align: center;
      padding: 12px;
      background: #fef5f5;
      border-radius: 8px;
      border: 1px solid #ffcdd2;
    }

    .summary-card {
      background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%);
      border-radius: 16px;
      padding: 32px;
      border: 1px solid #e3e8f0;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 3px 10px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .summary-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1e5f99 0%, #b8368a 100%);
    }

    .summary-item {
      margin-bottom: 24px;
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-label {
      font-weight: 700;
      color: #1e293b;
      font-size: 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f1f5f9;
      position: relative;
    }

    .summary-label::before {
      content: '';
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(30, 95, 153, 0.3);
    }

    .summary-label::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, #1e5f99, #b8368a);
    }

    .summary-appointment {
      background: linear-gradient(135deg, #1e5f99 0%, #b8368a 100%);
      color: white;
      padding: 20px 60px 20px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(30, 95, 153, 0.3);
      width: 100%;
      position: relative;
    }

    .appointment-info {
      flex: 1;
    }

    .summary-appointment .edit-button {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      width: 44px;
      height: 44px;
    }

    .summary-appointment .edit-button:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .summary-appointment .edit-button:active {
      transform: translateY(0);
    }

    .summary-appointment .edit-icon {
      width: 18px;
      height: 18px;
      color: white;
      stroke-width: 2;
    }

    .appointment-date {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin-bottom: 6px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .date-mobile {
      display: none;
    }

    .date-desktop {
      display: inline;
    }

    .appointment-time {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .appointment-time::before {
      content: '🕐';
      font-size: 14px;
    }

    .summary-divider {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
      margin: 32px 0;
      position: relative;
    }

    .summary-divider::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      background: #1e5f99;
      border-radius: 50%;
      border: 2px solid white;
    }

    .summary-personal-data {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #f1f5f9;
      position: relative;
    }

    .summary-personal-data .edit-button {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(30, 95, 153, 0.2);
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-personal-data .edit-button:hover {
      background: rgba(255, 255, 255, 1);
      border-color: rgba(30, 95, 153, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 95, 153, 0.15);
    }

    .summary-personal-data .edit-button:active {
      transform: translateY(0);
    }

    .summary-personal-data .edit-icon {
      width: 18px;
      height: 18px;
      color: #1e5f99;
      stroke-width: 2;
    }

    .personal-data-content {
      padding-right: 60px;
    }

    .personal-data-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f8fafc;
      transition: all 0.2s ease;
    }

    .personal-data-row:last-child {
      border-bottom: none;
    }

    .personal-data-row:hover {
      background: #f8fafc;
      margin: 0 -12px;
      padding: 12px;
      border-radius: 8px;
    }

    .data-label {
      font-weight: 600;
      color: #475569;
      font-size: 14px;
      min-width: 160px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .data-value {
      font-weight: 700;
      color: #1e293b;
      font-size: 14px;
      text-align: right;
      word-break: break-word;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .edit-button {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      width: 44px;
      height: 44px;
    }

    .edit-button:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .edit-button:active {
      transform: translateY(0);
    }

    .edit-icon {
      width: 18px;
      height: 18px;
      color: white;
      stroke-width: 2;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .submit-button {
      background: linear-gradient(135deg, #1e5f99, #b8368a);
      color: white;
      border: none;
      padding: 16px 48px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
      position: relative;
      overflow: hidden;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(30, 95, 153, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .button-icon {
      width: 20px;
      height: 20px;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .appointment-container {
        padding: 12px;
      }
      
      .form-section {
        padding: 20px;
      }
      
      .header {
        border-radius: 16px;
      }
      
      .header-content {
        flex-direction: column;
        gap: 24px;
        text-align: center;
        padding: 32px 24px;
      }
      
      .title-section {
        text-align: center;
      }
      
      .main-title {
        font-size: 32px;
      }
      
      .subtitle {
        font-size: 16px;
      }
      
      .section-title {
        font-size: 20px;
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .summary-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .summary-card {
        padding: 24px 16px;
        margin: 0 -4px;
      }
      
      .summary-label {
        font-size: 16px;
        margin-bottom: 12px;
      }
      
      .summary-appointment {
        text-align: left;
        width: 100%;
        padding: 16px 60px 16px 20px;
        position: relative;
      }

      .summary-appointment .edit-button {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        padding: 10px;
      }

      .summary-appointment .edit-icon {
        width: 16px;
        height: 16px;
      }

      .date-desktop {
        display: none;
      }

      .date-mobile {
        display: inline;
      }
      
      .summary-personal-data {
        width: 100%;
        min-width: unset;
        padding: 20px 16px;
      }
      
      .personal-data-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 16px 0;
      }
      
      .personal-data-row:hover {
        margin: 0 -8px;
        padding: 16px 8px;
      }
      
      .data-label {
        min-width: unset;
        font-size: 13px;
      }
      
      .data-value {
        text-align: left;
        width: 100%;
        margin-top: 4px;
      }
    }

    @media (max-width: 480px) {
      .header {
        border-radius: 12px;
      }
      
      .header-content {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        padding: 28px 20px;
      }
      
      .title-section {
        text-align: center;
      }
      
      .main-title {
        font-size: 28px;
      }
      
      .subtitle {
        font-size: 15px;
      }
      
      .submit-button {
        width: 100%;
        margin: 0 16px;
      }

      .form-section {
        margin-bottom: 24px;
        padding: 24px 20px;
      }

      .section-title {
        font-size: 22px;
        margin-bottom: 20px;
      }

      .section-content {
        gap: 12px;
      }

      .section-text {
        font-size: 20px;
      }

      .section-number {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }

      .summary-label {
        font-size: 18px;
        margin-bottom: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group.phone {
        grid-column: span 1;
      }

      .form-group.email {
        grid-column: span 1;
      }

      .appointment-info-wrapper {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .summary-personal-data {
        padding: 20px;
        padding-right: 56px;
      }

      .summary-personal-data .edit-button {
        width: 40px;
        height: 40px;
        padding: 10px;
        top: 12px;
        right: 12px;
      }

      .summary-personal-data .edit-icon {
        width: 16px;
        height: 16px;
      }

      .personal-data-content {
        padding-right: 52px;
      }

      .appointment-info {
        order: 1;
      }

      .data-item {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
      }

      .data-label {
        text-align: left;
        font-size: 12px;
      }

      .data-value {
        text-align: left;
        font-size: 13px;
        padding: 8px 12px;
      }
    }
  `]
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private cdr = inject(ChangeDetectorRef);

  forecasts: WeatherForecasts = [];
  appointmentForm!: FormGroup;
  selectedSlot: AppointmentSlot | null = null;
  isSubmitting = false;
  bookedAppointment: Appointment | null = null;


  constructor(private http: HttpClient) {
    http.get<WeatherForecasts>('api/weatherforecast').subscribe({
      next: result => {
        console.table(result);
        this.forecasts = result;
      },
      error: console.error
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.appointmentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      socialSecurityNumber: ['', [Validators.required, this.svNumberValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, this.phoneNumberValidator.bind(this)]],
      selectedSlot: [null, Validators.required]
    });
  }

  onSlotSelected(slot: AppointmentSlot) {
    this.selectedSlot = slot;
    this.appointmentForm.patchValue({ selectedSlot: slot });

    // Mark the selectedSlot field as touched and update its validity
    const selectedSlotControl = this.appointmentForm.get('selectedSlot');
    if (selectedSlotControl) {
      selectedSlotControl.markAsTouched();
      selectedSlotControl.updateValueAndValidity();
    }

    // Trigger change detection
    this.cdr.detectChanges();
  }

  onSvNumberInput(event: any) {
    const input = event.target;
    const formatted = this.appointmentService.formatSocialSecurityNumber(input.value);
    input.value = formatted;
    this.appointmentForm.patchValue({ socialSecurityNumber: formatted });
  }

  onPhoneNumberInput(event: any) {
    const input = event.target;
    const formatted = this.appointmentService.formatPhoneNumber(input.value);
    input.value = formatted;
    this.appointmentForm.patchValue({ phoneNumber: formatted });
  }

  onSubmit() {
    if (this.appointmentForm.valid && this.selectedSlot) {
      this.isSubmitting = true;
      this.cdr.detectChanges(); // Trigger change detection für loading state

      const formValue = this.appointmentForm.value;
      const appointment: Omit<Appointment, 'id' | 'createdAt'> = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        socialSecurityNumber: formValue.socialSecurityNumber,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber,
        appointmentSlot: this.selectedSlot
      };

      this.appointmentService.bookAppointment(appointment).subscribe({
        next: (booked) => {
          this.bookedAppointment = booked;
          this.isSubmitting = false;
          this.cdr.detectChanges(); // Trigger change detection für success state
          // Scroll to top for success message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          console.error('Booking failed:', error);
          this.isSubmitting = false;
          this.cdr.detectChanges(); // Trigger change detection für error state
          // Here you could show an error message
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.appointmentForm.controls).forEach(key => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges(); // Trigger change detection für validation errors
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return Boolean(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Dieses Feld ist erforderlich';
      if (field.errors['minlength']) return `Mindestens ${field.errors['minlength'].requiredLength} Zeichen erforderlich`;
      if (field.errors['email']) return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      if (field.errors['svNumber']) return 'Ungültige Sozialversicherungsnummer (Format: 1232 150184 - Laufende Nr. + Prüfziffer + Geburtsdatum)';
      if (field.errors['phoneNumber']) return 'Bitte geben Sie eine gültige Telefonnummer ein (z.B. +43 1 234 5678)';
    }
    return '';
  }

  formatAppointmentDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatAppointmentDateMobile(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  private svNumberValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const isValid = this.appointmentService.validateSocialSecurityNumber(value);
    return isValid ? null : { svNumber: true };
  }

  isFormReadyForSubmit(): boolean {
    return this.appointmentForm.valid &&
      this.selectedSlot !== null &&
      !this.isSubmitting;
  }

  private phoneNumberValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const isValid = this.appointmentService.validatePhoneNumber(value);
    return isValid ? null : { phoneNumber: true };
  }

  scrollToSection(section: 'appointment' | 'personal'): void {
    const sectionId = section === 'appointment' ? 'appointment-section' : 'personal-section';
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}
