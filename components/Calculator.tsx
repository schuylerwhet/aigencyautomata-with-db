import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../src/hooks/useAuth';
import { blink } from '../src/lib/blink';
import { toast } from 'react-hot-toast';

const Calculator: React.FC = () => {
  const { isAuthenticated, user, login } = useAuth();
  const [teamSize, setTeamSize] = useState(5);
  const [weeklyAdmin, setWeeklyAdmin] = useState(15);
  const [hourlyBurn, setHourlyBurn] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  const annualReclaimedValue = useMemo(() => {
    return teamSize * weeklyAdmin * hourlyBurn * 52;
  }, [teamSize, weeklyAdmin, hourlyBurn]);

  const weeklyCapacityUnlock = useMemo(() => {
    return teamSize * weeklyAdmin;
  }, [teamSize, weeklyAdmin]);

  const handleSaveResult = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setIsSaving(true);
    try {
      await blink.db.table('roi_calculations').create({
        user_id: user?.id,
        input_data: JSON.stringify({ teamSize, weeklyAdmin, hourlyBurn }),
        result: JSON.stringify({ annualReclaimedValue, weeklyCapacityUnlock })
      });
      toast.success('Calculation saved to your dashboard');
    } catch (error) {
      toast.error('Failed to save calculation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section id="roi" className="bg-black py-20 text-white overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 swiss-grid-subtle opacity-10 pointer-events-none"></div>
      <motion.div 
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="ambient-glow ambient-glow-red"
        style={{ bottom: '0', right: '20%', width: '700px', height: '700px' }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <span className="text-red-600 font-bold uppercase tracking-[0.3em] text-xs mb-6 block">Economic_Impact</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter uppercase transition-all duration-700 leading-[0.85]">PROFIT <br />FORECAST</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md font-light leading-relaxed">
              Calculate the tangible return on investment from automating your core business processes. Most teams see an immediate 30% reduction in admin load.
            </p>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em] mb-4">*Based on conservative 30% automation and verified industry benchmarks.</p>
            <p className="text-xs text-red-600/40 font-mono">V4.2 ROI_ENGINE_ACTIVE</p>
          </div>

          <div className="card-elevated p-8 sm:p-12 relative">
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-shimmer rounded-none pointer-events-none"></div>
            
            {/* Team Size */}
            <div className="mb-10 relative z-10">
              <div className="flex justify-between mb-3">
                <label htmlFor="range-team-size" className="text-xs font-bold uppercase tracking-widest text-gray-300">Team Size</label>
                <span className="text-xs font-mono text-gray-500">Headcount</span>
              </div>
              <input 
                id="range-team-size"
                type="range" 
                min="1" 
                max="50" 
                value={teamSize}
                aria-label="Team size"
                aria-valuemin={1}
                aria-valuemax={50}
                aria-valuenow={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
              />
              <div className="mt-3 text-right font-black text-4xl text-white" aria-live="polite">{teamSize}</div>
            </div>

            {/* Weekly Admin */}
            <div className="mb-10 relative z-10">
              <div className="flex justify-between mb-3">
                <label htmlFor="range-weekly-admin" className="text-xs font-bold uppercase tracking-widest text-gray-300">Weekly Admin (Per Person)</label>
                <span className="text-xs font-mono text-gray-500">Hours/Week</span>
              </div>
              <input 
                id="range-weekly-admin"
                type="range" 
                min="1" 
                max="40" 
                value={weeklyAdmin}
                aria-label="Weekly admin hours per person"
                aria-valuemin={1}
                aria-valuemax={40}
                aria-valuenow={weeklyAdmin}
                onChange={(e) => setWeeklyAdmin(Number(e.target.value))}
              />
               <div className="mt-3 text-right font-black text-4xl text-white" aria-live="polite">{weeklyAdmin}</div>
            </div>

            {/* Hourly Burn */}
            <div className="mb-12 relative z-10">
              <div className="flex justify-between mb-3">
                <label htmlFor="range-hourly-burn" className="text-xs font-bold uppercase tracking-widest text-gray-300">Avg Hourly Cost</label>
                <span className="text-xs font-mono text-gray-500">USD/Hour</span>
              </div>
              <input 
                id="range-hourly-burn"
                type="range" 
                min="10" 
                max="200" 
                value={hourlyBurn}
                aria-label="Average hourly cost in USD"
                aria-valuemin={10}
                aria-valuemax={200}
                aria-valuenow={hourlyBurn}
                onChange={(e) => setHourlyBurn(Number(e.target.value))}
              />
               <div className="mt-3 text-right font-black text-4xl text-white" aria-live="polite">${hourlyBurn}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-white/10 pt-8 relative z-10">
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Annual_Reclaimed_Value</span>
                <motion.span 
                  key={annualReclaimedValue}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600 tracking-tight block"
                >
                  ${annualReclaimedValue.toLocaleString()}
                </motion.span>
                <span className="block text-xs text-gray-600 mt-2 font-mono uppercase tracking-wider">Net_Efficiency</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Weekly_Capacity_Unlock</span>
                <motion.span 
                  key={weeklyCapacityUnlock}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight block"
                >
                  {weeklyCapacityUnlock} <span className="text-xl sm:text-2xl text-gray-400">Hrs</span>
                </motion.span>
                <span className="block text-xs text-gray-600 mt-2 font-mono uppercase tracking-wider">Human_Potential</span>
              </div>
            </div>

            <button
              onClick={handleSaveResult}
              disabled={isSaving}
              aria-busy={isSaving}
              aria-label="Save ROI forecast to dashboard"
              className="w-full mt-8 bg-red-600 hover:bg-red-500 text-white py-4 font-black uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 btn-primary relative z-10"
            >
              {isSaving ? 'SAVING_DATA...' : 'SAVE_ROI_FORECAST'}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Calculator;
