import React from 'react';
import { Crown, Settings2, Users2, Check } from 'lucide-react';

const perspectives = [
  {
    icon: Crown,
    tag: "STRATEGIC OVERSIGHT",
    title: "Principal / Head Teacher",
    description: "A bird's-eye view of compliance health across every framework — without drowning in detail.",
    features: [
      "Readiness score & trend",
      "Domain RAG risk view",
      "Framework oversight"
    ]
  },
  {
    icon: Settings2,
    tag: "OPERATIONAL CONTROL",
    title: "Compliance Officer / DSL / DPO",
    description: "The day-to-day command centre for every compliance, safeguarding, and data protection workflow.",
    features: [
      "Task board & assignment",
      "Safeguarding case management",
      "GDPR RoPA & DPIA workflow",
      "Incident pipeline"
    ]
  },
  {
    icon: Users2,
    tag: "CLEAR, SIMPLE ACTIONS",
    title: "Teachers / Admin Staff",
    description: "Just the tasks they need to do, with the evidence prompts and reporting tools to do them right.",
    features: [
      "My assigned tasks",
      "Evidence upload",
      "Incident reporting"
    ]
  }
];

const PerspectivesSection = () => {
  return (
    <section className="py-24 bg-[#FAF9F6] border-t border-border/50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-[#56605D] mb-6">
            • WHO ECI IS BUILT FOR
          </div>
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] text-foreground">
            One platform, <br />
            three perspectives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {perspectives.map((p, i) => (
            <div key={i} className="p-10 rounded-[32px] bg-white border border-border flex flex-col items-start hover:shadow-xl transition-all duration-300">
               <div className="w-12 h-12 rounded-full bg-[#1A3A2F] flex items-center justify-center mb-8">
                 <p.icon className="w-5 h-5 text-white" />
               </div>
               
               <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                 {p.tag}
               </div>
               
               <h3 className="font-serif text-[24px] font-semibold text-foreground mb-4">
                 {p.title}
               </h3>
               
               <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                 {p.description}
               </p>
               
               <div className="mt-auto w-full pt-8 border-t border-border/50">
                 <ul className="space-y-4">
                   {p.features.map((feature, idx) => (
                     <li key={idx} className="flex items-center gap-3 text-[14px] text-foreground/80 font-medium font-serif">
                       <Check className="w-4 h-4 text-[#2D6A4F]" />
                       {feature}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerspectivesSection;
