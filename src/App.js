import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Landing/LandingPage';
import LoginPage from './Auth/Login';
import SigninPage from './Auth/Signin';
import WarehouseDashboard from './Dashboard/Dashboard';

import ReceivingTemplate from './Receiving/ReceivingTemplate'
import CreateReceiving from './Receiving/CreateReceiving';
import ReceivingRecords from './Receiving/ReceivingRecords';
import SupplierDetail from './Receiving/SupplierDetail';
import DocVerification from './Receiving/DocumentVerification';
import ReceivingStatus from './Receiving/ReceivingStatus';

import TQTemplate from './TQ/TQTemplate';
import InspectionRequest from './TQ/InspectionRequest';

// Create a context for user authentication
export const UserAuthContext = createContext();

function App() {
  const [userAuth, setUserAuth] = useState(null); // State to hold user authentication info
  const [username, setUsername] = useState(''); // State to hold username

  return (
    <UserAuthContext.Provider value={{ userAuth, setUserAuth, username, setUsername }}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/supplier" element={<div>Supplier Dashboard</div>} />
          <Route path="/dashboard" element={<WarehouseDashboard />} />
          <Route path="/customer" element={<div>Customer Dashboard</div>} />
          <Route path="/receiving" element={<ReceivingTemplate />}>
            <Route path="create" element={<CreateReceiving />} />
            <Route path="records" element={<ReceivingRecords />} />
            <Route path="supplier" element={<SupplierDetail />} />
            <Route path="documents" element={<DocVerification />} />
            <Route path="status" element={<ReceivingStatus />} />
          </Route>
          <Route path="/tq" element={<TQTemplate />}>
            <Route path="inspection-request" element={<InspectionRequest />} />
          </Route>
        </Routes>
      </Router>
    </UserAuthContext.Provider>
  );
}

export default App;