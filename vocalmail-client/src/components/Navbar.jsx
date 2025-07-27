import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import FutureAddons from "./pages/FutureAddons";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";

const navLinks = [
  { label: "About", path: "/about" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Future Add-ons", path: "/future-addons" },
  { label: "Login", path: "/login" },
  { label: "Sign Up", path: "/signup" },
];

  return (
    <>
      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] shadow-md text-white px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-wide text-[#B8FFDD]">
            Vocal Mail
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className="hover:text-green-200 transition duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-[#1a2a33] rounded-lg py-3 px-5 space-y-3 shadow-lg text-sm z-50 relative">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-white hover:text-green-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer below fixed navbar */}
      <div className="h-16" />
    </>
  );
}
