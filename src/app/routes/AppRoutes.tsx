import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../providers/auth-context';
import { FullScreenLoader } from '../../features/shared/components/FullScreenLoader';

const DashboardPage = lazy(() => import('../../pages/Dashboard'));
const ParentManagementPage = lazy(() => import('../../pages/ParentManagement'));
const ParentDetailPage = lazy(() => import('../../pages/ParentDetail'));
const BabyManagementPage = lazy(() => import('../../pages/BabyManagement'));
const BabyDetailPage = lazy(() => import('../../pages/BabyDetail'));
const ExaminationManagementPage = lazy(() => import('../../pages/ExaminationManagement'));
const LoginPage = lazy(() => import('../../pages/Login'));

const PageLoader = () => (
  <div className="flex w-full justify-center py-20">
    <div className="flex items-center gap-3 text-gray-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      <span className="text-sm font-medium">Memuat konten...</span>
    </div>
  </div>
);

export const AppRoutes = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!session) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/parents" element={<ParentManagementPage />} />
            <Route path="/parents/:id" element={<ParentDetailPage />} />
            <Route path="/babies" element={<BabyManagementPage />} />
            <Route path="/babies/:id" element={<BabyDetailPage />} />
            <Route path="/examination" element={<ExaminationManagementPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Suspense>
  );
};
