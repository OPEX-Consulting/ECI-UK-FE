import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { CheckCircle2, Shield, FileText, BarChart3, Users, Zap } from "lucide-react";

const services = [
    {
        icon: <Shield className="h-10 w-10 text-green-600" />,
        title: "Compliance Management",
        description: "Centralized dashboard for tracking all statutory requirements including KCSIE, GDPR, and Health & Safety."
    },
    {
        icon: <FileText className="h-10 w-10 text-blue-600" />,
        title: "Policy & Document Control",
        description: "AI-assisted policy generation, version control, and automated review cycles to keep your documentation up to date."
    },
    {
        icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
        title: "Audit Readiness",
        description: "Be inspection-ready at any moment with real-time audit trails, evidence lockers, and gap analysis tools."
    },
    {
        icon: <Users className="h-10 w-10 text-orange-600" />,
        title: "Staff Training & Governance",
        description: "Manage staff training records, single central record (SCR) checks, and governor oversight modules."
    },
    {
        icon: <Zap className="h-10 w-10 text-yellow-600" />,
        title: "Incident Reporting",
        description: "Secure, confidential reporting for safeguarding concerns, accidents, and data breaches with automated workflows."
    },
    {
        icon: <CheckCircle2 className="h-10 w-10 text-teal-600" />,
        title: "Framework Integration",
        description: "Seamlessly integrate with national frameworks like Ofsted and ISI, automatically generating tasks based on new guidance."
    },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-slate-50 py-24 px-6 border-b">
         <div className="container mx-auto text-center max-w-4xl">
            <span className="text-green-600 font-semibold tracking-wider text-sm uppercase mb-4 block">What We Offer</span>
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 text-slate-900">Comprehensive Solutions for Modern Schools</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Edusafe provides a suite of powerful tools designed to handle every aspect of educational compliance and governance.
            </p>
         </div>
      </div>

      {/* Services Grid */}
      <div className="flex-grow container mx-auto px-6 py-20">
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
                <div key={index} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="mb-6 p-4 rounded-full bg-slate-50 w-fit group-hover:bg-slate-100 transition-colors">
                        {service.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {service.description}
                    </p>
                </div>
            ))}
         </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-900 text-white py-20 px-6">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to streamline your compliance?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join hundreds of schools that trust Edusafe to keep them compliant and inspection-ready.
            </p>
            <button className="bg-white text-slate-900 hover:bg-gray-100 transition-colors px-8 py-3 rounded-md font-semibold text-lg">
                Get Started Today
            </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
