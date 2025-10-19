import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/index.tsx';
import NotesPage from './pages/dashboard/index.tsx';
import NotePage from './pages/dashboard/note/index.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import { isAuthenticated } from './utils/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/note/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated() ? "/notes" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

