'use client'

import Link from 'next/link'
import { ArrowUp, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#2D3539] text-white pt-14 pb-5">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 pb-12 border-b border-white/10">

          {/* Brand Column */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl italic font-light text-white/90 tracking-wide">
              Aarsh Wedding<br />Videography
            </h2>
            <p className="text-white/45 text-xs leading-relaxed font-light tracking-wide max-w-[220px]">
              Capturing timeless love stories with cinematic elegance. Based in Begusarai, Bihar.
            </p>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+917986643195"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-200 group"
                >
                  <span className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center group-hover:border-white/40 transition-colors flex-shrink-0">
                    <Phone className="w-3 h-3" />
                  </span>
                  <span className="text-xs font-light tracking-wide">+91 79866 43195</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:aarsh.wedding.videography@gmail.com"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-200 group"
                >
                  <span className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center group-hover:border-white/40 transition-colors flex-shrink-0">
                    <Mail className="w-3 h-3" />
                  </span>
                  <span className="text-xs font-light tracking-wide break-all">aarsh.wedding.videography@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-white/60">
                  <span className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3 h-3" />
                  </span>
                  <span className="text-xs font-light tracking-wide">Begusarai, Bihar, India</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'About', href: '/#about' },
                { label: 'Services', href: '/#services' },
                { label: 'Portfolio', href: '/#portfolio' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Gallery', href: '/gallery' },
                { label: 'Contact', href: '/#contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/50 hover:text-white/90 transition-colors duration-200 font-light tracking-wide flex items-center gap-2 group"
                  >
                    <span className="w-3 h-[1px] bg-white/20 group-hover:w-5 group-hover:bg-white/60 transition-all duration-300 inline-block" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-5 gap-4">
          <p className="text-[11px] text-white/35 order-2 md:order-1 font-light tracking-wide">
            © {new Date().getFullYear()} Aarsh Wedding Videography. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors order-1 md:order-2"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3 h-3 text-white/80" />
          </button>
        </div>

      </div>
    </footer>
  )
}
