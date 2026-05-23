'use client'

import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#2D3539] text-white pt-7 pb-5">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Newsletter Section */}
        <div className="max-w-xl mx-auto text-center mb-5">
          <h3 className="font-serif text-4xl mb-4 italic tracking-wide">Subscribe to my Newsletter</h3>
          <form className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-12" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="tel" 
              placeholder="mobile No. *" 
              required
              className="w-full sm:w-64 bg-transparent border-b border-white/50 px-2 py-2 focus:outline-none focus:border-white text-white placeholder:text-white/50 transition-colors text-sm"
            />
            <button className="border border-white/50 hover:bg-white hover:text-[#2D3539] transition-colors rounded-sm px-8 py-2 text-xs tracking-widest uppercase">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-5 border-t border-white/10 gap-6">
          <p className="text-xs text-white/50 order-2 md:order-1 font-light tracking-wide">
            © {new Date().getFullYear()} Built for Timeless Stories.
          </p>
          
          <div className="flex items-center gap-6 text-xs text-white/50 order-1 md:order-2">
             <button 
              onClick={scrollToTop}
              className="w-8 h-8 rounded-sm border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3 h-3 text-white/80" />
            </button>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
