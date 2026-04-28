import React from 'react';
import { motion } from 'framer-motion';

const LeadMagnet: React.FC = () => {
  return (
    <section id="lead-magnet" className="bg-black py-14 text-white relative overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="ambient-glow ambient-glow-red"
        style={{ top: '50%', left: '50%', width: '500px', height: '500px', transform: 'translate(-50%, -50%)' }}
      />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="max-w-3xl mx-auto border border-white/10 p-8 sm:p-10 relative card-elevated"
        >
          <div className="absolute -top-3 left-8 bg-red-600 text-white font-black px-4 py-1.5 text-[10px] uppercase tracking-widest">
            Free_Resource
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase">NOT READY TO BOOK?</h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-light">
            <strong className="text-white">Get the free 47-Point Robot Work Audit Checklist</strong> — find every automation opportunity hiding in your workflows. Takes 15 minutes. No email required.
          </p>
          
          <a 
            href="/Robot-Work-Audit.pdf" 
            target="_blank"
            className="inline-block bg-red-600 hover:bg-red-500 text-white font-black uppercase px-10 py-5 tracking-widest transition-all duration-300 transform hover:-translate-y-1 btn-primary relative overflow-hidden"
          >
            Download the 47-Point PDF Checklist →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadMagnet;
