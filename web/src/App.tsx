import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminGuard } from './components/AdminGuard';
import { Home } from './pages/Home';
import { PlatePending } from './pages/PlatePending';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ActivatePlate } from './pages/admin/ActivatePlate';
import { PlatesList } from './pages/admin/PlatesList';
import { CompanyDetails } from './pages/admin/CompanyDetails';
import { PrintPlate } from './pages/admin/PrintPlate';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/p/:code" element={<PlatePending />} />
          <Route path="/admin/login" element={<Login />} />

          {/* Rotas Administrativas Protegidas */}
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<Dashboard />} />
            <Route path="ativar" element={<ActivatePlate />} />
            <Route path="placas" element={<PlatesList />} />
            <Route path="imprimir" element={<PrintPlate />} />
            <Route path="empresas/:id" element={<CompanyDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
