import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  bio: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
});

export const createSlotSchema = z.object({
  doctor_id: z.string().min(1, 'Invalid doctor ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
});

export const bookAppointmentSchema = z.object({
  doctor_id: z.string().min(1, 'Invalid doctor ID'),
  slot_id: z.string().min(1, 'Invalid slot ID'),
  visit_reason: z.string().min(3, 'Please provide a reason for your visit').max(500),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_note: z.string().max(500).optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
