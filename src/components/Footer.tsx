'use client'

/**
 * Footer Component - Site footer with links and information
 * Preserves exact content and structure from original footer
 */

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-stadium-gradient relative overflow-hidden">
      {/* Field pattern overlay */}
      <div className="absolute inset-0 bg-field-pattern opacity-10"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="w-12 h-12 bg-field-gradient rounded-full flex items-center justify-center shadow-stadium-glow">
                <i className="fas fa-futbol text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white mb-1">
                  פוטבול סקאוטינג
                </h3>
                <p className="text-xs text-field-300 font-medium tracking-wide">
                  FOOTBALL SCOUTING
                </p>
              </div>
            </div>
            <p className="text-stadium-300 text-sm leading-relaxed mb-6">
              הפלטפורמה המובילה המחברת בין שחקני כדורגל מוכשרים לסקאוטים מקצועיים
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-field-300">1,000+</div>
                <div className="text-xs text-stadium-400">שחקנים</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-field-300">50+</div>
                <div className="text-xs text-stadium-400">סקאוטים</div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-white flex items-center">
              <i className="fas fa-compass ml-2 text-field-400"></i>
              ניווט מהיר
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-home ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  דף הבית
                </Link>
              </li>
              <li>
                <Link href="/leaderboards" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-trophy ml-3 text-accent-500 group-hover:text-accent-400 transition-colors"></i>
                  טבלאות מובילים
                </Link>
              </li>
              <li>
                <Link href="/training" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-dumbbell ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  תוכניות אימון
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-info-circle ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  אודות
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-envelope ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-white flex items-center">
              <i className="fas fa-book ml-2 text-field-400"></i>
              משאבים
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/guides" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-graduation-cap ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  מדריכים
                </Link>
              </li>
              <li>
                <Link href="/faq" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-question-circle ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  שאלות נפוצות
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-file-contract ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="flex items-center text-stadium-300 hover:text-field-300 text-sm transition-colors group">
                  <i className="fas fa-shield-alt ml-3 text-field-500 group-hover:text-field-400 transition-colors"></i>
                  מדיניות פרטיות
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-white flex items-center">
              <i className="fas fa-phone ml-2 text-field-400"></i>
              צור קשר
            </h4>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-stadium-300 text-sm">
                <div className="w-8 h-8 bg-field-600/30 rounded-lg flex items-center justify-center ml-3">
                  <i className="fas fa-envelope text-field-400 text-xs"></i>
                </div>
                <span className="hover:text-field-300 transition-colors cursor-pointer">
                  info@footballscouting.co.il
                </span>
              </li>
              <li className="flex items-center text-stadium-300 text-sm">
                <div className="w-8 h-8 bg-field-600/30 rounded-lg flex items-center justify-center ml-3">
                  <i className="fas fa-phone text-field-400 text-xs"></i>
                </div>
                <span className="hover:text-field-300 transition-colors cursor-pointer">
                  03-1234567
                </span>
              </li>
              <li className="flex items-center text-stadium-300 text-sm">
                <div className="w-8 h-8 bg-field-600/30 rounded-lg flex items-center justify-center ml-3">
                  <i className="fas fa-map-marker-alt text-field-400 text-xs"></i>
                </div>
                <span>תל אביב, ישראל</span>
              </li>
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="text-sm font-semibold mb-4 text-white">עקבו אחרינו</h5>
              <div className="flex space-x-3 space-x-reverse">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-field-400 hover:text-white hover:bg-field-600 transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-field-400 hover:text-white hover:bg-field-600 transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-field-400 hover:text-white hover:bg-field-600 transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-field-400 hover:text-white hover:bg-field-600 transition-all duration-300 hover:scale-110"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stadium-600/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center md:text-right text-stadium-400 text-sm mb-4 md:mb-0">
              &copy; 2025 פוטבול סקאוטינג. כל הזכויות שמורות.
            </p>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs text-stadium-500">Powered by</span>
              <div className="flex items-center space-x-1 space-x-reverse">
                <i className="fas fa-heart text-red-400 text-xs animate-pulse"></i>
                <span className="text-xs text-field-400 font-medium">Football Passion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
