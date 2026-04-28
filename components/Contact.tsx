import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blink } from '../src/lib/blink';
import { useAuth } from '../src/hooks/useAuth';
import { sendLeadNotification, syncLeadToCRM } from '../services/email';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    bottleneck: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);

  useEffect(() => {
    const handleAiLead = async (event: any) => {
      const { name, email, company, bottleneck } = event.detail;
      
      setIsAiSubmitting(true);
      setFormData({
        name: name || '',
        email: email || '',
        company: company || '',
        bottleneck: bottleneck || ''
      });

      try {
        const lead = {
          name: name || '',
          email: email || '',
          company: company || '',
          bottleneck: bottleneck || '',
          source: 'chatbot' as const
        };
        await syncLeadToCRM(lead);
        await sendLeadNotification(lead);
      } catch (err) {
        console.error('Lead automation failed (AI):', err);
      }

      setTimeout(() => {
        setIsSubmitted(true);
        setIsAiSubmitting(false);
      }, 1500);
    };

    window.addEventListener('aigency:lead_captured', handleAiLead);
    return () => window.removeEventListener('aigency:lead_captured', handleAiLead);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lead = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        bottleneck: formData.bottleneck,
        source: 'contact_form' as const
      };

      await blink.db.table('leads').create({
        userId: user?.id || null,
        ...lead
      });

      await syncLeadToCRM(lead);
      await sendLeadNotification(lead);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving lead from contact form:', error);
      setIsSubmitted(true);
    }
  };

  return (
    <section id="contact" className="bg-red-600 py-24 text-white overflow-hidden relative">
      <div className="absolute inset-0 swiss-grid-subtle opacity-10 pointer-events-none"></div>
      
      {/* Ambient depth */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-8 uppercase leading-[0.9]">
              STOP WASTING <br />YOUR TEAM ON <br /><span className="text-black">ROBOT WORK</span>
            </h2>
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="contact-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-xl font-medium max-w-lg mb-8 opacity-90">
                    Your competitors aren't waiting. Every week you delay is another week of wasted capacity.
                  </p>

                  <div className="mb-12">
                    <a 
                      href="https://calendar.app.google/xUxvNAFCRzkpmkfX6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-black hover:bg-white hover:text-red-600 text-white font-black uppercase px-8 py-4 tracking-widest transition-all duration-300 mb-4 text-xs relative overflow-hidden btn-primary"
                    >
                      Direct Booking: 30-min Audit →
                    </a>
                    <p className="text-xs uppercase tracking-widest opacity-60 font-mono">
                      Skip the queue and pick a slot now.
                    </p>
                  </div>
                  
                  <div className="space-y-4 text-sm font-bold uppercase tracking-wider">
                    <div className="flex">
                       <span className="w-24 opacity-60 font-mono text-xs">Channel</span>
                       <span>schuyler@aigencyautomata.com</span>
                    </div>
                    <div className="flex">
                       <span className="w-24 opacity-60 font-mono text-xs">Status</span>
                       <span className="flex items-center">
                         <span className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></span>
                         Accepting New Client Audits
                       </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black p-8 border-l-4 border-white inline-block"
                >
                  <span className="text-red-600 font-black font-mono text-xs uppercase tracking-widest block mb-4">SYSTEM_STATUS: CONFIRMED</span>
                  <h3 className="text-3xl font-black mb-4">AUDIT REQUESTED</h3>
                  <p className="text-gray-400 font-light text-sm max-w-xs uppercase tracking-wider">
                    Your transmission has been received. Expect a technical brief within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="contact-form"
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-6 max-w-lg relative" 
                  onSubmit={handleSubmit}
                >
                  {isAiSubmitting && (
                    <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[1px] z-20 flex items-center justify-center border-2 border-white/30">
                       <div className="bg-black px-4 py-2 text-[10px] font-black font-mono uppercase tracking-[0.3em] animate-pulse">
                         AI_SYNC_IN_PROGRESS...
                       </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-black uppercase tracking-widest mb-3 opacity-90">Name</label>
                    <input 
                      id="contact-name"
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your name" 
                      className="w-full bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 placeholder-white/30 transition-colors text-white font-medium" 
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-black uppercase tracking-widest mb-3 opacity-90">Email</label>
                    <input 
                      id="contact-email"
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Your email" 
                      className="w-full bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 placeholder-white/30 transition-colors text-white font-medium" 
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-company" className="block text-xs font-black uppercase tracking-widest mb-3 opacity-90">Company</label>
                    <input 
                      id="contact-company"
                      type="text" 
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Your company" 
                      className="w-full bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 placeholder-white/30 transition-colors text-white font-medium" 
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-bottleneck" className="block text-xs font-black uppercase tracking-widest mb-3 opacity-90">Biggest Bottleneck</label>
                    <textarea 
                      id="contact-bottleneck"
                      placeholder="What process eats the most time?" 
                      rows={3} 
                      value={formData.bottleneck}
                      onChange={(e) => setFormData({...formData, bottleneck: e.target.value})}
                      className="w-full bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 placeholder-white/30 transition-colors resize-none text-white font-medium"
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="bg-black hover:bg-white hover:text-red-600 text-white font-black uppercase px-12 py-5 tracking-[0.2em] transition-all duration-300 mt-4 text-xs border border-black group relative overflow-hidden btn-primary">
                    <span className="relative z-10 flex items-center">
                      Request Audit
                      <span className="inline-block ml-4 transform group-hover:translate-x-2 transition-transform">→</span>
                    </span>
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col justify-center items-center border border-white/20 bg-black/10 p-12 text-center"
                >
                  <div className="w-20 h-20 bg-white text-red-600 flex items-center justify-center mb-8">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight mb-2">Transmission Received</h4>
                  <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Aigency_Secure_Sync_v4.0_Complete</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      
      {/* Background Decorative Element — hidden on mobile to prevent overflow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-[0.03] hidden md:block overflow-hidden" aria-hidden="true">
        <span className="text-[30rem] font-black select-none tracking-tighter text-white">CONTACT</span>
      </div>
    </section>
  );
};

export default Contact;