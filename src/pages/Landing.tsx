import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ServicesSection from "@/components/landing/ServicesSection";
import Founder from "@/components/landing/Founder";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ServicesSection />
      <Founder />
      <Footer />
    </div>
  );
};

export default Landing;
