import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-slate-50 py-20 px-6 border-b">
         <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 text-slate-900">Get in Touch</h1>
            <p className="text-xl text-gray-600">
                Have questions about our platform or want to schedule a personalized walkthrough? We'd love to hear from you.
            </p>
         </div>
      </div>

      {/* Contact Content */}
      <div className="flex-grow container mx-auto px-6 py-20">
         <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Send us a message</h2>
                <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" placeholder="Doe" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="jane@school.edu" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="How can we help?" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Tell us more..." className="min-h-[150px]" />
                    </div>

                    <Button className="w-full text-lg py-6">Send Message</Button>
                </form>
            </div>

            {/* Contact Details */}
            <div className="space-y-12">
                <div>
                    <h3 className="text-2xl font-bold mb-6 text-slate-900">Contact Information</h3>
                    <p className="text-gray-600 mb-8">
                        Our support team is available Monday through Friday, 9am to 5pm GMT.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Email</h4>
                                <p className="text-gray-600">hello@edusafe.co.uk</p>
                                <p className="text-gray-600">support@edusafe.co.uk</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Phone</h4>
                                <p className="text-gray-600">+44 (0) 20 1234 5678</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">Office</h4>
                                <p className="text-gray-600">
                                    71-75 Shelton Street<br />
                                    Covent Garden, London<br />
                                    WC2H 9JQ, United Kingdom
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Placeholder or Additional Info */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2">Looking for support?</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Visit our Help Center for guides, FAQs, and video tutorials.
                    </p>
                    <a href="#" className="text-blue-600 font-medium hover:underline text-sm">
                        Visit Help Center &rarr;
                    </a>
                </div>
            </div>

         </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
