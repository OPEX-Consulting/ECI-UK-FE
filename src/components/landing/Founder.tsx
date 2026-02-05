
const Founder = () => {
  return (
    <section className="w-full bg-[#054D35] text-white py-20">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-12">
        
        {/* Image Section */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-end">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white overflow-hidden shadow-xl shrink-0">
            <img 
              src="/founder.png" 
              alt="Funmi Seyifunmi Olatoye" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Section */}
        <div className="w-full md:w-2/3 text-center md:text-left">
          <h3 className="font-serif font-bold text-lg mb-2 text-white/90">
            Meet Our Founder
          </h3>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 leading-tight">
            Funmi Seyifunmi Olatoye (PhD, MSc, LLM, B.L, LLB, ACIS, ICA)
          </h2>
          <div className="bg-white/10 h-px w-20 mx-auto md:mx-0 mb-6"></div>
          <p className="text-gray-100 leading-relaxed text-sm md:text-base font-light">
            Dr. Funmi Olatoye is a recognized authority in governance and regulation with over 15 years of experience. 
            As a former Lecturer in Further and Prison Education, she witnessed firsthand the immense pressure faced by 
            DSLs and Quality Leads to maintain compliance without the right tools. Combining her deep legal expertise 
            with a passion for innovation, she founded ECI to transform regulatory management. Her mission is simple: 
            to replace administrative burden with intelligent automation and explainable AI, making institutions safer 
            and inspection-ready. Under her strategic leadership, ECI is positioned to become the UK's leading 
            compliance-intelligence solution. She continues to champion a culture where data protection and safeguarding 
            are seamless, empowering educational providers to move beyond box-ticking and focus entirely on learner success.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Founder;
