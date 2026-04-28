import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMarketingImage } from '../services/gemini';

const Visualizer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'RENDERING' | 'COMPLETE'>('IDLE');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setStatus('SYNCING');
    
    // Simulate steps for dramatic Swiss effect
    setTimeout(() => setStatus('RENDERING'), 1000);

    const imageUrl = await generateMarketingImage(prompt);
    
    if (imageUrl) {
      setGeneratedImage(imageUrl);
      setStatus('COMPLETE');
    } else {
      setStatus('IDLE');
    }
    setIsGenerating(false);
  };

  return (
    <section id="visualizer" className="bg-black py-32 border-b border-white/10 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-32"
          >
            <div className="flex items-center space-x-4 mb-8">
              <span className="w-12 h-px bg-red-600"></span>
              <span className="text-red-600 font-black text-xs uppercase tracking-[0.4em]">Creative_Engine_v1.0</span>
            </div>
            
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-12">
              VISION<br />LAB
            </h2>
            
            <p className="text-gray-400 text-lg font-light mb-12 max-w-md">
              Generate conceptual Swiss-design marketing assets for your business. Our AI engine translates your brand values into high-contrast grid-based visuals.
            </p>

            <div className="space-y-6 max-w-sm">
              <div className="relative">
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g. Scalable Neural Networks"
                  className="w-full bg-transparent border-b border-white/20 py-4 text-white outline-none focus:border-red-600 transition-colors font-mono text-sm uppercase tracking-wider"
                />
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Input_Concept</label>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-6 font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center space-x-4 group disabled:opacity-50"
              >
                <span>{isGenerating ? status : 'Generate_Asset'}</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>

            <div className="mt-12 pt-12 border-t border-white/10 grid grid-cols-2 gap-8 font-mono text-[9px] text-gray-700 uppercase tracking-widest">
              <div>
                <p className="mb-2">Resolution</p>
                <p className="text-gray-400">1024_px_Adaptive</p>
              </div>
              <div>
                <p className="mb-2">Style_Base</p>
                <p className="text-gray-400">Akzidenz_Minimalism</p>
              </div>
            </div>
          </motion.div>

          <div className="relative aspect-[3/4] bg-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 border-2 border-red-600 border-t-transparent animate-spin mb-8"></div>
                  <p className="text-xs font-black font-mono text-red-600 animate-pulse tracking-[0.5em]">{status}...</p>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full p-8 md:p-16 flex items-center justify-center"
                >
                  <div className="relative w-full h-full bg-black shadow-2xl overflow-hidden border border-white/5">
                    <img 
                      src={generatedImage} 
                      alt="Generated Swiss Poster" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end mix-blend-difference text-white">
                      <div className="font-black text-4xl tracking-tighter uppercase leading-none">
                        AIGENCY<br />LABS
                      </div>
                      <div className="font-mono text-[10px] tracking-widest opacity-60">
                        GEN_ID_{Math.floor(Math.random() * 90000 + 10000)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center p-12">
                   <div className="w-24 h-24 border border-white/5 mx-auto mb-8 flex items-center justify-center">
                     <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                   </div>
                   <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Awaiting_Neural_Input</p>
                </div>
              )}
            </AnimatePresence>

            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Visualizer;