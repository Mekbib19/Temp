import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import CustomerManagementPage from './pages/CustomerManagementPage'
import CustomerFormPage from './pages/CustomerFormPage'
import CustomerProfilePage from './pages/CustomerProfilePage'
import RestaurantManagementPage from './pages/RestaurantManagementPage'
import AddMerchantPage from './pages/AddMerchantPage'
import CategoryManagementPage from './pages/CategoryManagementPage'
import CuisineTypeManagementPage from './pages/CuisineTypeManagementPage'
import DeliveryManagementPage from './pages/DeliveryManagementPage'
import StaffManagementPage from './pages/StaffManagementPage'
import OrderManagementPage from './pages/OrderManagementPage'
import FinanceManagementPage from './pages/FinanceManagementPage'
import SecurityManagementPage from './pages/SecurityManagementPage'
import InsightsManagementPage from './pages/InsightsManagementPage'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/delivery" element={<DeliveryManagementPage />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/order" element={<OrderManagementPage />} />
        <Route path="/finance" element={<FinanceManagementPage />} />
        <Route path="/security" element={<SecurityManagementPage />} />
        <Route path="/insights" element={<InsightsManagementPage />} />
        <Route path="/restaurants" element={<RestaurantManagementPage />} />
        <Route path="/restaurants/new" element={<AddMerchantPage />} />
        <Route path="/merchants" element={<RestaurantManagementPage />} />
        <Route path="/merchants/new" element={<AddMerchantPage />} />
        <Route path="/categories" element={<CategoryManagementPage />} />
        <Route path="/cuisines" element={<CuisineTypeManagementPage />} />
        <Route path="/cuisine-types" element={<Navigate to="/cuisines" replace />} />
        <Route path="/customers" element={<CustomerManagementPage />} />
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/:customerId/edit" element={<CustomerFormPage />} />
        <Route path="/customers/:customerId" element={<CustomerProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
