
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-[#1A1A1A] text-white border-t border-gray-800">
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* ECI Compliance Column */}
          <div className="flex flex-col">
            <h4 className="font-serif font-bold text-xl mb-6">ECI Compliance</h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The UK's first AI-enabled regulatory intelligence platform. Replacing administrative burden with precision and peace of mind.
            </p>
          </div>

          {/* Platform Column */}
          <div className="flex flex-col">
            <h4 className="font-serif font-bold text-white mb-6 text-base">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/safeguarding" className="hover:text-white transition-colors">Safeguarding Dashboard</Link></li>
              <li><Link to="/gdpr" className="hover:text-white transition-colors">GDPR Automation</Link></li>
              <li><Link to="/ofsted" className="hover:text-white transition-colors">Ofsted Readiness</Link></li>
              <li><Link to="/pilot" className="hover:text-white transition-colors">Pilot Programme</Link></li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div className="flex flex-col">
            <h4 className="font-serif font-bold text-white mb-6 text-base">Legal & Trust</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/data-protection" className="hover:text-white transition-colors">Data Protection Statement</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Preferences</Link></li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="flex flex-col">
            <h4 className="font-serif font-bold text-white mb-6 text-base">Contact Us</h4>
            <p className="text-gray-400 text-sm">
              Inquiries: <a href="mailto:info@eci-compliance.co.uk" className="hover:text-white transition-colors">info@eci-compliance.co.uk</a>
            </p>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="w-full bg-[#111111] py-6 border-t border-gray-800/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Edusafe Compliance Intelligence. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
