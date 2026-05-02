import { z } from 'zod'

export const createAppointmentSchema = z.object({
  clientName: z.string().min(1, 'Name is required'),
  clientPhone: z.string().min(7, 'Phone number is required'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  barberId: z.string().cuid(),
  serviceId: z.string().cuid(),
  startsAt: z.string().datetime(),
  notes: z.string().optional(),
  shopId: z.string().cuid(),
})

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  durationMins: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
  isActive: z.boolean().optional().default(true),
  barberIds: z.array(z.string().cuid()).optional(),
})

export const updateServiceSchema = createServiceSchema.partial()

export const createBarberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['OWNER', 'MANAGER', 'BARBER']).optional(),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PAID']).optional(),
})

export const updateShopSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  prayerBreaksEnabled: z.boolean().optional(),
})

export const registerSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
