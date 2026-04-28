import React from 'react';
import { SERVICES } from '../constants';
import { motion } from 'framer-motion';

const Services: React.FC = () => {
  return (
    <section id="services" className="bg-black py-20 relative overflow-hidden">
      {/* Structural Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#030303] pointer-events-none border-l border-white/5"></div>
      <div className="absolute inset-0 swiss-grid-subtle opacity-15 pointer-events-none"></div>
      
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="ambient-glow ambient-glow-red"
        style={{ top: '50%', left: '30%', width: '800px', height: '800px', transform: 'translate(-50%, -50%)' }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-12">
            <div className="max-w-4xl">
              <span className="text-red-600 font-bold tracking-[0.3em] uppercase mb-6 block text-xs">Capability_Matrix_v2.5</span>
              <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                SYSTEMS<br />ARCHITECTURE
              </h2>
            </div>
           <div className="max-w-sm">
             <p className="text-gray-400 text-lg leading-relaxed font-light mb-8">
               We build modular AI infrastructures that scale your output while maintaining Swiss-precision operational standards.
             </p>
             <div className="h-px w-full bg-gradient-to-r from-red-600 to-transparent"></div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
          {SERVICES.map((service, index) => (
            <motion.div 
              key={service.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group border-r border-b border-white/10 p-12 hover:bg-red-600 transition-all duration-500 relative flex flex-col justify-between min-h-[420px]"
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                  <div className="w-12 h-12 flex items-center justify-center border border-white/20 group-hover:border-black/40 group-hover:bg-white transition-all duration-500">
                    <svg className="w-6 h-6 text-white group-hover:text-red-600 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                    </svg>
                  </div>
                  <span className="text-white/10 group-hover:text-black/10 text-4xl font-black transition-colors select-none">
                    {service.number}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-[10px] font-bold text-red-600 group-hover:text-white uppercase tracking-widest mb-2 block transition-colors duration-500">
                    {service.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-2xl font-black text-white group-hover:text-black leading-tight transition-colors duration-500">
                    {service.title}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-400 group-hover:text-white/90 text-sm leading-relaxed transition-colors duration-500">
                  {service.description}
                </p>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="text-black text-[10px] font-black uppercase tracking-widest">Deploy_Now</span>
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Services;