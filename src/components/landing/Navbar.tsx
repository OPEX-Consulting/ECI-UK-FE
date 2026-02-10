import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-[#1A1A1A] text-white py-4 px-6 md:px-12 flex justify-between items-center fixed top-0 left-0 z-50">
      <div className="font-serif text-xl md:text-2xl font-bold tracking-tight">
        Edusafe Compliance Intelligence
      </div>
      <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
        <Link to="/" className="hover:text-gray-300 transition-colors uppercase">
          Home
        </Link>
        <Link to="/about" className="hover:text-gray-300 transition-colors uppercase">
          About
        </Link>
        <Link to="/services" className="hover:text-gray-300 transition-colors uppercase">
          Services
        </Link>
        <Link to="/contact" className="hover:text-gray-300 transition-colors uppercase">
          Contact
        </Link>
        <Link 
          to="/login" 
          className="hover:text-gray-300 transition-colors uppercase font-medium"
        >
          Login
        </Link>
        <Link 
          to="/onboarding/signup" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-sm font-bold uppercase ml-4 transition-colors"
        >
          Get Started
        </Link>
      </div>
      {/* Mobile Menu Button can be added here if needed */}
    </nav>
  );
};

export default Navbar;
