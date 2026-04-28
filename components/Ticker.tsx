import React from 'react';

const Ticker: React.FC = () => {
  const items = [
    "12+ Hours Reclaimed Weekly",
    "3x Output Without New Hires",
    "Client Onboarding Automated",
    "Lead Qualification AI-Powered",
    "Revenue Operations Streamlined",
    "32% Average Admin Reduction",
    "Working Automation in 4–6 Weeks"
  ];

  return (
    <div className="bg-red-600 py-4 overflow-hidden relative z-20">
      <div className="whitespace-nowrap animate-ticker inline-block">
        {[...items, ...items, ...items].map((item, index) => (
          <span key={index} className="mx-8 text-white font-black uppercase tracking-wider text-sm md:text-base">
            {item} <span className="ml-8 opacity-50 text-black">//</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ticker;