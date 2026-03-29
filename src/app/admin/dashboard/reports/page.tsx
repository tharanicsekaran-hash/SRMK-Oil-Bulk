"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, TrendingUp, Package, Users, DollarSign, Loader2, AlertCircle } from "lucide-react";

type ReportData = {
  paidRevenue: number;
  unpaidRevenue: number;
  unpaidOrdersCount: number;
  productsSold: number;
  newCustomers: number;
  growthPercentage: number;
  filter: string;
};

type FilterType = "week" | "month" | "year" | "all";

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("month");

  useEffect(() => {
    fetchReportData();
  }, [selectedFilter]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?filter=${selectedFilter}`);
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/admin/reports/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case "week": return "Last 7 Days";
      case "month": return "Last 30 Days";
      case "year": return "Last Year";
      case "all": return "All Time";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analytics and insights for your business</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 mr-2">Time Period:</span>
          {(["week", "month", "year", "all"] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getFilterLabel(filter)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Revenue Stats - Separate Paid & Unpaid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid Revenue */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm border border-green-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Paid Revenue</span>
              </div>
              <p className="text-3xl font-bold">
                ₹{((data?.paidRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-100 mt-1">
                From delivered & paid orders
              </p>
            </div>

            {/* Unpaid Revenue (COD Pending) */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm border border-orange-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Unpaid Revenue (COD)</span>
              </div>
              <p className="text-3xl font-bold">
                ₹{((data?.unpaidRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-orange-100 mt-1">
                {data?.unpaidOrdersCount || 0} delivered COD orders pending payment
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Products Sold</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data?.productsSold || 0}</p>
              <p className="text-xs text-gray-500 mt-1">From delivered orders</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">New Customers</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data?.newCustomers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">In selected period</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-600">Revenue Growth</span>
              </div>
              <p className={`text-2xl font-bold ${
                (data?.growthPercentage || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {data?.growthPercentage ? `${data.growthPercentage > 0 ? "+" : ""}${data.growthPercentage}%` : "0%"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Compared to previous period</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Revenue Summary - {getFilterLabel(selectedFilter)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 mb-1">💰 Total Paid Revenue</p>
                <p className="text-2xl font-bold text-blue-900">
                  ₹{((data?.paidRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-orange-700 mb-1">⏳ Pending COD Collection</p>
                <p className="text-2xl font-bold text-orange-900">
                  ₹{((data?.unpaidRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {data?.unpaidOrdersCount || 0} orders
                </p>
              </div>
              <div>
                <p className="text-green-700 mb-1">📊 Expected Total</p>
                <p className="text-2xl font-bold text-green-900">
                  ₹{(((data?.paidRevenue || 0) + (data?.unpaidRevenue || 0)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  When all COD collected
                </p>
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-600">
              Charts, trends, and detailed analytics will be available here.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
