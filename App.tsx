
import React, { useState } from 'react';
import MatchInputForm from './components/MatchInputForm';
import { MatchData, GroundingSource } from './types';
import { analyzeMatch } from './services/geminiService';

const App: React.FC = () => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (data: MatchData) => {
    setLoading(true);
    setPrediction(null);
    setSources([]);
    setError(null);
    
    try {
      const result = await analyzeMatch(data);
      setPrediction(result.text);
      setSources(result.sources);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-16 text-center w-full">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Real-Time Data Grounding Active
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
          BET-THINK AI
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
          The ultimate match prediction engine. Just enter two teams and our algorithm crawls the web for the latest stats.
        </p>
      </header>

      <main className="w-full space-y-16">
        <section className="w-full">
          <MatchInputForm onSubmit={handlePredict} isLoading={loading} />
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-center font-bold">
            {error}
          </div>
        )}

        {loading && (
          <section className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-blue-500 border-b-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-black tracking-[0.3em] text-sm mb-2">SCANNING GLOBAL SPORTS DATA</p>
              <p className="text-slate-500 text-xs font-mono">Fetching latest injuries, form, and H2H...</p>
            </div>
          </section>
        )}

        {prediction && (
          <section id="results-section" className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3">
                <div className="p-0.5 rounded-3xl bg-gradient-to-br from-emerald-500/40 via-slate-800 to-blue-500/40 shadow-2xl">
                  <div className="bg-slate-900/95 rounded-[1.4rem] p-8 md:p-12 backdrop-blur-3xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-800 pb-8">
                      <h2 className="text-3xl font-black flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/></svg>
                        </div>
                        MATCH ANALYSIS
                      </h2>
                      <div className="text-slate-500 font-mono text-sm">
                        TIMESTAMP: {new Date().toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="prose prose-invert prose-emerald max-w-none">
                      <div className="whitespace-pre-wrap font-medium text-slate-300 leading-relaxed text-lg">
                        {prediction}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit">
                  <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Verified Sources
                  </h3>
                  <div className="space-y-3">
                    {sources.length > 0 ? sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block group bg-slate-800/40 hover:bg-slate-800 p-3 rounded-xl border border-transparent hover:border-emerald-500/30 transition-all"
                      >
                        <p className="text-sm font-bold text-slate-300 group-hover:text-emerald-400 line-clamp-1 mb-1">{source.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono line-clamp-1">{source.uri}</p>
                      </a>
                    )) : (
                      <p className="text-slate-600 text-xs italic">Model internal knowledge used.</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                  <h3 className="text-[10px] font-black text-blue-400 tracking-widest uppercase mb-2">Algorithm Note</h3>
                  <p className="text-slate-400 text-xs leading-relaxed italic">
                    This prediction is synthesized from real-time data using tactical logic weights. Always verify with official line-ups before kick-off.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-32 pb-12 w-full text-center border-t border-slate-900 pt-12">
        <div className="flex justify-center gap-6 mb-8 grayscale opacity-30">
          {/* Mock logos/badges for aesthetic */}
          <div className="text-xs font-black tracking-tighter">DATA GATHERER PRO</div>
          <div className="text-xs font-black tracking-tighter">TACTICAL ENGINE</div>
          <div className="text-xs font-black tracking-tighter">BET-THINK v2</div>
        </div>
        <p className="text-slate-600 text-xs uppercase tracking-widest">&copy; {new Date().getFullYear()} Advanced Betting Algorithm • Grounded in Real-Time Search</p>
      </footer>
    </div>
  );
};

export default App;
