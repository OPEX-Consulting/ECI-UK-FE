import React from 'react';
import { Check, Clock, ShieldCheck } from 'lucide-react';

const IncidentRiskSection = () => {
  return (
    <section className="py-24 bg-background border-t border-border/50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
            • INCIDENT & RISK MANAGEMENT
          </div>
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] text-foreground mb-6">
            From report to resolution <br />
            — nothing falls through
          </h2>
          <p className="text-[16px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            ECI tracks every incident and risk from the moment it's logged to the moment it's closed. 
            Every step is documented, every action is assigned, every resolution is evidenced.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Incident Reporting Card */}
          <div className="p-12 rounded-[32px] bg-secondary/40 border border-border flex flex-col transition-all duration-300 hover:shadow-xl group">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary mb-8 w-fit transition-colors">
              <Clock className="w-3.5 h-3.5" />
              INCIDENT REPORTING
            </div>
            <h3 className="font-serif text-[28px] md:text-[32px] font-medium leading-[1.2] mb-6 text-foreground">
              Log any incident in <br />
              under 2 minutes
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-10">
              Confidential, role-aware reporting flows that route the right concern to the right person — automatically.
            </p>
            <ul className="space-y-4 mt-auto">
              {[
                'Safeguarding & KCSIE concerns',
                'GDPR breach log with ICO decision tracking',
                'Prevent-related Channel referrals',
                'H&S incidents with RIDDOR flagging'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[14px] text-foreground/80 font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Check className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Management Card */}
          <div className="p-12 rounded-[32px] bg-secondary/40 border border-border flex flex-col transition-all duration-300 hover:shadow-xl group">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary mb-8 w-fit transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              RISK MANAGEMENT
            </div>
            <h3 className="font-serif text-[28px] md:text-[32px] font-medium leading-[1.2] mb-6 text-foreground">
              Identify, treat, and close risks <br />
              systematically
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-10">
              A live, RAG-scored risk register that's always current — with clear owners and evidenced resolutions.
            </p>
            <ul className="space-y-4 mt-auto">
              {[
                'Live RAG scoring per domain',
                'Configurable risk thresholds',
                'Treatment owner assignment',
                'Evidence-backed resolution'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[14px] text-foreground/80 font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Check className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IncidentRiskSection;
