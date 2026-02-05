
const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 md:bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col justify-center">
        <div className="max-w-3xl pt-20">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium text-white leading-tight mb-6">
            AI-Enabled <br />
            Compliance for <br />
            Further Education
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
            Automate your regulatory requirements, Manage Ofsted,
            ESFA, Safeguarding, and GDPR in one intelligent
            platform.
          </p>

          <button className="bg-white text-[#1A1A1A] hover:bg-gray-100 transition-colors px-8 py-3 rounded-md font-semibold text-lg">
            Book a Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
