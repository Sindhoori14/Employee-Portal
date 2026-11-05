'use client';
import React from 'react';

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-white text-slate-800 antialiased overflow-x-hidden flex flex-col justify-between">
      {/* Gentle ambient background waves (Orange & Royal Blue) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Soft Royal Blue Ambient Glow */}
        <div
          className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-[#006ADA]/10 to-transparent blur-3xl animate-wave-1"
        />
        {/* Soft ElevateIQ Orange Ambient Glow */}
        <div
          className="absolute top-1/4 -right-28 h-[620px] w-[620px] rounded-full bg-gradient-to-bl from-[#F03D0A]/10 via-[#F03D0A]/5 to-transparent blur-3xl animate-wave-2"
        />
        {/* Subtle geometric grid backdrop */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.035] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="elevate-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0B2447" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#elevate-grid)" />
        </svg>
      </div>

      {/* Main Grid: Left Section (Branding & Intro) + Right Section (Login Experience) */}
      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-10 lg:grid-cols-12 lg:gap-8 lg:px-12 xl:px-16">
        {/* LEFT SECTION – BRANDING AND INTRODUCTION (7 Cols) */}
        <section className="flex flex-col justify-center lg:col-span-7 xl:col-span-7 lg:pr-6">
          {/* Logo container */}
          <div className="mb-6 flex items-center">
            <img
              src="/elevateiq-logo.png"
              alt="ElevateIQ Logo"
              className="h-12 w-auto object-contain sm:h-14 transition duration-300"
              style={{ maxHeight: '56px' }}
            />
          </div>

          {/* Product Label Badge */}
          <div className="mb-4 inline-flex w-fit items-center gap-2.5 rounded-full border border-blue-200/80 bg-blue-50/70 px-3.5 py-1 text-[11px] font-bold tracking-[0.18em] text-[#006ADA] shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#006ADA] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006ADA]" />
            </span>
            <span>ELEVATEIQ</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">EMPLOYEE PORTAL</span>
          </div>

          {/* Original Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B2447] sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            Work smarter.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F03D0A] via-[#E03405] to-[#006ADA]">
              Grow together.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg leading-relaxed">
            Your workspace to collaborate, manage responsibilities and stay ahead of your goals.
          </p>

          {/* Four Concise Feature Highlights in a Clean Grid */}
          <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Feature 1: Seamless Team Collaboration */}
            <div className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-xs transition duration-200 hover:border-blue-300 hover:bg-white hover:shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#006ADA] transition group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0B2447]">Seamless Team Collaboration</h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-normal">Coordinated channels, structured updates and instant presence.</p>
              </div>
            </div>

            {/* Feature 2: Smart Task Management */}
            <div className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-xs transition duration-200 hover:border-orange-300 hover:bg-white hover:shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F03D0A] transition group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0B2447]">Smart Task Management</h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-normal">Clear review flows, milestone tracking and transparent ownership.</p>
              </div>
            </div>

            {/* Feature 3: Performance & Progress */}
            <div className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-xs transition duration-200 hover:border-blue-300 hover:bg-white hover:shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#006ADA] transition group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0B2447]">Performance & Progress</h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-normal">Live attendance, break reports and daily contribution streaks.</p>
              </div>
            </div>

            {/* Feature 4: Continuous Learning */}
            <div className="group flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-xs transition duration-200 hover:border-orange-300 hover:bg-white hover:shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F03D0A] transition group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0B2447]">Continuous Learning</h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-normal">Structured onboarding curricula, quizzes and skill evaluations.</p>
              </div>
            </div>
          </div>

          {/* Elegant Modern Workplace / Employee Dashboard Illustration */}
          <div className="mt-8 hidden lg:block">
            <div className="relative rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_18px_45px_rgba(11,36,71,0.08)] backdrop-blur-md animate-floaty">
              {/* Dashboard Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs font-semibold text-[#0B2447]">Workspace Overview · ElevateIQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    All Systems Operational
                  </span>
                </div>
              </div>

              {/* Dashboard Content Mock */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {/* Metric 1: Attendance */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Attendance</span>
                    <span className="text-[10px] font-semibold text-[#006ADA]">+2.4%</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#0B2447]">98.6%</span>
                    <span className="text-[10px] text-slate-400">on-time</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-[#006ADA]" style={{ width: '98.6%' }} />
                  </div>
                </div>

                {/* Metric 2: Active Tasks */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Milestones</span>
                    <span className="text-[10px] font-semibold text-[#F03D0A]">Sprint 42</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#0B2447]">18 / 20</span>
                    <span className="text-[10px] text-slate-400">reviewed</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-[#F03D0A]" style={{ width: '90%' }} />
                  </div>
                </div>

                {/* Metric 3: Team Activity */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Learning Track</span>
                    <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#0B2447]">Day 12</span>
                    <span className="text-[10px] text-slate-400">of 15</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              {/* Activity sparkline chart preview */}
              <div className="mt-3.5 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">EI</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F03D0A] text-[10px] font-bold text-white ring-2 ring-white">SK</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">AM</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0B2447]">Active Workspace Sync</p>
                    <p className="text-[10px] text-slate-400">Collaborating across teams in real-time</p>
                  </div>
                </div>
                <div className="h-6 w-28">
                  <svg className="h-full w-full" viewBox="0 0 100 24" fill="none">
                    <path
                      d="M 0 18 Q 20 6, 40 14 T 70 8 T 100 4"
                      stroke="#006ADA"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 18 Q 20 6, 40 14 T 70 8 T 100 4 L 100 24 L 0 24 Z"
                      fill="url(#spark-grad)"
                      opacity="0.15"
                    />
                    <defs>
                      <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#006ADA" />
                        <stop offset="100%" stopColor="#006ADA" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SECTION – LOGIN EXPERIENCE (5 Cols) */}
        <section className="flex w-full items-center justify-center lg:col-span-5 xl:col-span-5">
          <div className="w-full max-w-md animate-card-enter">
            {children}
          </div>
        </section>
      </main>

      {/* Enterprise Footer Note */}
      <footer className="relative z-10 border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 lg:px-12">
          <span>&copy; {new Date().getFullYear()} ElevateIQ Inc. All rights reserved.</span>
          <span className="flex items-center gap-1 text-slate-400">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
            Enterprise SSO &amp; TLS 1.3 Encrypted
          </span>
        </div>
      </footer>
    </div>
  );
}
