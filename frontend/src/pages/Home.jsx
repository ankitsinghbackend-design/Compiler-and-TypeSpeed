import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Keyboard, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const AdPlaceholder = ({ width = 'w-full', height = 'h-full', label = 'Advertisement' }) => (
  <div
    className={`${width} ${height} flex flex-col items-center justify-center rounded-xl border border-dashed border-cyan-500/25 bg-slate-950/40 backdrop-blur-[2px]`}
  >
    <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/70">AD</span>
    <span className="text-[9px] tracking-wide text-slate-500">{label}</span>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="dark relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#030712] font-sans text-slate-100 lg:min-h-screen">
      <style>{`
        @keyframes home-twinkle {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.9; }
        }
        @keyframes home-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .home-stars {
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.55), transparent),
            radial-gradient(1.5px 1.5px at 70% 15%, rgba(200,230,255,0.85), transparent),
            radial-gradient(1px 1px at 85% 40%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 15% 85%, rgba(180,220,255,0.6), transparent),
            radial-gradient(1.2px 1.2px at 60% 90%, rgba(255,255,255,0.45), transparent),
            radial-gradient(1px 1px at 92% 78%, rgba(255,255,255,0.4), transparent);
          background-size: 100% 100%;
          animation: home-twinkle 7s ease-in-out infinite;
        }
        .home-aurora {
          background:
            radial-gradient(ellipse 90% 55% at 50% -10%, rgba(139, 92, 246, 0.35), transparent 55%),
            radial-gradient(ellipse 70% 45% at 100% 30%, rgba(34, 211, 238, 0.12), transparent 50%),
            radial-gradient(ellipse 60% 40% at 0% 60%, rgba(99, 102, 241, 0.14), transparent 45%),
            linear-gradient(180deg, #020617 0%, #0b1220 38%, #030712 100%);
        }
      `}</style>

      {/* Space backdrop */}
      <div className="pointer-events-none absolute inset-0 home-aurora" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-screen home-stars"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-500/15 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.12)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,black,transparent)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col lg:min-h-screen">
        <div className="w-full px-4 pb-2 pt-4">
          <AdPlaceholder height="h-16" label="728×90 Leaderboard" />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1">
          <div className="hidden shrink-0 flex-col gap-4 p-3 lg:flex lg:w-40">
            <AdPlaceholder height="h-[600px]" label="160×600 Skyscraper" />
          </div>

          <div className="flex flex-1 flex-col items-center px-6 py-12">
            <div className="mb-10 mt-6 flex flex-col items-center space-y-4 text-center">
              <div
                className="relative mb-2 rounded-full border border-violet-500/30 bg-gradient-to-br from-violet-500/25 to-cyan-500/10 p-4 shadow-[0_0_40px_rgba(139,92,246,0.35)]"
                style={{ animation: 'home-float 5s ease-in-out infinite' }}
              >
                <Terminal className="relative z-[1] h-12 w-12 text-cyan-200" />
                <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-amber-200/90" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400/80">
                Mission control
              </p>
              <h1 className="bg-gradient-to-r from-slate-50 via-cyan-100 to-violet-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
                Developer Workspace
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-400">
                Choose between building and testing dynamic codebase execution, or honing your raw keyboard speed
                from orbit to terminal.
              </p>
            </div>

            <div className="mb-12 grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
              <Card
                className="group relative cursor-pointer border-cyan-500/20 bg-slate-950/55 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] backdrop-blur-md transition-all duration-300 hover:border-cyan-400/45 hover:shadow-[0_0_48px_rgba(34,211,238,0.12)]"
                onClick={() => navigate('/compiler')}
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-600/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <CardHeader className="relative flex flex-col items-center pb-4 text-center">
                  <div className="mb-4 rounded-full border border-cyan-500/25 bg-cyan-500/10 p-4 transition-colors group-hover:border-cyan-400/40 group-hover:bg-cyan-500/15">
                    <Code2 className="h-8 w-8 text-cyan-300" />
                  </div>
                  <CardTitle className="text-2xl text-slate-50">Online Compiler</CardTitle>
                  <CardDescription className="pt-2 text-sm leading-relaxed text-slate-400">
                    Standard lightning-fast compiler engine supporting 13 languages mapped seamlessly to cloud
                    execution environments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative mt-auto flex justify-center pb-8 pt-2">
                  <Button className="w-[80%] border border-cyan-500/30 bg-gradient-to-r from-cyan-600/90 to-violet-600/90 text-white shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-violet-500">
                    Launch Compiler
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="group relative cursor-pointer border-violet-500/25 bg-slate-950/55 shadow-[0_0_0_1px_rgba(139,92,246,0.1)] backdrop-blur-md transition-all duration-300 hover:border-violet-400/45 hover:shadow-[0_0_48px_rgba(139,92,246,0.15)]"
                onClick={() => navigate('/typespeed')}
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <CardHeader className="relative flex flex-col items-center pb-4 text-center">
                  <div className="mb-4 rounded-full border border-violet-500/30 bg-violet-500/10 p-4 transition-colors group-hover:border-violet-400/45 group-hover:bg-violet-500/15">
                    <Keyboard className="h-8 w-8 text-violet-200" />
                  </div>
                  <CardTitle className="text-2xl text-slate-50">TypeSpeed Tracker</CardTitle>
                  <CardDescription className="pt-2 text-sm leading-relaxed text-slate-400">
                    Enhance your typing velocity using real-time baseline tracking. Built seamlessly on the native
                    Typer tracker core.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative mt-auto flex justify-center pb-8 pt-2">
                  <Button
                    variant="outline"
                    className="w-[80%] border-cyan-400/40 bg-slate-950/40 text-cyan-100 hover:border-cyan-300 hover:bg-cyan-500/15 hover:text-white"
                  >
                    Start Typing
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="w-full max-w-3xl">
              <AdPlaceholder height="h-28" label="300×250 Medium Rectangle" />
            </div>
          </div>

          <div className="hidden shrink-0 flex-col gap-4 p-3 lg:flex lg:w-40">
            <AdPlaceholder height="h-[600px]" label="160×600 Skyscraper" />
          </div>
        </div>

        <div className="relative z-10 w-full px-4 pb-4 pt-2">
          <AdPlaceholder height="h-16" label="728×90 Leaderboard" />
        </div>
      </div>
    </div>
  );
};

export default Home;
