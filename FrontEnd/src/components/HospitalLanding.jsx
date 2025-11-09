import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, MapPin, Mail, Phone, Printer, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalLanding = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const doctors = [
    {
      name: 'Dr. Boris Johnson',
      specialty: 'Plastic Surgeon',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop'
    },
    {
      name: 'Dr. Amelia Jones',
      specialty: 'Plastic Surgeon',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop'
    },
    {
      name: 'Dr. Ava Brown',
      specialty: 'Plastic Surgeon',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      //social: true
    },
    {
      name: 'Dr. Alexander Bell',
      specialty: 'Plastic Surgeon',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop'
    }
  ];

  const testimonials = [
    {
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      name: 'Sarah Johnson',
      profession: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      bg: 'bg-gray-100'
    },
    {
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      name: 'Emily Davis',
      profession: 'Teacher',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      bg: 'bg-amber-600'
    },
    {
      text: 'Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit.',
      name: 'Michael Chen',
      profession: 'Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      bg: 'bg-gray-100'
    }
  ];

  const services = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Radiology', 'Oncology', 'Dermatology', 'Emergency Care'];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-900">
            <Heart className="text-pink-600" fill="currentColor" />
            <span>Smart Health</span>
          </div>
          <div className="flex gap-4">
            <Link className="px-6 py-2 border-2 border-blue-900 text-blue-900 rounded-lg font-semibold hover:bg-blue-900 hover:text-white transition-all"
            to={"/signin"}>
              Login
            </Link>
            <Link className="px-6 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 hover:shadow-lg transition-all" to={"/signup"}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mt-20 bg-gradient-to-br from-blue-900 to-blue-950 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Smart Health</h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          Your comprehensive hospital management solution. Streamline operations, enhance patient care, and improve efficiency with our advanced system.
        </p>
        <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:shadow-xl">
          Get Started
        </button>
      </div>

      {/* Marquee Section */}
      <div className="bg-blue-50 py-6 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-blue-900 font-semibold text-lg">
          {[...services, ...services].map((service, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Doctors Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Meet Our Surgical Specialists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {doctors.map((doctor, idx) => (
            <div key={idx} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  {doctor.social && (
                    <div className="flex justify-center gap-3 mt-4">
                      <button className="w-10 h-10 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition-all">
                        <Twitter className="w-5 h-5 mx-auto" />
                      </button>
                      <button className="w-10 h-10 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition-all">
                        <Facebook className="w-5 h-5 mx-auto" />
                      </button>
                      <button className="w-10 h-10 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition-all">
                        <Instagram className="w-5 h-5 mx-auto" />
                      </button>
                      <button className="w-10 h-10 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition-all">
                        <Linkedin className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20 px-6">
        <p className="text-center text-amber-600 italic text-xl mb-2">Testimonial</p>
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">What Clients Say!</h2>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => {
              const position = (idx - currentTestimonial + testimonials.length) % testimonials.length;
              const isCenter = position === 1;
              
              return (
                <div 
                  key={idx}
                  className={`${testimonial.bg} ${isCenter ? 'md:scale-105 z-10' : 'md:scale-95'} transition-all duration-500 rounded-2xl p-8 shadow-xl ${isCenter ? 'text-white' : 'text-gray-800'}`}
                >
                  <div className="text-6xl font-serif mb-4">"</div>
                  <p className="mb-8 text-base leading-relaxed">{testimonial.text}</p>
                  <div className="flex flex-col items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full border-4 border-white mb-4 object-cover"
                    />
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-sm opacity-80">{testimonial.profession}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-4 mt-12">
            <button 
              onClick={prevTestimonial}
              className="w-12 h-12 bg-amber-600 text-white rounded hover:bg-amber-700 transition-all flex items-center justify-center"
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={nextTestimonial}
              className="w-12 h-12 bg-amber-600 text-white rounded hover:bg-amber-700 transition-all flex items-center justify-center"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-950 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-pink-500 text-2xl font-bold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>123 Street, New York, USA</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>info@example.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+012 345 67890</span>
              </div>
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 flex-shrink-0" />
                <span>+012 345 67890</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button className="hover:text-pink-500 transition-colors">
                <Facebook />
              </button>
              <button className="hover:text-pink-500 transition-colors">
                <Twitter />
              </button>
              <button className="hover:text-pink-500 transition-colors">
                <Instagram />
              </button>
              <button className="hover:text-pink-500 transition-colors">
                <Linkedin />
              </button>
            </div>
          </div>

          {/* Opening Time */}
          <div>
            <h3 className="text-pink-500 text-2xl font-bold mb-6">Opening Time</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400">Mon - Friday:</p>
                <p>09.00 am to 07.00 pm</p>
              </div>
              <div>
                <p className="text-gray-400">Satday:</p>
                <p>10.00 am to 05.00 pm</p>
              </div>
              <div>
                <p className="text-gray-400">Vacation:</p>
                <p>All Sunday is our vacation</p>
              </div>
            </div>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-pink-500 text-2xl font-bold mb-6">Our Services</h3>
            <ul className="space-y-2">
              <li className="hover:text-pink-500 cursor-pointer transition-colors">› Business</li>
              <li className="hover:text-pink-500 cursor-pointer transition-colors">› Evaluation</li>
              <li className="hover:text-pink-500 cursor-pointer transition-colors">› Migrate</li>
              <li className="hover:text-pink-500 cursor-pointer transition-colors">› Study</li>
              <li className="hover:text-pink-500 cursor-pointer transition-colors">› Counselling</li>
              <li className="hover:text-pink-500 cursor-pointer transition-colors">› Work / Career</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-pink-500 text-2xl font-bold mb-6">Newsletter</h3>
            <p className="mb-6 text-gray-300">
              Dolor amet sit justo amet elitr clita ipsum elitr est. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            {/* <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-full text-gray-800 focus:outline-none"
              />
              <button className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-r-full font-semibold transition-all">
                SignUp
              </button>
            </div> */}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 mt-12 pt-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© Your Site Name, All right reserved.</p>
            <p className="text-gray-400">
              Designed By <span className="text-pink-500 font-semibold">HTML Codex</span>
            </p>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <ChevronRight className="rotate-[-90deg]" />
        </button>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HospitalLanding;