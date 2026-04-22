import { 
  LayoutGrid, 
  FileText, 
  ShieldCheck, 
  GraduationCap, 
  AlertTriangle, 
  Network,
  ArrowRight
} from "lucide-react";

const capabilities = [
  {
    title: "Compliance Management",
    description: "A centralised dashboard for tracking all statutory requirements including KCSIE, GDPR, Health & Safety, Prevent Duty, ESFA Funding Rules — mapped automatically to your institution type.",
    footer: "13 frameworks built in",
    icon: LayoutGrid,
  },
  {
    title: "Policy & Document Control",
    description: "AI-assisted policy generation, version control, and automated review cycles. Every policy tracked with an owner, review date, and approval status. Staff acknowledge policies directly in the platform.",
    footer: "Version control • Acknowledgement tracking",
    icon: FileText,
  },
  {
    title: "Audit Readiness",
    description: "Be inspection-ready at any moment. Real-time audit trails, evidence lockers per action item, and gap analysis tools surface exactly what is missing before Ofsted, ISI, or ESFA auditors arrive.",
    footer: "Inspection readiness score • Live gap view",
    icon: ShieldCheck,
  },
  {
    title: "Staff Training & Governance",
    description: "Manage staff training records, Single Central Record (SCR) checks, and governor oversight modules. Alerts fire automatically when training is overdue or DBS checks are expiring.",
    footer: "SCR • Training currency • Governor oversight",
    icon: GraduationCap,
  },
  {
    title: "Incident Reporting",
    description: "Secure, confidential reporting for safeguarding concerns, accidents, GDPR breaches, and Prevent referrals — with automated workflows, role-based notifications, and full investigation tracking.",
    footer: "DSL • DPO • H&S • Channel referrals",
    icon: AlertTriangle,
  },
  {
    title: "Framework Integration",
    description: "Seamlessly aligned with Ofsted EIF, ISI, KCSIE, ESFA Funding Rules, and UK GDPR — automatically generating plain-language tasks whenever guidance is updated or a new framework is activated.",
    footer: "Ofsted • ISI • ESFA • KCSIE • GDPR",
    icon: Network,
  },
];

const ServicesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
            • WHAT ECI DOES
          </div>
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] text-foreground mb-8">
            Six capabilities.{" "}
            <span className="text-muted-foreground">
              One <br />
              compliance system.
            </span>
          </h2>
          <p className="text-[18px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Every essential workflow your school needs to stay compliant —
            unified in a single, intuitive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {capabilities.map((service, index) => (
            <div
              key={service.title}
              className="group relative flex flex-col justify-between rounded-[22px] border border-border bg-card p-8 pb-7 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-serif text-[22px] font-bold tracking-tight text-foreground">
                  {service.title}
                </h3>
                <p className="mb-8 text-[15px] leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  {service.footer}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="bg-secondary/40 border border-border rounded-3xl px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
          <p className="text-[14px] text-muted-foreground font-medium">
            All six capabilities are included from day one — no add-ons, no
            module fees.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-sm rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-sm">
              Get started free
            </button>
            <button className="text-sm rounded-full bg-background border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all">
              See pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
