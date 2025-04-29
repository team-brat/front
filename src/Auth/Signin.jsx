import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // TODO: 회원가입 처리 로직 추가
    console.log('Signing up with:', email, password);
    navigate('/dashboard'); // 회원가입 성공 후 이동할 페이지
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0f1f17] relative px-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0f1f17] via-[#1b3d2c] to-[#28543c]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(144,255,144,0.05),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(0,255,128,0.04),transparent_35%)]" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src="/brat-logo.png"
            alt="brat logo"
            className="h-16 opacity-90 drop-shadow-[0_0_30px_#a3e635] transition-opacity duration-300 hover:opacity-100"
          />
        </div>

        {/* Welcome Text */}
        <h2 className="text-center text-4xl font-bold text-white mb-8 font-grotesk">
          Create an Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSignUp} className="bg-black/30 rounded-2xl p-8 shadow-lg backdrop-blur-md">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-lime-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-lg bg-[#1b3d2c]/50 border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 p-3"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-lime-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-lg bg-[#1b3d2c]/50 border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 p-3"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-lime-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-lg bg-[#1b3d2c]/50 border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 p-3"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-500/20 text-lime-300 font-semibold py-3 rounded-lg hover:bg-lime-400/30 hover:text-white transition duration-300 shadow-md"
            >
              Sign Up
            </button>
          </div>

          {/* Links */}
          <div className="flex justify-center mt-6 text-sm text-gray-300">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:underline"
            >
              Already have an account? Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
