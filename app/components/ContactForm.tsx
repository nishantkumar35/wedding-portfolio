'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

type Status = 'idle' | 'sending' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [formData, setFormData] = useState({
    firstName:   '',
    lastName:    '',
    email:       '',
    phone:       '',
    weddingDate: '',
    location:    '',
    package:     '',
    message:     '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')

    // ── Step 1: Save to MongoDB (required) ─────────────────────────────────
    try {
      const saveRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => ({}))
        throw new Error(`DB save failed (${saveRes.status}): ${body?.error ?? 'unknown'}`)
      }
    } catch (err) {
      console.error('[ContactForm] DB save error:', err)
      setStatus('error')
      return
    }

    // ── Step 2: Send EmailJS notification (best-effort) ────────────────────
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name:        `${formData.firstName} ${formData.lastName}`.trim(),
          from_email:       formData.email,
          phone:            formData.phone,
          wedding_date:     formData.weddingDate,
          venue:            formData.location,
          selected_package: formData.package,
          message:          formData.message,
        },
        PUBLIC_KEY,
      )
    } catch (err) {
      // EmailJS failure — inquiry is already saved to DB, so log but don't block
      const detail = typeof err === 'object' && err !== null
        ? JSON.stringify(err)
        : String(err)
      console.warn('[ContactForm] EmailJS send failed (inquiry saved to DB):', detail)
    }

    // ── Success ─────────────────────────────────────────────────────────────
    setStatus('success')
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      weddingDate: '', location: '', package: '', message: '',
    })
  }


  return (
    <section id="contact" className="py-10 px-6 bg-[#C4D1D4]">
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row shadow-2xl bg-white rounded-sm overflow-hidden">
        {/* Left side image */}
        <div className="w-full md:w-[45%] bg-[#7B8B94] min-h-[400px] md:min-h-full relative">
          <Image
            src="/assets/form.jpg"
            alt="Wedding photography inquiry"
            className="w-full h-full object-cover"
            fill
          />
        </div>

        {/* Right side form */}
        <div className="w-full md:w-[55%] p-12 md:p-14 lg:p-16">
          <h2 className="font-serif text-[38px] text-[#333C43] italic mb-3">Get in Touch</h2>
          <p className="text-[#333C43]/60 font-light text-[11px] leading-relaxed mb-10 max-w-sm">
            I&apos;d love to hear about your special day! Please fill out the form below, and I&apos;ll get back to you soon.
          </p>

          {status === 'success' && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-700 text-sm text-center">
              ✓ Your inquiry has been sent! I&apos;ll be in touch soon.
            </div>
          )}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-sm text-rose-700 text-sm text-center">
              Something went wrong. Please try again or email directly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 gap-y-7">
              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                  Full Name *
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest opacity-0 hidden sm:block">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                  placeholder="Last Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                  placeholder="Email"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                  placeholder="Phone"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                  Wedding Date
                </label>
                <input
                  name="weddingDate"
                  type="text"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                  Location / Venue
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm placeholder:text-[#333C43]/30"
                  placeholder="Location"
                />
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                Which Package Are You Interested In?
              </label>
              <select
                name="package"
                value={formData.package}
                onChange={handleChange}
                className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors text-sm text-[#333C43]/80"
              >
                <option value="" disabled hidden>Select a package</option>
                <option value="Traditional Package (Without Drone) — ₹30,000">Traditional Package — Without Drone (₹30,000)</option>
                <option value="Traditional Package (With Drone) — ₹35,000">Traditional Package — With Drone (₹35,000)</option>
                <option value="Premium Cinematic Package — ₹50,000">Premium Cinematic Package (₹50,000)</option>
                <option value="Full Event-wise Quotation — ₹86,000">Full Event-wise Quotation (₹86,000)</option>
                <option value="Custom / Not Sure Yet">Custom / Not Sure Yet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-semibold text-[#333C43] uppercase tracking-widest">
                Message
              </label>
              <textarea
                name="message"
                rows={2}
                value={formData.message}
                onChange={handleChange}
                className="w-full border-b border-gray-200 bg-transparent py-1.5 focus:outline-none focus:border-[#8697A0] transition-colors resize-none text-sm placeholder:text-[#333C43]/30"
                placeholder="Write a message..."
              />
            </div>

            <p className="text-[10px] text-[#333C43] italic font-light pt-2 pb-2">
              Tell me a little about your vision, how you met, or any details you&apos;d like to share!
            </p>

            <Button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-[#F4F3ED] border-2 border-[#333C43] text-[#333C43] hover:bg-[#333C43] hover:text-[#F4F3ED] rounded-none py-6 uppercase tracking-widest text-[10px] font-semibold transition-colors shadow-none h-auto disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
