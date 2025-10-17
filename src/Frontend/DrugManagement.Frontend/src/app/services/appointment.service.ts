import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Appointment, AppointmentSlot, DaySlots, TimeSlot } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private bookedSlotsSubject = new BehaviorSubject<string[]>([]);

  constructor() {
    // Initialisiere einige bereits gebuchte Slots für Demo-Zwecke
    // Verwende reale Daten für diese Woche
    const today = new Date();
    const dateStrings = [];
    
    // Generiere Beispiel-Buchungen für die aktuelle Woche
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Einige zufällige Buchungen
      if (i === 1) dateStrings.push(`${dateStr}-09:00`, `${dateStr}-14:00`);
      if (i === 2) dateStrings.push(`${dateStr}-10:00`);
      if (i === 3) dateStrings.push(`${dateStr}-11:00`, `${dateStr}-15:30`);
    }
    
    console.log('Initialisierte gebuchte Slots:', dateStrings);
    this.bookedSlotsSubject.next(dateStrings);
  }

  /**
   * Generiert verfügbare Zeitslots für einen Zeitraum
   */
  getAvailableSlots(startDate: Date, endDate: Date): Observable<DaySlots[]> {
    const slots: DaySlots[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      
      // Nur Werktage (Mo-Fr) - Sonntag = 0, Montag = 1, ..., Samstag = 6
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const daySlots = this.generateTimeSlotsForDay(current);
        slots.push(daySlots);
      }
      current.setDate(current.getDate() + 1);
    }

    return of(slots).pipe(delay(300)); // Simuliere API-Aufruf
  }

  /**
   * Generiert Zeitslots für einen Tag
   */
  private generateTimeSlotsForDay(date: Date): DaySlots {
    const timeSlots: TimeSlot[] = [];
    const bookedSlots = this.bookedSlotsSubject.value;
    
    // Arbeitszeiten: 08:00 - 17:00, Termine alle 30 Minuten
    for (let hour = 8; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotId = `${date.toISOString().split('T')[0]}-${timeString}`;
        
        // Mittagspause 12:00-13:00 ausschließen
        if (hour === 12) continue;
        
        timeSlots.push({
          time: timeString,
          available: !bookedSlots.includes(slotId)
        });
      }
    }

    return {
      date: new Date(date),
      slots: timeSlots
    };
  }

  /**
   * Bucht einen Termin
   */
  bookAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: this.generateId(),
      createdAt: new Date()
    };

    // Füge gebuchten Slot zur Liste hinzu
    const slotId = `${appointment.appointmentSlot.date.toISOString().split('T')[0]}-${appointment.appointmentSlot.startTime}`;
    const currentBookedSlots = this.bookedSlotsSubject.value;
    this.bookedSlotsSubject.next([...currentBookedSlots, slotId]);

    // Füge Termin zur Liste hinzu
    const currentAppointments = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...currentAppointments, newAppointment]);

    return of(newAppointment).pipe(delay(500)); // Simuliere API-Aufruf
  }

  /**
   * Überprüft, ob ein Zeitslot verfügbar ist
   */
  isSlotAvailable(date: Date, time: string): Observable<boolean> {
    const slotId = `${date.toISOString().split('T')[0]}-${time}`;
    return this.bookedSlotsSubject.pipe(
      map(bookedSlots => !bookedSlots.includes(slotId))
    );
  }

  /**
   * Generiert eine einfache ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validiert die Sozialversicherungsnummer (österreichisches Format)
   */
  validateSocialSecurityNumber(svNr: string): boolean {
    // Entferne Leerzeichen für die Validierung
    const cleanSvNr = svNr.replace(/\s/g, '');
    
    // Prüfe grundlegendes Format: genau 10 Ziffern
    if (!/^\d{10}$/.test(cleanSvNr)) {
      return false;
    }
    
    // Aufbau der SVNR: LLLPTTMMJJ
    // LLL = 3-stellige laufende Nummer (erste Stelle ungleich 0)
    // P = 1-stellige Prüfziffer
    // TTMMJJ = 6-stelliges Geburtsdatum
    
    const laufendeNummer = cleanSvNr.substring(0, 3);
    const pruefziffer = parseInt(cleanSvNr.substring(3, 4));
    const geburtsdatum = cleanSvNr.substring(4, 10);
    
    // Prüfe, dass die erste Stelle der laufenden Nummer ungleich 0 ist
    if (laufendeNummer.charAt(0) === '0') {
      return false;
    }
    
    // Prüfe das Geburtsdatum (TTMMJJ) - grundlegende Plausibilität
    const tag = parseInt(geburtsdatum.substring(0, 2));
    const monat = parseInt(geburtsdatum.substring(2, 4));
    const jahr = parseInt(geburtsdatum.substring(4, 6));
    
    // Grundlegende Datumsprüfung (Tag 01-31, Monat 01-12)
    if (tag < 1 || tag > 31 || monat < 1 || monat > 12) {
      return false;
    }
    
    // Prüfe die Prüfziffer nach dem Modulo-10-Verfahren
    return this.validateCheckDigit(laufendeNummer + geburtsdatum, pruefziffer);
  }
  
  /**
   * Validiert die Prüfziffer nach dem Modulo-10-Verfahren
   */
  private validateCheckDigit(nineDigits: string, checkDigit: number): boolean {
    // Gewichtung für die österreichische SVNR-Prüfziffer
    const weights = [3, 7, 9, 5, 8, 4, 2, 1, 6];
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nineDigits.charAt(i)) * weights[i];
    }
    
    const calculatedCheckDigit = sum % 11;
    
    // Bei Modulo 11 = 10 wird die Prüfziffer zu 4
    const finalCheckDigit = calculatedCheckDigit === 10 ? 4 : calculatedCheckDigit;
    
    return finalCheckDigit === checkDigit;
  }

  /**
   * Berechnet die korrekte Prüfziffer für eine SVNR (für Testzwecke)
   */
  calculateCheckDigit(laufendeNummer: string, geburtsdatum: string): number {
    const nineDigits = laufendeNummer + geburtsdatum;
    const weights = [3, 7, 9, 5, 8, 4, 2, 1, 6];
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(nineDigits.charAt(i)) * weights[i];
    }
    
    const calculatedCheckDigit = sum % 11;
    return calculatedCheckDigit === 10 ? 4 : calculatedCheckDigit;
  }

  /**
   * Formatiert eine Telefonnummer für österreichische/deutsche Nummern
   */
  formatPhoneNumber(input: string): string {
    // Entferne alle nicht-numerischen Zeichen außer + am Anfang
    let cleaned = input.replace(/[^\d+]/g, '');
    
    // Stelle sicher, dass + nur am Anfang steht
    if (cleaned.includes('+')) {
      const parts = cleaned.split('+');
      cleaned = '+' + parts.join('');
    }
    
    // Formatierung für verschiedene Länder/Formate
    if (cleaned.startsWith('+43')) {
      // Österreich: +43 1 234 5678 oder +43 664 123 4567
      return this.formatAustrianNumber(cleaned);
    } else if (cleaned.startsWith('+49')) {
      // Deutschland: +49 30 12345678 oder +49 160 12345678
      return this.formatGermanNumber(cleaned);
    } else if (cleaned.startsWith('0')) {
      // Nationale Nummer ohne Ländercode
      return this.formatNationalNumber(cleaned);
    } else if (cleaned.startsWith('+')) {
      // Andere internationale Nummern
      return this.formatInternationalNumber(cleaned);
    } else if (cleaned.length >= 8) {
      // Lokale Nummer ohne Vorwahl
      return this.formatLocalNumber(cleaned);
    }
    
    return cleaned;
  }

  private formatAustrianNumber(number: string): string {
    // +43 entfernen für Formatierung
    const withoutCountry = number.substring(3);
    
    if (withoutCountry.startsWith('1') && withoutCountry.length >= 8) {
      // Wien: +43 1 234 5678
      return `+43 1 ${withoutCountry.substring(1, 4)} ${withoutCountry.substring(4)}`;
    } else if (withoutCountry.startsWith('6') && withoutCountry.length >= 9) {
      // Mobilnummer: +43 664 88397116
      return `+43 ${withoutCountry.substring(0, 3)} ${withoutCountry.substring(3)}`;
    } else if (withoutCountry.length >= 7) {
      // Andere Festnetz: +43 316 123456
      return `+43 ${withoutCountry.substring(0, 3)} ${withoutCountry.substring(3)}`;
    }
    
    return number;
  }

  private formatGermanNumber(number: string): string {
    // +49 entfernen für Formatierung
    const withoutCountry = number.substring(3);
    
    if (withoutCountry.startsWith('30') || withoutCountry.startsWith('40') || withoutCountry.startsWith('89')) {
      // Großstädte: +49 30 12345678
      return `+49 ${withoutCountry.substring(0, 2)} ${withoutCountry.substring(2)}`;
    } else if (withoutCountry.startsWith('1')) {
      // Mobile: +49 160 12345678
      return `+49 ${withoutCountry.substring(0, 3)} ${withoutCountry.substring(3)}`;
    } else {
      // Andere: +49 221 12345678
      return `+49 ${withoutCountry.substring(0, 3)} ${withoutCountry.substring(3)}`;
    }
  }

  private formatNationalNumber(number: string): string {
    if (number.startsWith('01') && number.length >= 9) {
      // Wien: 01 234 5678 -> +43 1 234 5678
      const withoutZero = number.substring(1);
      return `+43 1 ${withoutZero.substring(1, 4)} ${withoutZero.substring(4)}`;
    } else if (number.startsWith('06') && number.length >= 11) {
      // Österr. Mobil: 0664 88397116 -> +43 664 88397116
      const withoutZero = number.substring(1);
      return `+43 ${withoutZero.substring(0, 3)} ${withoutZero.substring(3)}`;
    } else if (number.startsWith('0') && number.length >= 8) {
      // Andere Festnetz: 0316 123456 -> +43 316 123456
      const withoutZero = number.substring(1);
      return `+43 ${withoutZero.substring(0, 3)} ${withoutZero.substring(3)}`;
    }
    
    return number;
  }

  private formatInternationalNumber(number: string): string {
    // Einfache Formatierung für andere internationale Nummern
    if (number.length > 7) {
      const countryPart = number.substring(0, 3);
      const rest = number.substring(3);
      if (rest.length > 6) {
        return `${countryPart} ${rest.substring(0, 3)} ${rest.substring(3)}`;
      } else {
        return `${countryPart} ${rest}`;
      }
    }
    return number;
  }

  private formatLocalNumber(number: string): string {
    // Lokale Nummer: 234 5678
    if (number.length >= 7) {
      return `${number.substring(0, 3)} ${number.substring(3)}`;
    }
    return number;
  }

  /**
   * Validiert eine Telefonnummer
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    
    // Entferne alle Formatierungszeichen
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Prüfe auf gültige Länge
    if (cleaned.length < 8 || cleaned.length > 15) {
      return false;
    }
    
    // Prüfe auf gültige Formate
    const patterns = [
      /^\+43[1-9]\d{6,12}$/,    // Österreich
      /^\+49[1-9]\d{6,12}$/,    // Deutschland
      /^0[1-9]\d{6,12}$/,       // Nationale Nummer
      /^\+[1-9]\d{7,14}$/,      // Andere internationale
      /^[1-9]\d{6,11}$/         // Lokale Nummer
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Formatiert die Sozialversicherungsnummer
   */
  formatSocialSecurityNumber(input: string): string {
    // Entferne alle nicht-numerischen Zeichen
    const numbers = input.replace(/\D/g, '');
    
    // Formatiere als LLLP TTMMJJ (4 Ziffern Leerzeichen 6 Ziffern)
    // Aufbau: Laufende Nummer (3) + Prüfziffer (1) + Geburtsdatum (6)
    if (numbers.length <= 4) {
      return numbers;
    } else if (numbers.length <= 10) {
      return numbers.substring(0, 4) + ' ' + numbers.substring(4);
    } else {
      // Begrenze auf maximal 10 Ziffern
      return numbers.substring(0, 4) + ' ' + numbers.substring(4, 10);
    }
  }
}
