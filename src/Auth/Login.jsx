import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuthContext } from '../App'; // Import the context
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUserAuth, setUsername, setWorkId } = useContext(UserAuthContext); // Corrected the context usage
  const [user_id, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Attempting to log in with:', user_id, password);

    const API_URL = "https://z0nql7r236.execute-api.us-east-2.amazonaws.com/dev/login";
    const payload = {
      user_id: user_id,
      password: password
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        console.log('Login successful! User role:', data.role);
        setUsername(user_id);
        setUserAuth(data.role);
        if (data.role === 'operator') {
          setWorkId(data.worker_id); // Corrected the function call
          console.log('Work ID:', data.worker_id);
        } else if (data.role === 'supplier') {
          setWorkId(data.supplier_id); // Corrected the function call
          console.log('Work ID:', data.supplier_id);
        }
        if (data.role === 'operator') {
          navigate('/dashboard');
        } else if (data.role === 'supplier') {
          navigate('/receiving/create');
        }
      } else {
        console.error('Login failed');
        setLoginError(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError(true);
    }
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
          Welcome Back
        </h2>

        {/* Error Alert */}
        {loginError && (
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-6">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Login failed. Please check your credentials and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-black/30 rounded-2xl p-8 shadow-lg backdrop-blur-md">
          <div className="space-y-6">
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-lime-300">
                User ID
              </label>
              <input
                id="user_id"
                type="text" // Changed from "email" to "text" to prevent "@" warning
                value={user_id}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="mt-2 w-full rounded-lg bg-[#1b3d2c]/50 border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-400 p-3"
                placeholder="Enter your user ID"
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

            <button
              type="submit"
              className="w-full bg-lime-500/20 text-lime-300 font-semibold py-3 rounded-lg hover:bg-lime-400/30 hover:text-white transition duration-300 shadow-md"
            >
              Log In
            </button>
          </div>

          {/* Links */}
          <div className="flex justify-between mt-6 text-sm text-gray-300">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="hover:underline"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
