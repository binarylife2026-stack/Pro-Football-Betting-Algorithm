
import React from 'react';
import { MatchData, SportType } from '../types';

interface MatchInputFormProps {
  onSubmit: (data: MatchData) => void;
  isLoading: boolean;
}

const sports: SportType[] = ['Football', 'Cricket', 'Hockey', 'Basketball', 'Tennis', 'Table Tennis', 'Baseball'];

const MatchInputForm: React.FC<MatchInputFormProps> = ({ onSubmit, isLoading }) => {
  const [sport, setSport] = React.useState<SportType>('Football');
  const [homeTeam, setHomeTeam] = React.useState('');
  const [awayTeam, setAwayTeam] = React.useState('');
  const [context, setContext] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam) return;
    onSubmit({ 
      sport,
      homeTeamName: homeTeam, 
      awayTeamName: awayTeam,
      additionalContext: context 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <div className="relative inline-block w-full max-w-xs">
          <label className="absolute -top-2 left-4 px-2 bg-slate-900 text-amber-500 text-[10px] font-bold tracking-widest z-10 uppercase">Select Sport</label>
          <select 
            className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all appearance-none cursor-pointer"
            value={sport}
            onChange={(e) => setSport(e.target.value as SportType)}
          >
            {sports.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="w-full relative group">
          <label className="absolute -top-2 left-4 px-2 bg-slate-900 text-emerald-400 text-[10px] font-bold tracking-widest z-10 uppercase">Home / Team 1</label>
          <input
            type="text"
            className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl px-6 py-5 text-xl font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-700"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            placeholder="Team A"
            required
          />
        </div>

        <div className="text-2xl font-black text-slate-700 italic px-2">VS</div>

        <div className="w-full relative group">
          <label className="absolute -top-2 left-4 px-2 bg-slate-900 text-blue-400 text-[10px] font-bold tracking-widest z-10 uppercase">Away / Team 2</label>
          <input
            type="text"
            className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl px-6 py-5 text-xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-700"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            placeholder="Team B"
            required
          />
        </div>
      </div>

      <div className="relative">
        <label className="absolute -top-2 left-4 px-2 bg-slate-900 text-slate-500 text-[10px] font-bold tracking-widest z-10 uppercase">Extra Context (Injuries, Pitch, Weather)</label>
        <input
          type="text"
          className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-slate-600 outline-none transition-all"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Semifinals, key player questionable"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !homeTeam || !awayTeam}
        className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group ${
          isLoading 
            ? 'bg-slate-800 text-slate-500 cursor-wait' 
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
        }`}
      >
        <span className="relative z-10">{isLoading ? `ANALYZING ${sport.toUpperCase()}...` : `PREDICT ${sport.toUpperCase()} MATCH`}</span>
        {!isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        )}
      </button>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </form>
  );
};

export default MatchInputForm;
