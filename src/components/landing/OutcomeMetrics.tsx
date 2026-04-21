import React from 'react';

const metrics = [
  { 
    value: '5min', 
    description: 'Average time from sign-up to active compliance plan' 
  },
  { 
    value: '13+', 
    description: 'Compliance frameworks built in and ready to activate' 
  },
  { 
    value: '100%', 
    description: 'Evidence-backed task completion — no evidence, no done' 
  },
  { 
    value: '0x', 
    description: 'Runtime AI calls — deterministic, reliable, and auditable' 
  },
];

const OutcomeMetrics = () => {
  return (
    <section className="py-24 bg-[#0A1A14] text-white overflow-hidden relative">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#56605D] mb-6">
            RESULTS THAT MATTER
          </div>
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] max-w-2xl">
            Built for measurable outcomes <br />— not just dashboards.
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="lg:border-l lg:border-white/10 lg:pl-10"
            >
              <div className="text-[38px] md:text-[34px] font-serif font-medium mb-4 leading-none tracking-tight">
                {metric.value}
              </div>
              <p className="text-[14px] text-white/50  max-w-[240px]">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomeMetrics;
