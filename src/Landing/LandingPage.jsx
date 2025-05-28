import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export default function LandingPage() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Log In or Sign Up to continue.';
  const [isTyping, setIsTyping] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timeout;
    if (isTyping && displayText === fullText) {
      timeout = setTimeout(() => {
        setDisplayText('');
        setTypingSpeed(150);
      }, 2000);
    } else if (!isTyping && displayText === '') {
      setIsTyping(true);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(
          isTyping
            ? fullText.substring(0, displayText.length + 1)
            : ''
        );
      }, typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, typingSpeed]);

  const roles = [
    { name: 'Supplier', href: '/supplier', image: '/supplier.jpg' },
    { name: 'Warehouse Operator', href: '/dashboard', image: '/warehouse.jpg' },
    { name: 'Customer', href: '/customer', image: '/customer.jpg', position: 'right' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">

        {/* Left Content */}
        <div className="max-w-xl mx-auto">
          <img
            className="h-12 mb-8 opacity-90 transition-opacity duration-300 hover:opacity-100"
            src="/brat-logo.png"
            alt="brat logo"
          />

          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Warehouse Dashboard Platform
          </h1>
          <p className="text-lg text-slate-600 mb-8 h-7">
            {displayText}
            <span className="animate-pulse">|</span>
          </p>

          <div className="flex space-x-4">
            <a
              href="/login"
              className="rounded-lg bg-lime-500 text-white px-6 py-2.5 text-md font-medium shadow-[0_4px_14px_rgba(132,204,22,0.3)] hover:from-emerald-600 hover:to-teal-600 hover:shadow-[0_4px_20px_rgba(132,204,22,0.4)] transition-all duration-300"
            >
              Log In
            </a>
            <a
              href="/signin"
              className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
            >
              Sign Up
              <ChevronRightIcon className="w-5 h-5 ml-1" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Right Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 lg:px-0">
          {roles.map((role) => (
            <div
              key={role.name}
              onClick={() => navigate(role.href)}
              className="relative w-full h-60 sm:h-72 cursor-pointer overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.08)] group transform transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
            >
              <img
                src={role.image}
                alt={role.name}
                className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${role.position === 'right' ? 'object-[80%]' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/60 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-xl sm:text-2xl font-semibold text-center px-4">
                  {role.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
