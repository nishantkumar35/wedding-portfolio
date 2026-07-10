import { z } from 'zod'

// ---------------------------------------------------------------------------
// Contact form submission
// ---------------------------------------------------------------------------
export const ContactSchema = z.object({
  firstName:   z.string().min(1, 'First name is required').max(100).trim(),
  lastName:    z.string().max(100).trim().optional(),
  email:       z.string().email('Invalid email address').max(255).trim(),
  phone:       z.string().max(30).trim().optional(),
  weddingDate: z.string().max(50).trim().optional(),
  location:    z.string().max(200).trim().optional(),
  package:     z.string().max(100).trim().optional(),
  message:     z.string().max(2000).trim().optional(),
})

export type ContactInput = z.infer<typeof ContactSchema>

// ---------------------------------------------------------------------------
// Inquiry status update (admin PATCH)
// ---------------------------------------------------------------------------
export const InquiryStatusSchema = z.object({
  id:     z.string().min(1, 'id is required'),
  status: z.enum(['new', 'read', 'replied'] as const, {
    error: () => ({ message: "status must be 'new', 'read', or 'replied'" }),
  }),
})

export type InquiryStatusInput = z.infer<typeof InquiryStatusSchema>
