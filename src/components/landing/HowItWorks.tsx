import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Tell ECI about your school',
    description: 'Answer a short onboarding wizard. ECI classifies your institution and identifies every applicable framework automatically.',
  },
  {
    number: '02',
    title: 'Your compliance plan activates',
    description: 'ECI generates an expert-validated task plan mapped to each framework. Every task is plain-language, evidence-backed, and assigned to the right person.',
  },
  {
    number: '03',
    title: 'Your team works it daily',
    description: 'Compliance Officers manage the pipeline. Staff complete tasks and upload evidence. Incidents are logged and tracked. Risk scores update automatically.',
  },
  {
    number: '04',
    title: 'You\'re always inspection-ready',
    description: 'Your readiness score rises as work gets done. When Ofsted calls, you already know your score, your strengths, and exactly what needs attention.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
            • HOW IT WORKS
          </div>
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] text-foreground max-w-4xl mx-auto">
            From obligation to daily <br />
            practice in four steps
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Side: Steps */}
          <div className="lg:col-span-7 relative">
            {/* Vertical Line */}
            <div className="absolute left-[24px] top-4 bottom-4 w-px bg-border z-0" />

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-8 z-10">
                  <div className="flex-shrink-0 w-[48px] h-[48px] font-serif rounded-xl bg-white border border-border flex items-center justify-center text-[14px] font-bold text-[#2D6A4F] shadow-sm">
                    {step.number}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-[15px] font-serif font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className=" text-muted-foreground leading-relaxed text-sm max-w-xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Mock UI Card */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            <div className="bg-white rounded-[24px] border border-border shadow-2xl p-0 overflow-hidden animate-fade-in group">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Live Risk Register
                  </div>
                  <div className="text-[15px] font-serif font-semibold text-foreground">
                    Updated now
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>

              <div className="divide-y divide-border">
                {[
                  {
                    label: "Safer recruitment checks",
                    status: "HIGH",
                    color: "bg-red-100 text-red-600",
                    action: "Treat",
                  },
                  {
                    label: "Prevent training overdue",
                    status: "MEDIUM",
                    color: "bg-amber-100 text-amber-600",
                    action: "Assign",
                  },
                  {
                    label: "DPIA for MIS system",
                    status: "MEDIUM",
                    color: "bg-amber-100 text-amber-600",
                    action: "Review",
                  },
                  {
                    label: "Fire risk assessment",
                    status: "LOW",
                    color: "bg-green-100 text-green-600",
                    action: "View",
                  },
                  {
                    label: "Safeguarding policy review",
                    status: "LOW",
                    color: "bg-green-100 text-green-600",
                    action: "View",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="text-[14px] font-medium text-foreground">
                      {row.label}
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${row.color}`}
                      >
                        {row.status}
                      </span>
                      <span className="text-[13px] text-muted-foreground font-medium">
                        {row.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/20 flex items-center justify-between px-6">
                <div className="text-[12px] text-muted-foreground font-medium">
                  2 risks require immediate action
                </div>
                <button className="text-[13px] font-bold text-foreground flex items-center gap-1 group-hover:gap-2 transition-all">
                  Full register <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Decorative blob behind the card */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
