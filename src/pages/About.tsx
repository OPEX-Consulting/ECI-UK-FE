import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-24 px-6">
         <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90"></div>
            <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Education Background" 
                className="w-full h-full object-cover mix-blend-overlay opacity-20"
            />
         </div>
         <div className="relative container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6">Empowering Education with Integrity</h1>
            <p className="text-xl text-gray-300">
                We are dedicated to simplifying compliance for schools and colleges, ensuring a safe and high-quality learning environment for all.
            </p>
         </div>
      </div>

      {/* Mission & Vision */}
      <div className="flex-grow container mx-auto px-6 py-20 space-y-20">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl font-bold mb-6 text-slate-900">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                    To provide educational institutions with intelligent, intuitive tools that streamline regulatory compliance. We believe that by reducing the administrative burden, we empower educators to focus on what truly matters: teaching and inspiring the next generation.
                </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"  
                    alt="Teachers collaborating" 
                    className="w-full h-full object-cover"
                />
            </div>
         </div>

         <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
            <div className="md:order-2">
                <h2 className="text-3xl font-bold mb-6 text-slate-900">Our Vision</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                    A world where every school is a beacon of safety and excellence, effortlessly meeting the highest standards of governance and care through technology-driven solutions.
                </p>
            </div>
            <div className="md:order-1 rounded-lg overflow-hidden shadow-xl">
                <img 
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="School environment" 
                    className="w-full h-full object-cover"
                />
            </div>
         </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
