import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';


export default function LandingPage() {
  const navigate = useNavigate();

  const roles = [
    { name: 'Supplier', href: '/supplier', image: '/supplier.jpg' },
    { name: 'Warehouse Operator', href: '/dashboard', image: '/warehouse.jpg' },
    { name: 'Customer', href: '/customer', image: '/customer.jpg', position: 'right' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#0f1f17] relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0f1f17] via-[#1b3d2c] to-[#28543c]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(144,255,144,0.05),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(0,255,128,0.04),transparent_35%)]" />

      <div className="relative isolate overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <img
              className="h-16 mb-8 opacity-90 drop-shadow-[0_0_30px_#a3e635] transition-opacity duration-300 hover:opacity-100"
              src="/brat-logo.png"
              alt="brat logo"
            />
            
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl mb-6 font-grotesk">
              Warehouse Dashboard Platform
            </h1>
            <p className="text-lg text-gray-300 pl-1 font-dm">
              Log In or Sign Up to continue
            </p>
            <div className="mt-6">
              <div className="inline-flex space-x-4">
                <a href="/login" className="font-dm rounded-full bg-lime-500/20 px-5 py-1 text-md font-semibold text-lime-400 ring-1 ring-inset ring-lime-400/30 shadow-md">
                  Log In
                </a>
                <a href="/signin" className="inline-flex items-center space-x-2 text-sm font-medium text-lime-200">
                  <text className='font-dm'>Sign Up</text>
                  <ChevronRightIcon className="w-5 h-5 text-lime-200" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
            {roles.map((role) => (
              <div
                key={role.name}
                // onClick={() => navigate(role.href)}
                className="relative w-full h-80 cursor-pointer overflow-hidden rounded-[30%_5%_30%_5%] shadow-xl group transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_25px_#a3e635]"
              >
                <img
                  src={role.image}
                  alt={role.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${role.position === 'right' ? 'object-[80%]' : ''}`}
                />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold drop-shadow-xl text-center px-4">
                    {role.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}