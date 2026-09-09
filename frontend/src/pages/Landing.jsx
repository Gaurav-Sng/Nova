import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  LayoutDashboard,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Plus,
  ClipboardList,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ===== Intersection Observer hook for scroll animations ===== */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    const nodes = ref.current?.querySelectorAll('.animate-on-scroll');
    nodes?.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ===== Animated counter ===== */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const step = Math.ceil(target / 50);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-extrabold text-gradient">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const pageRef = useScrollReveal();

  const scrollToFeatures = (e) => {
    e.preventDefault();
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={pageRef} className="bg-nova-bg min-h-screen overflow-hidden">
      <Navbar variant="transparent" />

      {/* HERO SECTION                                                     */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-fade-in text-sm text-nova-accent-light">
            <Zap size={14} />
            <span>Built for speed. Designed for clarity.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Manage Projects at{' '}
            <span className="text-gradient">Light Speed</span>
          </h1>

          <p className="text-lg md:text-xl text-nova-text-muted max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            NOVA is the modern project management platform that cuts the noise.
            Organize tasks, visualize progress, and ship faster — without the bloat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <Link to="/login" className="btn-nova text-base flex items-center gap-2 group">
              Get Started Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="#features"
              onClick={scrollToFeatures}
              className="btn-nova-outline text-base"
            >
              See What's Inside
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="mt-20 animate-fade-in animation-delay-800">
            <a
              href="#features"
              onClick={scrollToFeatures}
              className="inline-flex flex-col items-center gap-2 text-nova-text-muted/40 hover:text-nova-accent-light transition-colors"
            >
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <ChevronDown size={18} className="animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION                                                 */}
      <section id="features" className="relative py-24 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-nova-accent text-sm font-semibold uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-nova-text-bright mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-nova-text-muted max-w-xl mx-auto">
              NOVA keeps project management simple, fast, and visual. No 200-page
              setup guides. No feature overload. Just ship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: LayoutDashboard,
                title: 'Kanban Boards',
                description:
                  'Visualize your workflow with intuitive drag-and-drop boards. Move tasks from To Do → In Progress → Done in seconds.',
                color: 'text-nova-accent',
                delay: 'animation-delay-100',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description:
                  'Create projects, invite your team, and track who\u2019s working on what. Everyone stays aligned without the meeting overhead.',
                color: 'text-nova-cyan',
                delay: 'animation-delay-300',
              },
              {
                icon: Zap,
                title: 'Instant Overview',
                description:
                  'Your dashboard shows every project at a glance. No digging through menus — just open NOVA and see what matters.',
                color: 'text-nova-amber',
                delay: 'animation-delay-500',
              },
            ].map(({ icon: Icon, title, description, color, delay }) => (
              <div
                key={title}
                className={`glass-card rounded-2xl p-8 animate-on-scroll ${delay}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 ${color}`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-nova-text-bright mb-3">
                  {title}
                </h3>
                <p className="text-nova-text-muted text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS                                                     */}
      <section className="relative py-24 md:py-32 px-4">
        {/* Subtle gradient divider */}
        <div className="absolute top-0 inset-x-0 h-px bg-nova-gradient opacity-20" />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-nova-accent text-sm font-semibold uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-nova-text-bright">
              Three steps. That's it.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-nova-accent/40 via-nova-indigo/40 to-nova-cyan/40" />

            {[
              {
                step: '01',
                icon: Plus,
                title: 'Create a Project',
                desc: 'Give it a name and description. Done — your workspace is ready.',
                delay: 'animation-delay-100',
              },
              {
                step: '02',
                icon: ClipboardList,
                title: 'Add Tasks',
                desc: 'Break work into tasks. Assign statuses. Keep scope tight and clear.',
                delay: 'animation-delay-300',
              },
              {
                step: '03',
                icon: BarChart3,
                title: 'Track Progress',
                desc: 'Move tasks across columns. See what\'s done and what\'s next at a glance.',
                delay: 'animation-delay-500',
              },
            ].map(({ step, icon: Icon, title, desc, delay }) => (
              <div
                key={step}
                className={`text-center animate-on-scroll ${delay}`}
              >
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full glass mb-6 mx-auto ring-2 ring-nova-accent/20">
                  <Icon size={24} className="text-nova-accent-light" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-nova-gradient flex items-center justify-center text-xs font-bold text-white">
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-nova-text-bright mb-2">
                  {title}
                </h3>
                <p className="text-nova-text-muted text-sm max-w-xs mx-auto">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS STRIP                                                      */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-nova-gradient opacity-[0.04]" />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 1200, suffix: '+', label: 'Projects Created' },
              { value: 500, suffix: '+', label: 'Happy Teams' },
              { value: 15000, suffix: '+', label: 'Tasks Completed' },
              { value: 99, suffix: '%', label: 'Uptime' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="animate-on-scroll">
                <AnimatedCounter target={value} suffix={suffix} />
                <p className="text-nova-text-muted text-sm mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-32 px-4">
        <div className="absolute top-0 inset-x-0 h-px bg-nova-gradient opacity-20" />

        <div className="max-w-3xl mx-auto text-center animate-on-scroll">
          <h2 className="text-3xl md:text-5xl font-bold text-nova-text-bright mb-6">
            Ready to launch your next project?
          </h2>
          <p className="text-nova-text-muted mb-10 max-w-lg mx-auto">
            Join hundreds of teams already using NOVA to ship faster, collaborate
            smarter, and stay on track.
          </p>
          <Link
            to="/login"
            className="btn-nova text-lg inline-flex items-center gap-2 group !px-8 !py-4"
          >
            <Rocket size={20} />
            Sign Up Now — It's Free
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
