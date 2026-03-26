import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute'
import AppLayout from '@/components/AppLayout'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import SimuladorPage from '@/pages/SimuladorPage'
import HistoricoPage from '@/pages/HistoricoPage'
import ClientesPage from '@/pages/ClientesPage'
import ConfigPage from '@/pages/ConfigPage'
import CheckoutPage from '@/pages/CheckoutPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminFinanceiroPage from '@/pages/admin/AdminFinanceiroPage'
import AdminCampanhasPage from '@/pages/admin/AdminCampanhasPage'
import AdminAdministradorasPage from '@/pages/admin/AdminAdministradorasPage'
import AdminConfigPage from '@/pages/admin/AdminConfigPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — App */}
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="simulador" element={<SimuladorPage />} />
            <Route path="historico" element={<HistoricoPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="config" element={<ConfigPage />} />
            <Route path="checkout" element={<CheckoutPage />} />

            {/* Admin */}
            <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="admin/financeiro" element={<AdminRoute><AdminFinanceiroPage /></AdminRoute>} />
            <Route path="admin/campanhas" element={<AdminRoute><AdminCampanhasPage /></AdminRoute>} />
            <Route path="admin/administradoras" element={<AdminRoute><AdminAdministradorasPage /></AdminRoute>} />
            <Route path="admin/configuracoes" element={<AdminRoute><AdminConfigPage /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
