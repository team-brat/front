import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/common/Layout';
// import BinList from './components/bins/BinList';
// import BinDetail from './components/bins/BinDetail';
// import BinForm from './components/bins/BinForm';
import LandingPage from './components/LandingPage';
import WarehouseDashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/supplier" element={<div>Supplier Dashboard</div>} />
        <Route path="/warehouse" element={<WarehouseDashboard />} />
        <Route path="/customer" element={<div>Customer Dashboard</div>} />
      </Routes>
    </Router>
  );
}
// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           {/* 기본 경로 리다이렉트 */}
//           <Route path="/" element={<Navigate to="/bins" replace />} />
          
//           {/* 빈 관리 라우트 */}
//           <Route path="/bins" element={<BinList />} />
//           <Route path="/bins/new" element={<BinForm />} />
//           <Route path="/bins/:binId" element={<BinDetail />} />
//           <Route path="/bins/:binId/edit" element={<BinForm />} />
          
//           {/* 추후 문서 관리 라우트 추가 예정 */}
          
//           {/* 404 페이지 */}
//           <Route path="*" element={
//             <div className="text-center py-8">
//               <h2 className="text-2xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h2>
//               <p className="mb-4">요청하신 페이지가 존재하지 않습니다.</p>
//               <a href="/" className="text-blue-500 hover:underline">홈으로 돌아가기</a>
//             </div>
//           } />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

export default App;