import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-28 pb-20 bg-black overflow-hidden">
      {/* Background Layer: Swiss Grid */}
      <div className="absolute top-0 left-0 w-full h-full swiss-grid-lines opacity-10 pointer-events-none"></div>

      {/* Background Layer: Dual Atmospheric Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.04, 0.1, 0.04],
          scale: [1, 1.15, 1] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="ambient-glow ambient-glow-red"
        style={{ top: '30%', left: '20%', width: '900px', height: '900px' }}
      />
      <motion.div 
        animate={{ 
          opacity: [0.02, 0.05, 0.02],
          scale: [1, 1.2, 1] 
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 3 
        }}
        className="ambient-glow ambient-glow-white"
        style={{ bottom: '10%', right: '10%', width: '600px', height: '600px' }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-12">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h4 className="text-red-600 font-bold tracking-[0.4em] uppercase mb-6 text-xs flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-3 animate-pulse"></span>
                AI Automation & Digital Marketing
              </h4>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10">
                Your Business Is Great.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-white to-white/40">Your Systems Are Losing You Clients.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed font-light border-l-2 md:border-l border-red-600/60 pl-6 md:pl-8">
                Most small businesses lose 20–40% of their inbound leads to slow follow-up, missed calls, and pipelines that live in someone's inbox. We fix that — with AI automation and digital marketing built as one connected system.
              </p>
            </motion.div>
          </div>
          
          <div className="relative">
            {/* Concentric Pulses behind the AI Block */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.8], 
                  opacity: [0.3, 0] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  delay: i * 1.3,
                  ease: "easeOut" 
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-red-600/30 rounded-none z-0"
              />
            ))}

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:flex w-96 h-96 bg-red-600 items-center justify-center relative group overflow-hidden shadow-[0_0_120px_rgba(220,38,38,0.15)]"
            >
               <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></div>
               
               <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center"
               >
                 <span className="text-9xl font-black text-black group-hover:text-white transition-colors duration-500 select-none opacity-20 group-hover:opacity-100">AI</span>
                 <span className="absolute text-[10px] font-bold text-black group-hover:text-red-600 transition-colors bottom-12 uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100">
                    Neural_Core
                 </span>
               </motion.div>

               <span className="absolute z-10 text-9xl font-black text-white opacity-20 group-hover:opacity-0 transition-opacity duration-500 select-none">AI</span>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-8"
        >
          <div className="flex flex-wrap gap-6">
            <a 
              href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-red-600 hover:bg-white text-white hover:text-red-600 text-lg font-bold uppercase px-10 py-5 tracking-widest transition-all duration-500 relative overflow-hidden btn-primary"
            >
              <span className="relative z-10 flex items-center">
                → Book Your Free Audit
                <svg className="w-5 h-5 ml-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
            <a href="#how-it-works" className="group border border-white/20 hover:border-white text-white text-lg font-bold uppercase px-10 py-5 tracking-widest transition-all duration-500 hover:bg-white/5">
              See How It Works
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="pt-8 border-t border-white/10 max-w-xl"
          >
            <p className="text-sm text-gray-500 font-mono uppercase tracking-[0.2em]">
              Not ready to commit? <br />
              <a href="#lead-magnet" className="text-white hover:text-red-500 transition-colors font-bold mt-2 inline-block uppercase tracking-widest">
                Get the Free 47-Point Automation Checklist →
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Geometric Decorative element */}
      <div className="absolute bottom-20 right-20 text-[10px] font-mono text-gray-800 tracking-[1em] uppercase vertical-text hidden xl:block">
        Precision_Engineering // Human_Strategy
      </div>
    </section>
  );
};

export default Hero;