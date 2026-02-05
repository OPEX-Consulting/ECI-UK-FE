import { ArrowRight } from "lucide-react";

const services = [
  "Policy Automation",
  "Ofsted & ESFA Readiness",
  "GDPR & Audit Workflows",
  "Quality Assurance Mapping",
  "Cross-Regulation Intelligence",
  "Safeguarding (KCSIE) & Prevent Duty",
  "Single Central Record (SCR) Management",
];

const ServicesSection = () => {
  return (
    <section className="relative w-full bg-[#FAFAFA] py-20 overflow-hidden">
      {/* Background Graphic - Chevron/Arrow shape */}
      {/* This is a simplified CSS representation of the background graphic */}
      <div className="absolute top-0 left-1/4 w-96 h-full bg-white skew-x-12 opacity-50 z-0 pointer-events-none transform -translate-x-1/2" 
           style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)" }}></div>
      <div className="absolute top-0 left-1/3 w-64 h-full bg-white/40 skew-x-12 opacity-30 z-0 pointer-events-none transform -translate-x-1/2"></div>


      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-[#1A1A1A] text-2xl md:text-3xl font-serif font-bold tracking-wide uppercase mb-6">
            Intelligent Automation
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-4xl mx-auto">
            Empower your institution with AI-enabled predictive scoring and automated scoring and automated evidence mapping. 
            ECI integrates seamlessly with your operations, allowing you to focus on learner outcomes while we handle the 
            complexities of the regulatory landscape.
          </p>
        </div>

        {/* Services List */}
        <div className="max-w-lg mx-auto flex flex-col items-center">
          <h3 className="text-[#1A1A1A] text-xl font-serif font-bold mb-8">
            Our Services
          </h3>
          
          <div className="w-full flex flex-col gap-4">
            {services.map((service, index) => (
              <div 
                key={index}
                className="w-full bg-white border border-[#2D6A4F] text-[#1A1A1A] py-3 px-6 rounded-lg text-center font-medium shadow-sm hover:shadow-md transition-shadow cursor-default"
              >
                {service}
              </div>
            ))}
          </div>

          <button className="mt-10 bg-[#1A3C34] hover:bg-[#142e28] text-white py-3 px-8 rounded font-medium text-sm transition-colors shadow-lg">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
