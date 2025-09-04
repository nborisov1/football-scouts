'use client'

/**
 * Footer Component - Site footer with links and information
 * Preserves exact content and structure from original footer
 */

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">פוטבול סקאוטינג</h3>
            <p className="text-gray-300 text-sm">
              מחברים בין שחקנים לסקאוטים
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ניווט מהיר</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white text-sm">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link href="/leaderboards" className="text-gray-300 hover:text-white text-sm">
                  טבלאות מובילים
                </Link>
              </li>
              <li>
                <Link href="/training" className="text-gray-300 hover:text-white text-sm">
                  תוכניות אימון
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white text-sm">
                  אודות
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white text-sm">
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">משאבים</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/guides" className="text-gray-300 hover:text-white text-sm">
                  מדריכים
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white text-sm">
                  שאלות נפוצות
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white text-sm">
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">
                  מדיניות פרטיות
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">צור קשר</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300 text-sm">
                <i className="fas fa-envelope ml-2"></i>
                info@footballscouting.co.il
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <i className="fas fa-phone ml-2"></i>
                03-1234567
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <i className="fas fa-map-marker-alt ml-2"></i>
                תל אביב, ישראל
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-3">עקבו אחרינו</h5>
              <div className="flex space-x-4 space-x-reverse">
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white text-lg"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white text-lg"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white text-lg"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white text-lg"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            &copy; 2025 פוטבול סקאוטינג. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  )
}
