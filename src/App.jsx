import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import CustomerManagementPage from './pages/CustomerManagementPage'
import CustomerProfilePage from './pages/CustomerProfilePage'
import RestaurantManagementPage from './pages/RestaurantManagementPage'
import AddMerchantPage from './pages/AddMerchantPage'
import MerchantDetailsPage from './pages/MerchantDetailsPage'
import BranchDetailPage from './pages/BranchDetailPage'
import AddMerchantBranchPage from './pages/AddMerchantBranchPage'
import CategoryManagementPage from './pages/CategoryManagementPage'
import CuisineTypeManagementPage from './pages/CuisineTypeManagementPage'
import MenuCategoryManagementPage from './pages/MenuCategoryManagementPage'
import MenuCategoryDetailsPage from './pages/MenuCategoryDetailsPage'
import DeliveryManagementPage from './pages/DeliveryManagementPage'
import RiderManagementPage from './pages/RiderManagementPage'
import AddRiderPage from './pages/AddRiderPage'
import RiderDetailPage from './pages/RiderDetailPage'
import BlockRiderPage from './pages/BlockRiderPage'
import RiderVerificationPage from './pages/RiderVerificationPage'
import RiderVerificationDetailPage from './pages/RiderVerificationDetailPage'
import StaffManagementPage from './pages/StaffManagementPage'
import StaffDetailPage from './pages/StaffDetailPage'
import OrderManagementPage from './pages/OrderManagementPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ReassignRiderPage from './pages/ReassignRiderPage'
import FinanceManagementPage from './pages/FinanceManagementPage'
import SecurityManagementPage from './pages/SecurityManagementPage'
import SettingsPage from './pages/SettingsPage'
import InsightsManagementPage from './pages/InsightsManagementPage'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import FirstTimeLoginPage from './pages/FirstTimeLoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/riders" element={<RiderManagementPage />} />
        <Route path="/delivery" element={<DeliveryManagementPage />} />
        <Route path="/deliveries" element={<DeliveryManagementPage />} />
        <Route path="/delivery/live" element={<DeliveryManagementPage />} />
        <Route path="/delivery-live" element={<DeliveryManagementPage />} />
        <Route path="/live-delivery" element={<DeliveryManagementPage />} />
        <Route path="/live-tracking" element={<DeliveryManagementPage />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/staff/:id" element={<StaffDetailPage />} />
        <Route path="/order" element={<OrderManagementPage />} />
        <Route path="/orders" element={<OrderManagementPage />} />
        <Route path="/order/:orderId/reassign-rider" element={<ReassignRiderPage />} />
        <Route path="/orders/:orderId/reassign-rider" element={<ReassignRiderPage />} />
        <Route path="/order/:id/reassign-rider" element={<ReassignRiderPage />} />
        <Route path="/orders/:id/reassign-rider" element={<ReassignRiderPage />} />
        <Route path="/order/:orderId/reassign-courier" element={<ReassignRiderPage />} />
        <Route path="/orders/:orderId/reassign-courier" element={<ReassignRiderPage />} />
        <Route path="/order/:id/reassign-courier" element={<ReassignRiderPage />} />
        <Route path="/orders/:id/reassign-courier" element={<ReassignRiderPage />} />
        <Route path="/order/:orderId" element={<OrderDetailPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/finance" element={<FinanceManagementPage />} />
        <Route path="/security" element={<SecurityManagementPage />} />
        <Route path="/insights" element={<InsightsManagementPage />} />
        <Route path="/restaurants" element={<RestaurantManagementPage />} />
        <Route path="/restaurants/new" element={<AddMerchantPage />} />
        <Route path="/restaurants/:merchantId/edit" element={<AddMerchantPage />} />
        <Route path="/restaurants/:merchantId" element={<MerchantDetailsPage />} />
        <Route path="/restaurants/:merchantId/branches/new" element={<AddMerchantBranchPage />} />
        <Route path="/restaurants/:merchantId/branches/:branchId" element={<BranchDetailPage />} />
        <Route path="/merchants" element={<RestaurantManagementPage />} />
        <Route path="/merchants/new" element={<AddMerchantPage />} />
        <Route path="/merchants/:merchantId/edit" element={<AddMerchantPage />} />
        <Route path="/merchants/:merchantId" element={<MerchantDetailsPage />} />
        <Route path="/merchants/:merchantId/branches/new" element={<AddMerchantBranchPage />} />
        <Route path="/merchants/:merchantId/branches/:branchId" element={<BranchDetailPage />} />
        <Route path="/categories" element={<CategoryManagementPage />} />
        <Route path="/cuisines" element={<CuisineTypeManagementPage />} />
        <Route path="/cuisine-types" element={<Navigate to="/cuisines" replace />} />
        <Route path="/menu-categories" element={<MenuCategoryManagementPage />} />
        <Route path="/menu-categories/:categoryId" element={<MenuCategoryDetailsPage />} />
        <Route path="/menu-items/new" element={<MenuCategoryDetailsPage />} />
        <Route path="/menu-items/:itemId" element={<MenuCategoryDetailsPage />} />
        <Route path="/menu-items" element={<MenuCategoryDetailsPage />} />
        <Route path="/menu-category" element={<Navigate to="/menu-categories" replace />} />
        <Route path="/customers" element={<CustomerManagementPage />} />
        <Route path="/customers/new" element={<Navigate to="/customers" replace />} />
        <Route path="/customers/:customerId" element={<CustomerProfilePage />} />

        {/* URL Aliases and case insensitivity */}
        <Route path="/customer" element={<Navigate to="/customers" replace />} />
        <Route path="/Customer" element={<Navigate to="/customers" replace />} />
        <Route path="/Customers" element={<Navigate to="/customers" replace />} />
        <Route path="/customer/:customerId" element={<CustomerProfilePage />} />
        <Route path="/Customer/:customerId" element={<CustomerProfilePage />} />
        <Route path="/rider" element={<Navigate to="/riders" replace />} />
        <Route path="/Rider" element={<Navigate to="/riders" replace />} />
        <Route path="/riders/verification" element={<RiderVerificationPage />} />
        <Route path="/riders/verification/:id" element={<RiderVerificationDetailPage />} />
        <Route path="/rider/verification/:id" element={<RiderVerificationDetailPage />} />
        <Route path="/riders/verifications" element={<Navigate to="/riders/verification" replace />} />
        <Route path="/rider/verification" element={<Navigate to="/riders/verification" replace />} />
        <Route path="/rider-verification" element={<Navigate to="/riders/verification" replace />} />
        <Route path="/riders/new" element={<AddRiderPage />} />
        <Route path="/riders/:id/block" element={<BlockRiderPage />} />
        <Route path="/riders/:id" element={<RiderDetailPage />} />

        {/* System Settings & Support */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/system/settings" element={<SettingsPage />} />
        <Route path="/system-settings" element={<SettingsPage />} />
        {/* Authentication & Onboarding */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/first-time-login" element={<FirstTimeLoginPage />} />
        <Route path="/setup-password" element={<FirstTimeLoginPage />} />
        <Route path="/force-password-change" element={<FirstTimeLoginPage />} />

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
