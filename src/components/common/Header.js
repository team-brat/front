import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">WMS System</Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/bins" className="hover:text-blue-200">빈 관리</Link>
            </li>
            <li>
              <Link to="/documents" className="hover:text-blue-200">문서 관리</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;