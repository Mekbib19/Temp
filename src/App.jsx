import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import CustomerManagementPage from './pages/CustomerManagementPage'
import CustomerFormPage from './pages/CustomerFormPage'
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
        <Route path="/riders" element={<RiderManagementPage />} />
        <Route path="/delivery" element={<DeliveryManagementPage />} />
        <Route path="/staff" element={<StaffManagementPage />} />
        <Route path="/order" element={<OrderManagementPage />} />
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
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/:customerId/edit" element={<CustomerFormPage />} />
        <Route path="/customers/:customerId" element={<CustomerProfilePage />} />

        {/* URL Aliases and case insensitivity */}
        <Route path="/customer" element={<Navigate to="/customers" replace />} />
        <Route path="/Customer" element={<Navigate to="/customers" replace />} />
        <Route path="/Customers" element={<Navigate to="/customers" replace />} />
        <Route path="/customer/:customerId" element={<CustomerProfilePage />} />
        <Route path="/Customer/:customerId" element={<CustomerProfilePage />} />
        <Route path="/rider" element={<Navigate to="/riders" replace />} />
        <Route path="/Rider" element={<Navigate to="/riders" replace />} />
        <Route path="/Riders" element={<Navigate to="/riders" replace />} />

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
