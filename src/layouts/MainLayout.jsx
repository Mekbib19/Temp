import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MainLayout = ({
  children,
  activeMenuKey,
  breadcrumbParent,
  breadcrumbMiddle,
  breadcrumbCurrent,
  noSidebar = false,
}) => {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Automatically determine active menu key if not explicitly supplied
  let resolvedActiveMenuKey = activeMenuKey
  if (!resolvedActiveMenuKey) {
    const path = location.pathname
    if (path.startsWith('/order')) resolvedActiveMenuKey = 'orderManagement'
    else if (path.startsWith('/customers')) resolvedActiveMenuKey = 'customerManagement'
    else if (path.startsWith('/riders/verification')) resolvedActiveMenuKey = 'riderVerification'
    else if (path.startsWith('/riders')) resolvedActiveMenuKey = 'riderManagement'
    else if (path.startsWith('/staff')) resolvedActiveMenuKey = 'staffManagement'
    else if (path.startsWith('/restaurants') || path.startsWith('/merchants')) resolvedActiveMenuKey = 'merchantManagement'
    else if (path.startsWith('/categories')) resolvedActiveMenuKey = 'categoryManagement'
    else if (path.startsWith('/cuisines')) resolvedActiveMenuKey = 'cuisineManagement'
    else if (path.startsWith('/menu-categories')) resolvedActiveMenuKey = 'menuCategory'
    else if (path.startsWith('/delivery')) resolvedActiveMenuKey = 'deliveryManagement'
    else if (path.startsWith('/finance')) resolvedActiveMenuKey = 'finance'
    else if (path.startsWith('/insights')) resolvedActiveMenuKey = 'insights'
    else if (path.startsWith('/security')) resolvedActiveMenuKey = 'security'
    else if (path.startsWith('/settings')) resolvedActiveMenuKey = 'settings'
    else resolvedActiveMenuKey = 'dashboard'
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      {!noSidebar && (
        <>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            activeMenuKey={resolvedActiveMenuKey}
          />
          {isMobileSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
        </>
      )}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        breadcrumbParent={breadcrumbParent}
        breadcrumbMiddle={breadcrumbMiddle}
        breadcrumbCurrent={breadcrumbCurrent}
        noSidebar={noSidebar}
      />
      <main
        className={`px-4 pb-12 transition-all duration-300 sm:px-6 lg:px-8 pt-20 ${
          noSidebar ? 'w-full max-w-7xl mx-auto' : isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  )
}

export default MainLayout
