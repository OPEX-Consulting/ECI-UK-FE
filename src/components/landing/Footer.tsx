import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-foreground text-background border-t border-white/10">
      <div className="container mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <h4 className="font-serif font-bold text-2xl text-white">ECI</h4>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The UK's first AI-enabled regulatory intelligence platform. Replacing administrative burden with precision and peace of mind for the education sector.
            </p>
          </div>

          {/* Platform Column */}
          <div className="flex flex-col">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link to="/safeguarding" className="hover:text-primary transition-colors">Safeguarding Dashboard</Link></li>
              <li><Link to="/gdpr" className="hover:text-primary transition-colors">GDPR Automation</Link></li>
              <li><Link to="/ofsted" className="hover:text-primary transition-colors">Ofsted Readiness</Link></li>
              <li><Link to="/pilot" className="hover:text-primary transition-colors">Pilot Programme</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Legal & Trust</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/data-protection" className="hover:text-primary transition-colors">Data Protection</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Preferences</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Contact</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              General Inquiries:<br />
              <a href="mailto:info@eci-compliance.co.uk" className="text-primary font-bold hover:underline transition-all">info@eci-compliance.co.uk</a>
            </p>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Edusafe Compliance Intelligence. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <Link to="/frameworks" className="hover:text-primary">Frameworks</Link>
            <Link to="/roles" className="hover:text-primary">Roles</Link>
            <Link to="/customers" className="hover:text-primary">Customers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
