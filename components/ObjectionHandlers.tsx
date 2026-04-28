import React from 'react';
import { motion } from 'framer-motion';

const ObjectionHandlers: React.FC = () => {
  const qna = [
    {
      q: "We've tried automation before. It broke.",
      a: "Because you were sold DIY tools that require you to become an automation engineer. We build it. We test it. We document it. We train your team. No Zapier flows held together with duct tape. 98% uptime because we build production-grade from day one."
    },
    {
      q: "We don't have time to implement this right now.",
      a: "You don't have time not to. Every week you delay is another 20–40 hours wasted on repetition. The audit takes 2–3 hours of your time. Implementation runs parallel to your normal operations. Break-even by week 8."
    },
    {
      q: "How are you different from others?",
      a: "Big 4 consultancies → strategy decks. DIY tools → you become the engineer. ChatGPT wrappers → generic templates. We ship working automation in 4–6 weeks. That's it. That's the difference."
    }
  ];

  return (
    <section className="bg-black py-24 text-white overflow-hidden border-b border-white/10">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-16">
            <span className="text-red-600 font-bold uppercase tracking-widest text-xs mb-4 block">Friction_Elimination</span>
            <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter uppercase">OBJECTION HANDLERS</h2>
          </div>

          <div className="space-y-12">
            {qna.map((item, idx) => (
              <div key={idx} className="border-l-2 border-red-600 pl-8 py-2 hover:bg-white/[0.02] transition-colors group">
                <h3 className="text-2xl font-black mb-4 tracking-tight text-white group-hover:text-red-600 transition-colors uppercase italic underline decoration-white/10 underline-offset-8">
                  "{item.q}"
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ObjectionHandlers;
