import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuthContext } from '../App';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUserAuth, setUsername, setWorkId } = useContext(UserAuthContext);
  const [user_id, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const API_URL = "https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/login";
    const payload = { user_id, password };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setUsername(user_id);
        setUserAuth(data.role);
        setWorkId(data.role === 'operator' ? data.worker_id : data.supplier_id);
        navigate(data.role === 'operator' ? '/dashboard' : '/receiving/create');
      } else {
        setLoginError(true);
      }
    } catch (error) {
      setLoginError(true);
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
        Welcome Back
      </h2>

      {loginError && (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-6 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">
              Login failed. Please check your credentials and try again.
            </p>
          </div>
        </div>
      )}

      {/* Card */}
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] px-8 py-10 space-y-6">
        {/* Input: User ID */}
        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            id="user_id"
            type="text"
            value={user_id}
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

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-lime-500 text-white font-semibold py-3 rounded-lg hover:bg-lime-600 transition duration-300 shadow-sm"
        >
          Log In
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm text-gray-500 pt-4">
          <button type="button" onClick={() => navigate('/signin')} className="hover:underline">Sign Up</button>
          <button type="button" onClick={() => navigate('/forgot-password')} className="hover:underline">Forgot Password?</button>
        </div>
      </form>
    </div>
  );
}
