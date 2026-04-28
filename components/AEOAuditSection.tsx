import React from 'react';
import { motion } from 'framer-motion';
import { Target, Search, Activity } from 'lucide-react';

const AEOAuditSection: React.FC = () => {
  const localSignalCheck = [
    'Multi-engine AEO scan (ChatGPT, Perplexity, Gemini, AI Overviews)',
    'Competitor answer report (who gets recommended & why)',
    'Answer-ready content plan with specific FAQ blocks',
    'Schema & structure checklist implementable in 2–4 weeks'
  ];

  const operatorMode = [
    'Everything in Local Signal Check',
    'Hands-on implementation guidance for content & dev teams',
    'Review and Loom feedback on your changes',
    '30-day follow-up re-scan of the same prompt set'
  ];

  return (
    <section id="aeo-audit" className="bg-black py-32 text-white overflow-hidden relative">
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="ambient-glow ambient-glow-red"
        style={{ top: '20%', right: '10%', width: '600px', height: '600px' }}
      />
      <div className="absolute inset-0 swiss-grid-subtle opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header Block */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 mb-20 border-b border-white/10 pb-16">
            <div>
              <span className="text-red-600 font-bold uppercase tracking-[0.3em] text-xs mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> AEO_SIGNAL_SCAN
              </span>
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                OWN THE<br />ANSWER BOX
              </h2>
            </div>
            <div className="flex items-end">
              <p className="text-gray-400 text-xl font-light leading-relaxed max-w-2xl text-justify border-l-2 border-red-600/50 pl-6 space-y-4">
                <span className="block text-white font-medium mb-4">
                  AI isn't just "search" anymore — it's where your next customers ask who they should hire.
                </span>
                Your buyers are already querying ChatGPT, Perplexity, and Gemini for "best HVAC company near me" and trusting the first answer. The AEO Audit shows you exactly how those systems see your brand today and what it takes to become the default recommendation.
                <br /><br />
                <span className="text-sm border border-white/10 p-4 block mt-4 bg-white/5 uppercase tracking-wider text-gray-300">
                  Most operators pair the <strong className="text-white">Workflow Audit</strong> with at least a <strong className="text-white">Local Signal Check</strong> so they're not just running better internally, but also showing up first when buyers ask AI who to hire.
                </span>
              </p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* TIER 1: Local Signal Check */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card-elevated p-10 group relative flex flex-col"
            >
              <div className="absolute top-0 right-0 text-[10px] px-3 py-1 font-mono text-gray-500 border-b border-l border-white/10 uppercase bg-white/5">
                TIER_01
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">Local Signal Check</h3>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black tracking-tighter text-red-600">$1,750</span>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest leading-tight">
                  FLAT AUDIT<br />+ ROADMAP
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
                Best if you already have a writer or dev who can implement a clear checklist and just need to know exactly what to ship.
              </p>

              <ul className="space-y-4 mb-8 flex-grow">
                {localSignalCheck.map((item, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-gray-300">
                    <Search className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white/5 border border-white/10 p-4 mt-auto">
                <p className="text-xs font-mono text-gray-300">
                  <span className="text-red-500 font-bold block mb-1">UPGRADE PATH:</span>
                  Already booked a Workflow Audit? Add a Local Signal Check for <strong className="text-white">$1,250</strong> as an upgrade.
                </p>
              </div>
            </motion.div>

            {/* TIER 2: Operator Mode */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="border-2 border-red-600 p-10 bg-gradient-to-br from-red-600/10 to-transparent group relative flex flex-col transform md:-translate-y-4 animate-pulse-glow"
            >
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-3 py-1 font-mono uppercase font-black tracking-widest">
                MAXIMUM_IMPACT
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">Operator Mode</h3>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black tracking-tighter text-red-600">$3,250</span>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest leading-tight">
                  AUDIT + IMPLEMENTATION<br />+ 30-DAY RE-SCAN
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-8 pb-8 border-b border-white/10">
                Serious about locking in AI visibility for your market? <strong className="text-white">Operator Mode</strong> is for owners who want to move from "we should fix this" to "it's already live" in a few weeks, not someday.
              </p>

              <ul className="space-y-4 mb-8 flex-grow">
                {operatorMode.map((item, idx) => (
                  <li key={idx} className="flex gap-4 text-sm text-gray-200 font-medium">
                    <Target className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white/5 border border-white/10 p-4 mt-auto">
                <p className="text-xs font-mono text-gray-300">
                  Best if you want us in your corner to review changes, keep your team unblocked, and verify you're actually gaining answer share.
                </p>
              </div>
            </motion.div>

          </div>

          <div className="flex justify-center mt-12">
            <a 
              href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-500 text-white font-black uppercase px-12 py-6 tracking-widest transition-all duration-300 btn-primary relative overflow-hidden"
            >
              Book AEO Audit →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AEOAuditSection;
