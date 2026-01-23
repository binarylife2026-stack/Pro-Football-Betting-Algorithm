
import React, { useState, useMemo } from 'react';
import MatchInputForm from './components/MatchInputForm';
import { MatchData, GroundingSource } from './types';
import { analyzeMatch } from './services/geminiService';

interface ParsedPrediction {
  category: string;
  prediction: string;
  confidence: number;
}

const PredictionCard: React.FC<{ data: ParsedPrediction }> = ({ data }) => {
  const getColors = (conf: number) => {
    if (conf >= 80) return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    if (conf >= 65) return 'from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-400';
    return 'from-slate-500/20 to-slate-500/5 border-slate-700 text-slate-400';
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br transition-all hover:scale-[1.03] hover:shadow-xl duration-300 ${getColors(data.confidence)}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{data.category}</span>
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono font-bold">{data.confidence}%</span>
          <span className="text-[8px] opacity-40 uppercase font-bold tracking-tighter">Confidence</span>
        </div>
      </div>
      <div className="text-xl font-black mb-4 tracking-tighter break-words min-h-[3rem] flex items-center">
        {data.prediction}
      </div>
      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
        <div 
          className="h-full bg-current transition-all duration-1000 ease-out" 
          style={{ width: `${data.confidence}%` }}
        ></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [predictionText, setPredictionText] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedPredictions = useMemo(() => {
    if (!predictionText) return [];
    const match = predictionText.match(/PREDICTIONS_START([\s\S]*?)PREDICTIONS_END/);
    if (!match) return [];
    
    return match[1].trim().split('\n').map(line => {
      // Expected format: Category: Prediction | Confidence: XX%
      const parts = line.split('|');
      const info = parts[0]?.split(':') || [];
      const confPart = parts[1]?.split(':') || [];
      
      const category = info[0]?.trim() || 'Analysis';
      const prediction = info.slice(1).join(':')?.trim() || 'No data';
      const confidence = parseInt(confPart[1]?.replace('%', '').trim()) || 50;

      return { category, prediction, confidence };
    }).filter(p => p.category && p.prediction);
  }, [predictionText]);

  const reasoningText = useMemo(() => {
    if (!predictionText) return '';
    return predictionText.split('PREDICTIONS_END')[1]?.trim() || predictionText;
  }, [predictionText]);

  const handlePredict = async (data: MatchData) => {
    setLoading(true);
    setPredictionText(null);
    setSources([]);
    setError(null);
    
    try {
      const result = await analyzeMatch(data);
      setPredictionText(result.text);
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
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="mb-12 text-center w-full">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ICC • NHL • NBA • ATP • MLB Multi-Engine
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-600">
          GLOBAL BET-THINK
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          The ultimate multi-sport prediction terminal. Real-time grounding across all major leagues for precision betting insights.
        </p>
      </header>

      <main className="w-full space-y-16">
        <section className="w-full">
          <MatchInputForm onSubmit={handlePredict} isLoading={loading} />
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-red-400 text-center font-bold animate-shake">
            {error}
          </div>
        )}

        {loading && (
          <section className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-4 border-slate-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-6 border-2 border-blue-500 border-b-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-slate-500 animate-pulse uppercase">Searching</span>
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-emerald-400 font-black tracking-[0.4em] text-sm uppercase">CRAWLING WORLDWIDE SPORTS REPOS</p>
              <p className="text-slate-600 text-xs font-mono max-w-md">Accessing player stats, weather models, and historical head-to-head outcomes...</p>
            </div>
          </section>
        )}

        {predictionText && (
          <section id="results-section" className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black flex items-center gap-3 tracking-widest uppercase">
                  <span className="text-emerald-500">/</span> Prediction Dashboard
                </h2>
                <div className="hidden md:flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-500/20 border border-slate-500/50"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {parsedPredictions.length > 0 ? (
                  parsedPredictions.map((pred, i) => <PredictionCard key={i} data={pred} />)
                ) : (
                  <div className="col-span-full p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-500 italic">
                    Parsing match details... Check reasoning below.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3">
                <div className="bg-slate-900/50 rounded-3xl p-8 md:p-12 border border-slate-800 backdrop-blur-3xl shadow-2xl">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-4 border-b border-slate-800 pb-4 uppercase tracking-widest text-slate-500">
                    Neural Intelligence Reasoning
                  </h3>
                  <div className="prose prose-invert prose-slate max-w-none">
                    <div className="whitespace-pre-wrap font-medium text-slate-400 leading-relaxed text-base">
                      {reasoningText}
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1 space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 h-fit shadow-lg">
                  <h3 className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Grounding Sources
                  </h3>
                  <div className="space-y-3">
                    {sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block group bg-slate-800/40 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 transition-all"
                      >
                        <p className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 line-clamp-2 leading-tight">{source.title}</p>
                        <div className="flex items-center gap-1 mt-2 text-[8px] text-slate-600 font-mono uppercase tracking-tighter">
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                          {new URL(source.uri).hostname}
                        </div>
                      </a>
                    ))}
                    {sources.length === 0 && <p className="text-[10px] text-slate-700 italic">Historical model data utilized.</p>}
                  </div>
                </div>

                <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Disclaimer</h3>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-relaxed italic">
                    Predictions are generated via real-time search-grounded AI. Odds are dynamic. Please cross-reference with final line-ups and expert pitch reports before placing wagers.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-32 pb-12 w-full text-center border-t border-slate-900 pt-12">
        <p className="text-slate-700 text-[9px] uppercase tracking-[0.6em] font-black">
          Neural Intelligence Betting Unit &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default App;
