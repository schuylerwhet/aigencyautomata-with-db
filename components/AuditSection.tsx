import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Zap } from 'lucide-react';

const AuditSection: React.FC = () => {
  const deliverables = [
    'Complete Workflow Audit',
    'ROI Projection Report',
    'Implementation Roadmap',
    '30-Day Post-Implementation Support'
  ];

  const guarantees = [
    { 
      title: 'Opportunity Guarantee', 
      description: "If we can't identify at least 20 hours/week of automation opportunity → we waive the audit requirements.",
      icon: <Zap className="w-6 h-6 text-red-600" />
    },
    { 
      title: 'Timeline Guarantee', 
      description: "If implementation takes longer than quoted → we maintain the deployment at our own expense.",
      icon: <Clock className="w-6 h-6 text-red-600" />
    },
    { 
      title: 'Results Guarantee', 
      description: "If your team doesn't save measurable time within 8 weeks of go-live → we continue optimization until benchmarks are met.",
      icon: <Shield className="w-6 h-6 text-red-600" />
    }
  ];


  return (
    <section id="audit" className="bg-white py-24 text-black overflow-hidden border-b border-gray-100">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <span className="text-red-600 font-bold uppercase tracking-widest text-xs mb-4 block">Transformation_Gateway</span>
            <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase">THE WORKFLOW AUDIT</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-light leading-relaxed">
              We map your processes, identify automation opportunities, and quantify potential ROI — before you commit to implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
            {/* Deliverables Table */}
            <div className="border border-gray-200 p-8 md:p-12 bg-gray-50/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 font-mono">Deliverables_Inventory</h3>
              <div className="space-y-6">
                {deliverables.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <span className="text-lg font-medium">{item}</span>
                    <span className="font-mono text-green-600">INCLUDED</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div className="space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 font-mono">Risk_Mitigation_Protocols</h3>
              {guarantees.map((g, idx) => (
                <div key={idx} className="flex group">
                  <div className="mr-6 transform group-hover:scale-110 transition-transform duration-300">
                    {g.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase mb-2 tracking-tight">{g.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{g.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <a 
              href="https://calendar.app.google/xUxvNAFCRzkpmkfX6" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-red-600 text-white font-black uppercase px-12 py-6 tracking-widest transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Book Your Workflow Audit →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuditSection;
