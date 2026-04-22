import React from 'react';

const testimonials = [
  {
    quote: "For the first time, our DSL isn't chasing paperwork the week before inspection. We actually know our safeguarding score every single day.",
    author: "Adewale Okafor",
    role: "Head Teacher",
    org: "Academy Trust",
    initials: "AO"
  },
  {
    quote: "The risk register changed how we work. We used to find out about risks when they became problems. Now we see them coming.",
    author: "Sarah Fletcher",
    role: "Compliance Officer",
    org: "FE College",
    initials: "SF"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background border-t border-border/50 transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-card text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
            • EARLY FEEDBACK
          </div>
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] text-foreground">
            What pilot schools are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="p-12 rounded-[32px] bg-card border border-border flex flex-col items-start relative hover:shadow-lg transition-all duration-300">
               {/* Quote Icon */}
               <div className="text-[520px] font-serif text-primary/10 leading-none mb-4 h-8 select-none absolute top-8 left-8">
                 “
               </div>
               
               <p className="text-[15px] md:text-[17px] font-serif text-foreground leading-relaxed mb-12 relative z-10 pt-4">
                 {t.quote}
               </p>
               
               <div className="flex items-center gap-4 mt-auto">
                 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-[12px] font-bold text-primary-foreground tracking-wider shadow-md">
                   {t.initials}
                 </div>
                 <div className="flex flex-col">
                   <div className="text-[14px] font-bold text-foreground">
                     {t.author}, <span className="font-medium text-muted-foreground">{t.role}</span>
                   </div>
                   <div className="text-[12px] text-muted-foreground">
                     {t.org} • pilot participant
                   </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
