import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuthContext } from '../App';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

export default function SignInPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState(false);
  const { setWorkId, setUserAuth } = useContext(UserAuthContext);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSignupError(true);
      return;
    }

    try {
      const API_URL = "https://example.com/api/signup"; // Replace with actual signup API URL
      const payload = {
        user_id: userId,
        password: password
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setWorkId(data.worker_id);
        setUserAuth(data.role);
        if (data.role === 'manager') {
          navigate('/dashboard');
        } else if (data.role === 'operator') {
          navigate('/receiving/create');
        }
      } else {
        setSignupError(true);
      }
    } catch (error) {
      setSignupError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7f9] px-4">
      {/* Logo */}
      <div className="mb-6">
        <img
          src="/brat-logo.png"
          alt="brat logo"
          className="h-12 w-auto opacity-90 transition-opacity duration-300 hover:opacity-100"
        />
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 tracking-tight">
        Create an Account
      </h2>

      {signupError && (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-6 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">
              Signup failed. Please check your information and try again.
            </p>
          </div>
        </div>
      )}

      {/* Card */}
      <form onSubmit={handleSignUp} className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] px-8 py-10 space-y-6">
        {/* Input: User ID */}
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
            placeholder="Enter your user ID"
          />
        </div>

        {/* Input: Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
            placeholder="Enter your password"
          />
        </div>

        {/* Input: Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
            placeholder="Confirm your password"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-lime-500 text-white font-semibold py-3 rounded-lg hover:bg-lime-600 transition duration-300 shadow-sm"
        >
          Sign Up
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm text-gray-500 pt-4">
          <button type="button" onClick={() => navigate('/login')} className="hover:underline">Already have an account? Log In</button>
        </div>
      </form>
    </div>
  );
}