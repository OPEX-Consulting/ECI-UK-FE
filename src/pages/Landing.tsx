import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import AlignmentLogos from "@/components/landing/AlignmentLogos";
import ServicesSection from "@/components/landing/ServicesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import PerspectivesSection from "@/components/landing/PerspectivesSection";
import IncidentRiskSection from "@/components/landing/IncidentRiskSection";
import OutcomeMetrics from "@/components/landing/OutcomeMetrics";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <AlignmentLogos />
        <ServicesSection />
        <HowItWorks />
        <IncidentRiskSection />
        <OutcomeMetrics />
        <PerspectivesSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
