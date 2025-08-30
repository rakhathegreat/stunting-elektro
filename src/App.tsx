import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ParentManagement from './pages/ParentManagement';
import ParentDetail from './pages/ParentDetail';
import BabyManagement from './pages/BabyManagement';
import BabyDetail from './pages/BabyDetail';
import Layout from './components/Layout';
import ExaminationManagement from './pages/ExaminationManagement';
import { AuthContextProvider } from './context/AuthContext';
import { useUserAuth } from "./context/auth-context"
import { Toaster } from "sonner";

function AppRoutes() {
  const { session } = useUserAuth();

  // Jika belum login, tampilkan halaman login
  if (!session) {
    return <Login />;
  }

  // Jika sudah login, tampilkan dashboard & routes lain
  return (
    <div className="pb-10">
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/parents" element={<ParentManagement />} />
          <Route path="/parents/:id" element={<ParentDetail />} />
          <Route path="/babies" element={<BabyManagement />} />
          <Route path="/babies/:id" element={<BabyDetail />} />
          <Route path="/examination" element={<ExaminationManagement />} />
        </Routes>
      </Layout>
    </Router>
    </div>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <AppRoutes />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </AuthContextProvider>
  );
}
