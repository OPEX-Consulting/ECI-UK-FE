import { ArrowRight, ShieldCheck, PieChart, Bell } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative w-full pt-28 pb-14 overflow-hidden bg-background transition-colors duration-500">
      {/* Background patterns - Grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border mb-8 animate-fade-in shadow-sm transition-colors duration-300">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              UK Education Compliance Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[62px] md:text-[70px] font-medium tracking-[-0.025em] text-foreground leading-[1.05] mb-8">
            Make compliance a <br />
            <span className="italic text-[#2a583b]">daily practice</span> — not
            an <br />
            annual panic
          </h1>

          {/* Subtext */}
          <p className="text-[16px] md:text-[16px] text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            ECI gives schools and FE colleges a living compliance system —
            proactive task management, real-time risk visibility, and inspection
            readiness. Every day, not just before Ofsted calls.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            {/* <button className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2">
              Get started free <ArrowRight className="w-5 h-5" />
            </button> */}
            <button className="w-full sm:w-auto rounded-full bg-background border border-border px-8 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all">
              See a demo
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground mt-4">
            No credit card required · Setup in under 10 minutes · UK schools and
            FE colleges
          </p>

          {/* Dashboard Preview mockup area */}
          {/* <div className="relative w-full max-w-[1024px] rounded-[22px] border border-border bg-white shadow-2xl overflow-hidden animate-slide-up">
            <div className="aspect-[16/10] relative">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80"
                alt="ECI Compliance Dashboard"
                className="w-full h-full object-cover"
              />
           
              <div className="absolute top-10 left-10 p-5 rounded-2xl bg-white shadow-xl border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Overall Health
                  </div>
                  <div className="text-2xl font-bold">94.2%</div>
                </div>
              </div>

              <div className="absolute bottom-16 right-16 p-5 rounded-2xl bg-white shadow-xl border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Bell className="w-7 h-7 text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Active Alerts
                  </div>
                  <div className="text-2xl font-bold">3 Pending</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
