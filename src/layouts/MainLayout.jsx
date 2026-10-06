import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MainLayout = ({
  children,
  activeMenuKey = 'dashboard',
  breadcrumbParent,
  breadcrumbMiddle,
  breadcrumbCurrent,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeMenuKey={activeMenuKey}
      />
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        breadcrumbParent={breadcrumbParent}
        breadcrumbMiddle={breadcrumbMiddle}
        breadcrumbCurrent={breadcrumbCurrent}
      />
      <main
        className={`px-4 pb-12 transition-all duration-300 sm:px-6 lg:px-8 pt-20 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  )
}

export default MainLayout
