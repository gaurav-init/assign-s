import { Github, Clock, Radio, Terminal } from 'lucide-react';
import { StepIndicator } from '../ui/StepIndicator.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

export function AppShell({ step, onOpenHistory, children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Static skeuomorphic background — retints across themes */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-50 dark:bg-ink-950">
        <div
          className="absolute inset-x-0 top-0 h-[380px] opacity-70 dark:opacity-55"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 0%, rgba(82,17,17,0.10), transparent 70%)',
          }}
        />
        <div className="dark:hidden absolute inset-x-0 top-0 h-[380px]"
             style={{
               background:
                 'radial-gradient(60% 60% at 50% 0%, rgba(255,185,0,0.14), transparent 70%)',
             }} />
        <div className="absolute inset-0 bg-dots" />
        <div className="noise absolute inset-0 opacity-[0.08] mix-blend-overlay dark:opacity-[0.12]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-ink-200/80 bg-white/80 backdrop-blur-md dark:border-ink-700/60 dark:bg-ink-950/85">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#" className="group flex items-center gap-3">
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-control text-ink-950 transition-transform group-hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(180deg, #ffd04a 0%, #ffb900 55%, #d99a00 100%)',
                boxShadow:
                  'inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -1px 0 0 rgba(0,0,0,0.35), 0 4px 16px -4px rgba(255,185,0,0.4)',
              }}
            >
              <Terminal className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2 font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-ink-900 dark:text-white">
                GrowEasy
               
              </div>
           
            </div>
          </a>

          <div className="hidden md:block">
            <StepIndicator step={step} />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenHistory}
              className="btn-ghost inline-flex h-9 gap-1.5 px-3"
              type="button"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="View source"
              className="btn-ghost hidden h-9 gap-1.5 px-3 sm:inline-flex"
            >
              <Github className="h-4 w-4" />
              <span>Source</span>
            </a>
         
            <ThemeToggle />
          </div>
        </div>
        <div className="border-t border-ink-200/80 px-4 py-2 dark:border-ink-700/60 md:hidden">
          <StepIndicator step={step} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-2 sm:px-6">
        <div className="flex flex-col items-center gap-2 border-t border-ink-200/70 pt-4 dark:border-ink-700/60 sm:flex-row sm:justify-between">
          <div className="label flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-blip rounded-full bg-amber-500" />
            GrowEasy · Intern Assignment · v1.1
          </div>
          <div className="label">React 19 · Node 20 · Gemini 3.1 Flash-Lite</div>
        </div>
      </footer>
    </div>
  );
}
