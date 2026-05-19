import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import logo from '../assets/institute-logo.png';

export default function Footer() {
  const [settings, setSettings] = useState<any>({
    siteName: 'Educational Institute',
    siteEmail: 'college@gmail.com',
    sitePhone: '1234567890',
    siteAddress: 'College Address',
    siteLogo: '',
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#',
    youtube: '#',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-gray-900 text-blue-300 pt-12 md:pt-20 pb-8 md:pb-12 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Logo and Address */}
          <div className="space-y-6 col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src={settings.footerLogo || settings.siteLogo || logo} alt="Logo" className="h-12 w-auto object-contain" />
            </div>

            <div>
              <h4 className="font-bold text-white mb-3">Address</h4>
              <p className="text-sm leading-relaxed text-blue-200/80">
                {settings.siteAddress}
              </p>
            </div>

            {/* Apply Button */}
            <a href="/admissions" className="inline-block w-full text-center px-4 py-3 border border-gray-700 rounded-xl text-sm font-bold text-gray-900 bg-white hover:bg-blue-50 transition-all hover:scale-[1.02]">
              Admissions Open — Apply Now
            </a>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-4 md:mb-6 text-base md:text-lg">
              Quick Links
            </h4>
            <ul className="space-y-2 md:space-y-3 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Academics', href: '/academics' },
                { label: 'Admissions', href: '/admissions' },
                { label: 'Placements', href: '/placements' },
                { label: 'Updates', href: '/news' }
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-span-1">
            <h4 className="font-bold text-white mb-4 md:mb-6 text-base md:text-lg">
              Contact Us
            </h4>
            <ul className="space-y-2 md:space-y-3 text-sm">
              <li>
                <a href={`tel:${settings.sitePhone}`} className="hover:text-white transition-colors">
                  {settings.sitePhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.siteEmail}`} className="hover:text-white transition-colors break-all">
                  {settings.siteEmail}
                </a>
              </li>
              <li>
                <a href={settings.mapPageUrl || settings.mapUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Find on Google Maps
                </a>
              </li>
            </ul>
          </div>

          {/* Follow On */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="font-bold text-white mb-4 md:mb-6 text-base md:text-lg">
              Follow On
            </h4>
            <div className="flex gap-4">
              {[
                { url: settings.facebook, label: 'f' },
                { url: settings.linkedin, label: 'in' },
                { url: settings.twitter, label: 'tw' },
                { url: settings.instagram, label: 'ig' },
                { url: settings.youtube, label: 'yt' }
              ].filter(s => s.url && s.url !== '#').map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-sm font-bold hover:bg-blue-600 transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider slice */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-400/60">
            <p>
              © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
            </p>
            <p className="text-center">
              Developed by{' '}
              <a 
                href="https://www.yashvachhani.com" 
                target="_blank" 
                className="text-white hover:text-blue-300 font-medium transition-colors"
              >
                Yash Vachhani
              </a>
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
