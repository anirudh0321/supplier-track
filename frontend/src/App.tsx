import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SupplierList from './pages/SupplierList';
import SupplierDetail from './pages/SupplierDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SupplierList />} />
        <Route path="/supplier/:name" element={<SupplierDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
