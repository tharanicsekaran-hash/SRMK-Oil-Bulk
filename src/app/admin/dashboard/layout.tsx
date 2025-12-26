"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

type SidebarItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  roles: ("ADMIN" | "DELIVERY")[];
};

type Order = {
  id: string;
  deliveryStatus: string;
  // Add other fields as needed
};

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    roles: ["ADMIN", "DELIVERY"],
  },
  {
    label: "Products",
    icon: Package,
    href: "/admin/dashboard/products",
    roles: ["ADMIN"],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/admin/dashboard/orders",
    roles: ["ADMIN"],
  },
  {
    label: "Delivery Management",
    icon: Truck,
    href: "/admin/dashboard/delivery",
    roles: ["ADMIN"],
  },
  {
    label: "Customers",
    icon: Users,
    href: "/admin/dashboard/customers",
    roles: ["ADMIN"],
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/admin/dashboard/reports",
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/dashboard/settings",
    roles: ["ADMIN"],
  },
  // Delivery-specific tabs
  {
    label: "Assigned Orders",
    icon: ShoppingCart,
    href: "/admin/dashboard/my-orders",
    roles: ["DELIVERY"],
  },
  {
    label: "Unassigned Orders",
    icon: Package,
    href: "/admin/dashboard/available-orders",
    roles: ["DELIVERY"],
  },
  {
    label: "Delivery History",
    icon: BarChart3,
    href: "/admin/dashboard/delivery-history",
    roles: ["DELIVERY"],
  },
];

export default function AdminDashboardLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const userRole = session?.user?.role as "ADMIN" | "DELIVERY" | undefined;

  // Load last seen count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("adminLastSeenOrders");
    if (!stored) {
      // First time - initialize with current count
      fetchAndInitialize();
    }
  }, []);

  const fetchAndInitialize = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = (await res.json()) as Order[];
        const pendingCount = data.filter((order) => 
          order.deliveryStatus === "PENDING"
        ).length;
        localStorage.setItem("adminLastSeenOrders", pendingCount.toString());
        console.log("📊 Badge: Initialized with", pendingCount, "pending orders");
      }
    } catch (error) {
      console.error("Failed to initialize orders count:", error);
    }
  };

  // Clear badge when navigating to orders page directly
  useEffect(() => {
    if (pathname === "/admin/dashboard/orders") {
      const clearBadge = async () => {
        setNewOrdersCount(0);
        
        try {
          const res = await fetch("/api/admin/orders");
          if (res.ok) {
            const data = (await res.json()) as Order[];
            const currentPendingCount = data.filter((order) => 
              order.deliveryStatus === "PENDING"
            ).length;
            localStorage.setItem("adminLastSeenOrders", currentPendingCount.toString());
            console.log("✅ Badge cleared (navigation): Last seen updated to", currentPendingCount);
          }
        } catch (error) {
          console.error("Failed to update last seen count:", error);
        }
      };
      
      clearBadge();
    }
  }, [pathname]);

  // Poll for new orders (Admin only)
  useEffect(() => {
    if (userRole !== "ADMIN") return;

    const fetchNewOrdersCount = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (res.ok) {
          const data = (await res.json()) as Order[];
          const currentPendingCount = data.filter((order) => 
            order.deliveryStatus === "PENDING"
          ).length;
          
          const lastSeenCount = parseInt(localStorage.getItem("adminLastSeenOrders") || "0");
          
          // Calculate new orders (difference between current and last seen)
          const newCount = Math.max(0, currentPendingCount - lastSeenCount);
          
          console.log(`🔔 Badge: Current=${currentPendingCount}, LastSeen=${lastSeenCount}, Badge=${newCount}`);
          
          setNewOrdersCount(newCount);
        }
      } catch (error) {
        console.error("Failed to check orders:", error);
      }
    };

    // Initial fetch
    fetchNewOrdersCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchNewOrdersCount, 30000);

    return () => clearInterval(interval);
  }, [userRole]);

  // Filter sidebar items based on user role
  const visibleItems = sidebarItems.filter((item) =>
    userRole ? item.roles.includes(userRole) : false
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">SRMK Oil Mill</h2>
                <p className="text-xs text-gray-600 capitalize">{userRole?.toLowerCase()} Access</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-600 truncate">{session?.user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const showBadge = item.href === "/admin/dashboard/orders" && newOrdersCount > 0;

              return (
                <button
                  key={item.href}
                  onClick={async () => {
                    router.push(item.href);
                    setSidebarOpen(false);
                    
                    // Clear badge when clicking Orders page
                    if (item.href === "/admin/dashboard/orders") {
                      setNewOrdersCount(0);
                      
                      // Update localStorage with current pending count
                      try {
                        const res = await fetch("/api/admin/orders");
                        if (res.ok) {
                          const data = (await res.json()) as Order[];
                          const currentPendingCount = data.filter((order) => 
                            order.deliveryStatus === "PENDING"
                          ).length;
                          localStorage.setItem("adminLastSeenOrders", currentPendingCount.toString());
                          console.log("✅ Badge cleared: Last seen updated to", currentPendingCount);
                        }
                      } catch (error) {
                        console.error("Failed to update last seen count:", error);
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {newOrdersCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Admin Panel Badge - Top Left (Desktop only) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Admin Panel</span>
            </div>

            {/* Centered Logo/Company Name */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-bold text-[#d97706]">SRMK Oil Mill</h1>
            </div>

            {/* Mobile: Current Page Title */}
            <div className="lg:hidden flex-1 text-center">
              <h2 className="text-sm font-medium text-gray-700">
                {visibleItems.find((item) => item.href === pathname)?.label || "Dashboard"}
              </h2>
            </div>

            {/* Desktop User Info */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{userRole?.toLowerCase()} Access</p>
              </div>
            </div>

            {/* Mobile: User Info Icon */}
            <div className="lg:hidden">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
