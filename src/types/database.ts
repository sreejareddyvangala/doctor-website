/**
 * Shapes returned by the Supabase RPCs and tables.
 *
 * Hand-written to match `supabase/migrations/*.sql`. If you change the
 * schema, update this file too — or generate it instead with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'
  | 'completed'
  | 'no_show';

export type StaffRole = 'receptionist' | 'admin';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  maps_url: string | null;
  consultation_fee: number | null;
  active: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  slug: string;
  specialization: string | null;
  active: boolean;
}

export interface Patient {
  id: string;
  full_name: string;
  /** Normalised to 10 digits by `book_appointment`. */
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  /** Human-facing reference, e.g. "APT-000001". */
  appointment_ref: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  /** ISO date, e.g. "2026-08-15". */
  appointment_date: string;
  /** 24-hour clock, e.g. "10:30:00". */
  start_time: string;
  end_time: string;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AppointmentHistoryEntry {
  id: string;
  appointment_id: string;
  action: string;
  from_status: AppointmentStatus | null;
  to_status: AppointmentStatus | null;
  notes: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface StaffProfile {
  id: string;
  full_name: string | null;
  role: StaffRole;
  active: boolean;
}

/* ------------------------------------------------------------------ *
 * RPC signatures
 * ------------------------------------------------------------------ */

/** Row returned by `get_available_slots`. */
export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
}

export interface BookAppointmentArgs {
  p_doctor_id: string;
  p_clinic_id: string;
  /** ISO date — "2026-08-15". */
  p_date: string;
  /** 24-hour clock — "10:30" or "10:30:00". */
  p_start_time: string;
  p_full_name: string;
  p_phone: string;
  p_reason?: string | null;
  p_email?: string | null;
}

/** Row returned by `book_appointment`. */
export interface BookedAppointment {
  appointment_ref: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  doctor_name: string;
  clinic_name: string;
  patient_name: string;
}

/**
 * SQLSTATE codes raised deliberately by `book_appointment`, so the UI can
 * show a friendly message without parsing error text.
 */
export const BOOKING_ERROR_CODES = {
  INVALID_NAME: 'P0002',
  INVALID_PHONE: 'P0003',
  INVALID_EMAIL: 'P0004',
  SLOT_UNAVAILABLE: 'P0005',
  /** Raised by the database's exclusion constraint on a booking race. */
  SLOT_TAKEN: '23P01',
} as const;
