export interface Appointment {
  id?: string;
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  email: string;
  phoneNumber: string;
  appointmentSlot: AppointmentSlot;
  createdAt?: Date;
}

export interface AppointmentSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DaySlots {
  date: Date;
  slots: TimeSlot[];
}

export enum ViewMode {
  WEEK = 'week',
  DAY = 'day'
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  email: string;
  phoneNumber: string;
  selectedSlot: AppointmentSlot | null;
}
