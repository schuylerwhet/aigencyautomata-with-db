import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Solutions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OWNER' | 'SALES' | 'OPERATIONS'>('OWNER');

  const content = {
    OWNER: {
      title: 'Get your weekends back. Keep your margins.',
      description: "You're working 60-hour weeks because every new client means more admin overhead. Intake forms, data entry, initial setup — your profit margins shrink as headcount grows. You're building a bigger company, not a more profitable one.",
      body: "We automate client onboarding, reporting, and follow-ups so you scale clients without scaling hours. Your business runs whether you're in it or not.",
      proof: "80% of client onboarding automated in 6 weeks. Same team now handles 2.3x the clients. 32% admin time reduction — that's 11 hours/week redirected from robot work to revenue-generating activity.",
      points: [
        'Automated Client Onboarding',
        'Headcount-Independent Scaling',
        'Margin Protection Systems',
        'Executive Capacity Recovery'
      ]
    },
    SALES: {
      title: 'Scale pipeline without scaling headcount.',
      description: "Your SDRs spend 15 hours/week on Salesforce admin instead of selling. Data entry. Generic follow-ups. Lead research that doesn't scale. Personalized outreach is impossible when reps are buried in CRM maintenance.",
      body: "Our custom AI agents handle data entry, follow-up sequences, and lead scoring automatically. Your reps focus on the conversations that close deals — same team, 40% more pipeline.",
      proof: "Reply rates jumped from 8% to 17% (2.1x increase). 40% time savings on CRM admin. Reps finally had bandwidth for the personalization that actually matters. Same headcount, 40% more meetings booked.",
      points: [
        'Automated Sequence Management',
        'CRM Admin Elimination',
        'Lead Scoring & Research AI',
        '40% Increase in Pipeline'
      ]
    },
    OPERATIONS: {
      title: 'Cut inefficiencies. Free your team.',
      description: "Three critical workflows with manual handoffs at every stage. Average cycle time: 8.5 days. Error rate: 12%. Your team spends 25% of their time fixing mistakes and chasing updates instead of improving processes.",
      body: "We automate the workflows that drain capacity — smart handoffs, error checking, real-time visibility. Your team stops firefighting and starts optimizing.",
      proof: "Cycle time dropped from 8.5 to 6.1 days (28% reduction). Error rate fell from 12% to under 2%. Three workflows automated in 8 weeks. Team shifted from maintenance mode to continuous improvement.",
      points: [
        'Handoff Automation',
        'Error Rate Reduction (<2%)',
        'Cycle Time Optimization',
        'Workflow Visibility Engines'
      ]
    }
  };

  return (
    <section id="solutions" className="bg-black py-20 relative overflow-hidden">
      {/* Section divider at top */}
      <div className="section-divider absolute top-0 left-0 right-0"></div>
      
      <div className="absolute inset-0 swiss-grid-subtle opacity-10 pointer-events-none"></div>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 relative z-10"
      >
        {/* Section header */}
        <div className="mb-16">
          <span className="text-red-600 font-bold tracking-[0.3em] uppercase mb-6 block text-xs">Solution_Profiles</span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-8">
            YOUR ROLE.<br />YOUR FIX.
          </h2>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-16 scrollbar-hide snap-x space-x-4">
          {(['OWNER', 'SALES', 'OPERATIONS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-none snap-center px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] border transition-all duration-500 whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-red-600 border-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]' 
                  : 'bg-transparent border-white/10 text-gray-500 hover:border-white/40 hover:text-white'
              }`}
            >
              [ {tab} ]
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start"
          >
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Strategy_Profile</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">{content[activeTab].title}</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 italic border-l-2 border-white/10 pl-6">{content[activeTab].description}</p>
              <p className="text-white text-lg leading-relaxed mb-8">{content[activeTab].body}</p>
              
              <div className="card-elevated p-6 mb-8">
                <div className="flex items-start">
                  <span className="text-2xl mr-4">📊</span>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    <strong className="text-white">Result:</strong> {content[activeTab].proof}
                  </p>
                </div>
              </div>

              <a 
                href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold uppercase px-8 py-4 tracking-wider text-sm transition-all duration-300 btn-primary relative overflow-hidden"
              >
                Audit My Workflow →
              </a>
            </div>

            <div className="card-elevated p-8 md:p-12">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Capability_Matrix</p>
              <div className="space-y-6">
                {content[activeTab].points.map((point, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start group"
                  >
                    <span className="text-red-600 font-bold mr-4 text-sm group-hover:text-red-500 transition-colors">0{idx + 1}</span>
                    <span className="text-white font-medium text-lg">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default Solutions;