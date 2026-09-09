import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-nova-border bg-nova-bg">
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-nova-gradient opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-nova-gradient flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">NOVA</span>
            </div>
            <p className="text-nova-text-muted text-sm leading-relaxed max-w-sm">
              A modern project management platform built for speed.
              Organize, track, and ship your projects with clarity and confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-nova-text-bright font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/login', label: 'Get Started' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-nova-text-muted text-sm hover:text-nova-accent-light transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-nova-text-bright font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-3">
              {[
                { icon: Phone, href: '#', label: 'Phone' },
                { icon: Mail, href: '#', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-nova-text-muted hover:text-nova-accent-light hover:border-nova-border-strong transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-nova-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-nova-text-muted text-xs">
            © {new Date().getFullYear()} NOVA. Built with ❤️ for developers.
          </p>
          <p className="text-xs text-nova-text-muted/50">
            Simplicity · Speed · Transparency
          </p>
        </div>
      </div>
    </footer>
  );
}
