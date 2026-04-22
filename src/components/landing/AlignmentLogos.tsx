import React from 'react';

const bodies = [
  { name: "Ofsted Aligned", color: "bg-blue-50 text-blue-700" },
  { name: "KCSIE Compliant", color: "bg-green-50 text-green-700" },
  { name: "ESFA Ready", color: "bg-amber-50 text-amber-700" },
  { name: "ICO Registered", color: "bg-slate-50 text-slate-700" },
  { name: "DfE Approved", color: "bg-indigo-50 text-indigo-700" },
];

const AlignmentLogos = () => {
  return (
    <section className="py-8 border-y border-border bg-secondary/30 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-8">
          <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-widest">
            Aligned with every standard that matters to UK education
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 ">
            {bodies.map((body) => (
              <div
                key={body.name}
                className={`px-4 py-2 rounded-full bg-white text-[#3c4240] text-sm font-semibold tracking-tighter border border-border/50 shadow-sm`}
              >
                {body.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlignmentLogos;
