import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              ECI
            </span>
          </Link>
          
          {/* <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-[15px] font-medium text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-[15px] font-medium text-foreground/80 hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#frameworks" className="text-[15px] font-medium text-foreground/80 hover:text-foreground transition-colors">
              Frameworks
            </a>
            <a href="#roles" className="text-[15px] font-medium text-foreground/80 hover:text-foreground transition-colors">
              Roles
            </a>
            <a href="#customers" className="text-[15px] font-medium text-foreground/80 hover:text-foreground transition-colors">
              Customers
            </a>
          </div> */}
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>
          <Link 
            to="/login" 
            className="hidden text-sm font-medium text-foreground/80 hover:text-foreground md:block transition-colors"
          >
            Sign in
          </Link>
          <Link 
            to="/onboarding/signup" 
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
