import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';

import { Modal } from '@/components/Modal';
import { locations } from '@/data/locations';
import { contact, doctor } from '@/data/site';
import { cn } from '@/utils/cn';
import { IconCheckCircle } from '@/components/icons';

interface FormValues {
  fullName: string;
  phone: string;
  location: string;
  date: string;
  time: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  fullName: '',
  phone: '',
  location: '',
  date: '',
  time: '',
  message: '',
};

/** Consultation slots offered on the Rocket form. */
const TIME_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
];

const todayIso = () => new Date().toISOString().split('T')[0];

/** Accepts 10-digit Indian mobile numbers, with or without a +91 / 0 prefix. */
const isValidPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return /^[6-9]/.test(digits);
  if (digits.length === 11) return digits.startsWith('0') && /^[6-9]/.test(digits.slice(1));
  if (digits.length === 12) return digits.startsWith('91') && /^[6-9]/.test(digits.slice(2));
  return false;
};

const formatDate = (iso: string) => {
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;

  return parsed.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/* Rocket field styling */
const LABEL = 'block text-sm font-medium text-gray-700 mb-1';
const INPUT =
  'w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';

interface AppointmentFormProps {
  /** Pre-fills "Reason for Visit" — used by the service detail CTAs. */
  defaultReason?: string;
}

export function AppointmentForm({ defaultReason = '' }: AppointmentFormProps) {
  const fieldId = useId();
  const [values, setValues] = useState<FormValues>({ ...EMPTY, message: defaultReason });
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmed, setConfirmed] = useState<FormValues | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const minDate = useMemo(todayIso, []);
  const selectedClinic = locations.find((clinic) => clinic.name === values.location);

  const setField = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (!values.fullName.trim()) next.fullName = 'Please enter your full name.';
    else if (values.fullName.trim().length < 2) next.fullName = 'Please enter at least 2 characters.';

    if (!values.phone.trim()) next.phone = 'Please enter your phone number.';
    else if (!isValidPhone(values.phone)) next.phone = 'Please enter a valid 10-digit mobile number.';

    if (!values.location) next.location = 'Please select a preferred clinic.';

    if (!values.date) next.date = 'Please choose a preferred date.';
    else if (values.date < minDate) next.date = 'Please choose today or a later date.';

    if (!values.time) next.time = 'Please choose a preferred time.';

    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validate();
    setErrors(found);

    const firstError = Object.keys(found)[0];
    if (firstError) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }

    // Frontend-only flow: no network request, no storage. Show confirmation.
    setConfirmed(values);
  };

  const handleDone = () => {
    setConfirmed(null);
    setValues({ ...EMPTY, message: defaultReason });
    setErrors({});
  };

  const borderFor = (field: keyof FormValues) =>
    errors[field] ? 'border-red-400' : 'border-gray-200';

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8"
      >
        <Field id={`${fieldId}-name`} label="Full Name" required error={errors.fullName}>
          <input
            id={`${fieldId}-name`}
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={values.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? `${fieldId}-name-error` : undefined}
            className={cn(INPUT, borderFor('fullName'))}
          />
        </Field>

        <Field id={`${fieldId}-phone`} label="Phone Number" required error={errors.phone}>
          <input
            id={`${fieldId}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Enter your phone number"
            value={values.phone}
            onChange={(event) => setField('phone', event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${fieldId}-phone-error` : undefined}
            className={cn(INPUT, borderFor('phone'))}
          />
        </Field>

        <Field id={`${fieldId}-location`} label="Preferred Location" required error={errors.location}>
          <select
            id={`${fieldId}-location`}
            name="location"
            value={values.location}
            onChange={(event) => setField('location', event.target.value)}
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? `${fieldId}-location-error` : undefined}
            className={cn(INPUT, borderFor('location'), !values.location && 'text-gray-400')}
          >
            <option value="">Select a location</option>
            {locations.map((clinic) => (
              <option key={clinic.id} value={clinic.name}>
                {clinic.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id={`${fieldId}-date`} label="Preferred Date" required error={errors.date}>
            <input
              id={`${fieldId}-date`}
              name="date"
              type="date"
              min={minDate}
              value={values.date}
              onChange={(event) => setField('date', event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? `${fieldId}-date-error` : undefined}
              className={cn(INPUT, borderFor('date'))}
            />
          </Field>

          <Field id={`${fieldId}-time`} label="Preferred Time" required error={errors.time}>
            <select
              id={`${fieldId}-time`}
              name="time"
              value={values.time}
              onChange={(event) => setField('time', event.target.value)}
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? `${fieldId}-time-error` : undefined}
              className={cn(INPUT, borderFor('time'), !values.time && 'text-gray-400')}
            >
              <option value="">Select a time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {selectedClinic ? (
          <p className="rounded-lg bg-blue-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
            Consultation hours at <strong className="font-semibold">{selectedClinic.name}</strong>:{' '}
            {selectedClinic.timings.join(' · ')} · Fee {selectedClinic.fee}
          </p>
        ) : null}

        <Field id={`${fieldId}-message`} label="Reason for Visit / Message">
          <textarea
            id={`${fieldId}-message`}
            name="message"
            rows={4}
            placeholder="Briefly describe your symptoms or reason for the visit"
            value={values.message}
            onChange={(event) => setField('message', event.target.value)}
            className={cn(INPUT, 'resize-y border-gray-200')}
          />
        </Field>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-700 py-3 text-base font-bold text-white transition-colors duration-150 hover:bg-blue-800"
        >
          Book Appointment
        </button>

        <p className="text-center text-xs leading-relaxed text-gray-500">
          This form sends a request only — our team will call to confirm. For urgent problems please
          call{' '}
          <a href={contact.phoneHref} className="font-semibold text-blue-700 hover:underline">
            {contact.phone}
          </a>
          . In an emergency, go to the nearest hospital.
        </p>
      </form>

      {/* ---------------- Confirmation ---------------- */}
      <Modal
        open={confirmed !== null}
        onClose={handleDone}
        labelledBy={`${fieldId}-confirm-title`}
        describedBy={`${fieldId}-confirm-desc`}
      >
        {confirmed ? (
          <div className="text-center">
            <span
              aria-hidden="true"
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              <IconCheckCircle className="h-9 w-9" />
            </span>

            <h2 id={`${fieldId}-confirm-title`} className="text-2xl font-bold text-gray-900">
              Appointment Confirmed!
            </h2>
            <p id={`${fieldId}-confirm-desc`} className="mt-2 text-sm text-gray-500">
              Your appointment has been successfully booked.
            </p>

            <dl className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 text-left">
              <SummaryRow label="Patient" value={confirmed.fullName} />
              <SummaryRow label="Date" value={formatDate(confirmed.date)} />
              <SummaryRow label="Time" value={confirmed.time} />
              <SummaryRow label="Location" value={confirmed.location} />
              <div className="px-5 py-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Doctor
                </dt>
                <dd className="mt-1">
                  <span className="block text-sm font-bold text-gray-900">{doctor.name}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-blue-700">
                    {doctor.designation}
                  </span>
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-left text-xs leading-relaxed text-gray-600">
              Our team will contact you on the number provided to confirm your slot. Please call{' '}
              <a href={contact.phoneHref} className="font-semibold text-blue-700 hover:underline">
                {contact.phone}
              </a>{' '}
              if you need to reschedule.
            </p>

            <button
              type="button"
              onClick={handleDone}
              className="mt-6 w-full rounded-lg bg-blue-700 py-3 text-base font-bold text-white transition-colors duration-150 hover:bg-blue-800"
            >
              Done
            </button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}{' '}
        {required ? (
          <>
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </label>

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-3.5">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="text-right text-sm font-bold text-gray-900">{value}</dd>
    </div>
  );
}
