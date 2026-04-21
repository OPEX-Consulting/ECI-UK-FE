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
          <h2 className="font-serif text-[38px] md:text-[44px] font-medium tracking-[-0.02em] leading-[1.1] text-black mb-8">
            Six capabilities.{" "}
            <span className="text-[#56605d]">
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
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="group flex flex-col p-10 rounded-[22px] border border-border bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#def1e0] flex items-center justify-center mb-8">
                <cap.icon className="w-6 h-6 text-[#2D6A4F]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 tracking-tight text-foreground font-serif">
                {cap.title}
              </h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-auto pb-8">
                {cap.description}
              </p>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <span className="text-[12px] font-medium text-muted-foreground tracking-tight">
                  {cap.footer}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Bar */}
        <div className="bg-[#FAF9F6] border rounded-3xl px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[14px] text-muted-foreground font-medium">
            All six capabilities are included from day one — no add-ons, no
            module fees.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-sm rounded-full bg-[#1A1A1A] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-all">
              Get started free
            </button>
            <button className="text-sm rounded-full bg-white border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all">
              See pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
