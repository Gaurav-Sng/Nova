import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Target,
  Heart,
  Shield,
  Zap,
  Eye,
  Code2,
  Briefcase,
  Users,
  Palette,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

export default function About() {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="bg-nova-bg min-h-screen overflow-hidden">
      <Navbar variant="transparent" />

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 text-center">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-nova-accent text-sm font-semibold uppercase tracking-widest mb-4 animate-fade-in">
            About NOVA
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Built by developers,{' '}
            <span className="text-gradient">for developers</span>
          </h1>
          <p className="text-lg text-nova-text-muted max-w-xl mx-auto animate-fade-in-up animation-delay-200">
            We believe project management should be as elegant as the code you write. 
            No bloat. No enterprise overhead. Just a clean, fast tool that gets out of your way.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* MISSION & VISION                                                 */}
      {/* ================================================================ */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <p className="text-nova-accent text-sm font-semibold uppercase tracking-widest mb-3">
                Our Mission
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-nova-text-bright mb-6">
                Project management without the project management
              </h2>
              <p className="text-nova-text-muted leading-relaxed mb-4">
                Enterprise tools are bloated with features nobody asked for — Gantt charts, 
                resource leveling, portfolio heat maps. You end up spending more time 
                managing the tool than managing your work.
              </p>
              <p className="text-nova-text-muted leading-relaxed">
                NOVA strips all of that away. Create a project, add tasks, move them across 
                columns. That's it. We handle the fundamentals perfectly so you can focus 
                on what actually matters — building great things.
              </p>
            </div>
            <div className="animate-on-scroll animation-delay-300">
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-nova-accent/10 rounded-full blur-3xl" />
                <div className="relative space-y-5">
                  {[
                    { icon: Eye, text: 'Clarity over complexity' },
                    { icon: Zap, text: 'Speed over ceremony' },
                    { icon: Heart, text: 'Joy over obligation' },
                    { icon: Shield, text: 'Reliability over feature count' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-nova-accent-light shrink-0">
                        <Icon size={20} />
                      </div>
                      <span className="text-nova-text font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TARGET AUDIENCE                                                  */}
      {/* ================================================================ */}
      <section className="py-20 md:py-28 px-4">
        <div className="absolute inset-0 bg-nova-gradient opacity-[0.02]" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-nova-accent text-sm font-semibold uppercase tracking-widest mb-3">
              Who it's for
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nova-text-bright mb-4">
              Made for people who build
            </h2>
            <p className="text-nova-text-muted max-w-xl mx-auto">
              NOVA is for anyone who wants powerful project tracking without the learning curve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Rocket,
                title: 'Startups',
                desc: 'Move fast, stay organized, and iterate without friction. NOVA scales from MVP to product-market fit.',
                color: 'text-nova-accent',
              },
              {
                icon: Code2,
                title: 'Dev Teams',
                desc: 'Track sprints, manage backlogs, and keep your codebase shipping on schedule.',
                color: 'text-nova-cyan',
              },
              {
                icon: Palette,
                title: 'Freelancers',
                desc: 'Manage client projects with a clean dashboard. Know exactly where every deliverable stands.',
                color: 'text-nova-amber',
              },
              {
                icon: Briefcase,
                title: 'Agencies',
                desc: 'Run multiple client projects in parallel without losing your mind. One board per project, zero overlap.',
                color: 'text-nova-emerald',
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className={`glass-card rounded-2xl p-7 text-center animate-on-scroll animation-delay-${(i + 1) * 100}`}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-5 ${color}`}
                >
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-nova-text-bright mb-2">
                  {title}
                </h3>
                <p className="text-nova-text-muted text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CORE VALUES                                                      */}
      {/* ================================================================ */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <p className="text-nova-accent text-sm font-semibold uppercase tracking-widest mb-3">
              Core Values
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-nova-text-bright">
              What NOVA stands for
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Simplicity',
                desc: 'Every feature earns its place. If it doesn\'t make your workflow faster, it doesn\'t ship. NOVA stays lean by design.',
                gradient: 'from-nova-accent/20 to-transparent',
              },
              {
                icon: Rocket,
                title: 'Speed',
                desc: 'Sub-second load times. Instant task updates. No spinners, no waiting. NOVA is built on the idea that tools should never slow you down.',
                gradient: 'from-nova-indigo/20 to-transparent',
              },
              {
                icon: Eye,
                title: 'Transparency',
                desc: 'Every team member sees the same board. No hidden statuses, no buried updates. If it matters, it\'s visible.',
                gradient: 'from-nova-cyan/20 to-transparent',
              },
            ].map(({ icon: Icon, title, desc, gradient }, i) => (
              <div
                key={title}
                className={`relative glass-card rounded-2xl p-8 overflow-hidden animate-on-scroll animation-delay-${(i + 1) * 200}`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}
                />
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-nova-accent-light mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-nova-text-bright mb-3">
                  {title}
                </h3>
                <p className="text-nova-text-muted text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* THE STORY                                                        */}
      {/* ================================================================ */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center animate-on-scroll">
          <div className="glass-card rounded-2xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-nova-accent/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-nova-cyan/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-nova-gradient flex items-center justify-center mx-auto mb-6">
                <Target size={26} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-nova-text-bright mb-6">
                The Origin
              </h2>
              <p className="text-nova-text-muted leading-relaxed mb-4">
                NOVA was born out of frustration. We were a small dev team drowning in 
                enterprise project tools that needed their own project to set up. We 
                wanted something that just <em className="text-nova-accent-light not-italic font-medium">worked</em> — 
                open it, create a project, add tasks, and start shipping.
              </p>
              <p className="text-nova-text-muted leading-relaxed">
                So we built it. NOVA is what happens when developers design a tool 
                for themselves — fast, focused, and unapologetically simple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA                                                              */}
      {/* ================================================================ */}
      <section className="py-20 md:py-28 px-4">
        <div className="absolute inset-x-0 h-px bg-nova-gradient opacity-20" />
        <div className="max-w-3xl mx-auto text-center animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold text-nova-text-bright mb-6">
            Ready to try a better way?
          </h2>
          <p className="text-nova-text-muted mb-10">
            NOVA is free to get started. No credit card. No 14-day trial. Just sign up and go.
          </p>
          <Link
            to="/login"
            className="btn-nova text-lg inline-flex items-center gap-2 group !px-8 !py-4"
          >
            Start Building Now
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
