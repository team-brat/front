import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Test from './Receiving/Test';

import TQTemplate from './TQ/TQTemplate';
import InspectionRecords from './TQ/InspectionRecords';
import Inspection from './TQ/Inspection';
import RFIDScan from './TQ/RFIDScan';
import GRN from './Receiving/GRN';

import BinningTemplate from './Binning/BinningTemplate';
import BinningRequest from './Binning/BinningRequest';
import BinRecommender from './Binning/BinRecommender';
import InventoryStatus from './Binning/InventoryStatus';
import InventoryChecking from './Binning/InventoryChecking';

import DispatchTemplate from './Dispatch/DispatchTemplate';
import DispatchRequests from './Dispatch/DispatchRequests';
import Picking from './Dispatch/Picking';
import Packing from './Dispatch/Packing';
import TrackDelivery from './Dispatch/TrackDelivery';

import ModalWarning from './components/Modals/Modal-Warning'; // Import the ModalWarning component

// Create a context for user authentication
export const UserAuthContext = createContext();

function RequireAuth({ children }) {
  const { userAuth } = React.useContext(UserAuthContext);
  const location = useLocation();

  if (!userAuth && !['/', '/login', '/signin'].includes(location.pathname)) {
    return <ModalWarning message="Login Required" />; // Use ModalWarning instead of alert
  }

  return children;
}

function App() {
  const [userAuth, setUserAuth] = useState(null); // State to hold user authentication info
  const [username, setUsername] = useState(''); // State to hold username
  const [userRoleId, setUserRoleId] = useState(''); // State to hold userRoleId
  const [workId, setWorkId] = useState(''); // State to hold workId

  return (
    <UserAuthContext.Provider value={{ userAuth, setUserAuth, username, setUsername, workId, setWorkId }}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/supplier" element={<RequireAuth><div>Supplier Dashboard</div></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><WarehouseDashboard /></RequireAuth>} />
          <Route path="/customer" element={<RequireAuth><div>Customer Dashboard</div></RequireAuth>} />
          <Route path="/receiving" element={<RequireAuth><ReceivingTemplate /></RequireAuth>}>
            <Route path="create" element={<RequireAuth><CreateReceiving /></RequireAuth>} />
            <Route path="records" element={<RequireAuth><ReceivingRecords /></RequireAuth>} />
            <Route path="supplier" element={<RequireAuth><SupplierDetail /></RequireAuth>} />
            <Route path="documents" element={<RequireAuth><DocVerification /></RequireAuth>} />
            <Route path="doc-test" element={<RequireAuth><Test /></RequireAuth>} />
            <Route path="status" element={<RequireAuth><ReceivingStatus /></RequireAuth>} />
          </Route>
          <Route path="/binning" element={<RequireAuth><BinningTemplate /></RequireAuth>}>
            <Route path="request" element={<RequireAuth><BinningRequest /></RequireAuth>} />
            <Route path="recommender" element={<RequireAuth><BinRecommender /></RequireAuth>} />
            <Route path="status" element={<RequireAuth><InventoryStatus /></RequireAuth>} />
            <Route path="checking" element={<RequireAuth><InventoryChecking /></RequireAuth>} />
          </Route>
          <Route path="/tq" element={<RequireAuth><TQTemplate /></RequireAuth>}>
            <Route path="inspection-request" element={<InspectionRecords />} />
            <Route path="inspection-records" element={<RequireAuth><InspectionRecords/></RequireAuth>} />
            <Route path="inspection" element={<RequireAuth><Inspection/></RequireAuth>} />
            <Route path="rfid-scan" element={<RequireAuth><div><RFIDScan /></div></RequireAuth>} />
            <Route path="grn" element={<RequireAuth><GRN /></RequireAuth>} />
          </Route>
          <Route path="/dispatch" element={<RequireAuth><DispatchTemplate /></RequireAuth>}>
            <Route index element={<Navigate to="/dispatch/requests" replace />} />
            <Route path="requests" element={<RequireAuth><DispatchRequests /></RequireAuth>} />
            <Route path="picking" element={<RequireAuth><Picking /></RequireAuth>} />
            <Route path="packing" element={<RequireAuth><Packing /></RequireAuth>} />
            <Route path="track" element={<RequireAuth><TrackDelivery /></RequireAuth>} />
          </Route>
        </Routes>
      </Router>
    </UserAuthContext.Provider>
  );
}

export default App;