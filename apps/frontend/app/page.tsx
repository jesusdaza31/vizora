'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, PieChart, Table2, Sparkles, ArrowRight, LayoutDashboard, Filter, Palette } from 'lucide-react';

function AnimatedWidget({ type, delay }: { type: 'bar' | 'line' | 'pie' | 'kpi'; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const base = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-700';
  const state = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  if (type === 'kpi') {
    return (
      <div className={`${base} ${state}`}>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50">
            <div className="h-4 w-4 rounded-full bg-teal-500" />
          </div>
          <p className="text-xs font-medium text-slate-600">Revenue</p>
        </div>
        <p className="text-2xl font-bold text-slate-900">$48,290</p>
        <p className="mt-1 text-xs font-semibold text-emerald-600">↑ 12.5%</p>
      </div>
    );
  }

  if (type === 'bar') {
    const bars = [40, 65, 45, 80, 55, 70];
    return (
      <div className={`${base} ${state}`}>
        <p className="mb-3 text-xs font-medium text-slate-600">Monthly Sales</p>
        <div className="flex items-end gap-2 h-20">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-teal-500 transition-all duration-500"
              style={{
                height: visible ? `${h}%` : '0%',
                transitionDelay: `${delay + i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={`${base} ${state}`}>
        <p className="mb-3 text-xs font-medium text-slate-600">Trend</p>
        <svg viewBox="0 0 200 60" className="w-full h-16">
          <polyline
            points="0,50 40,35 80,40 120,20 160,25 200,10"
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="300"
            strokeDashoffset={visible ? '0' : '300'}
            style={{ transition: 'stroke-dashoffset 1.5s ease', transitionDelay: `${delay}ms` }}
          />
        </svg>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className={`${base} ${state} flex flex-col items-center`}>
        <p className="mb-2 text-xs font-medium text-slate-600 self-start">Distribution</p>
        <svg viewBox="0 0 60 60" className="w-20 h-20">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#0d9488" strokeWidth="12"
            strokeDasharray={`${visible ? '110' : '0'} 150`}
            style={{ transition: 'stroke-dasharray 1s ease', transitionDelay: `${delay}ms` }}
            transform="rotate(-90 30 30)"
          />
          <circle cx="30" cy="30" r="24" fill="none" stroke="#14b8a6" strokeWidth="12"
            strokeDasharray={`${visible ? '50' : '0'} 150`}
            style={{ transition: 'stroke-dasharray 1s ease', transitionDelay: `${delay + 300}ms` }}
            transform="rotate(80 30 30)"
          />
        </svg>
      </div>
    );
  }

  return null;
}

function FeatureCard({ icon: Icon, title, description, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className={`transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
              <Sparkles className="h-4 w-4" />
              Dynamic Dashboard Builder
            </div>

            <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Build dashboards
              <span className="block text-teal-600">without code</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 leading-relaxed">
              Connect to your data, drag & drop widgets, and create interactive dashboards in minutes.
              Auto-generate from any database table or build manually.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/vizora/dashboards"
                className="group inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md hover:-translate-y-0.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Open Dashboards
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/vizora/dashboards/new"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" />
                Create New
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold text-teal-600 mb-2">LIVE PREVIEW</p>
            <h2 className="text-2xl font-bold text-slate-900">See it in action</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatedWidget type="kpi" delay={300} />
              <AnimatedWidget type="bar" delay={500} />
              <AnimatedWidget type="line" delay={700} />
              <AnimatedWidget type="pie" delay={900} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Everything you need</h2>
            <p className="text-slate-600">Powerful features for building data-driven dashboards</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Sparkles}
              title="Auto-Generate"
              description="Select any database table and instantly get a complete dashboard with relevant charts and KPIs."
              delay={200}
            />
            <FeatureCard
              icon={BarChart3}
              title="6 Widget Types"
              description="Bar charts, line charts, pie charts, KPI cards, data tables, and text blocks — all customizable."
              delay={350}
            />
            <FeatureCard
              icon={Filter}
              title="Smart Filters"
              description="Add interactive filters that update all widgets in real-time. Dropdowns, ranges, dates, and more."
              delay={500}
            />
            <FeatureCard
              icon={LayoutDashboard}
              title="Drag & Drop"
              description="Arrange widgets freely on a responsive grid. Resize, reorder, and create multi-page dashboards."
              delay={650}
            />
            <FeatureCard
              icon={Palette}
              title="Theme System"
              description="Customize colors per dashboard. Light and dark palettes with consistent chart theming."
              delay={800}
            />
            <FeatureCard
              icon={Table2}
              title="SQL Server Ready"
              description="Connect to any SQL Server database. Query any table, aggregate data, and visualize instantly."
              delay={950}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50 p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to build?</h2>
            <p className="text-slate-600 mb-6">
              Create your first dashboard in under 2 minutes.
            </p>
            <Link
              href="/vizora/dashboards"
              className="group inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600">
        Vizora — Dynamic Dashboard Builder Platform
      </footer>
    </div>
  );
}
