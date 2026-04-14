"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, TrendingUp, Package, Users, DollarSign, Loader2, RefreshCw } from "lucide-react";

type ReportData = {
  collectedRevenue: number;
  expectedTotal: number;
  codToCollectRevenue: number;
  codToCollectCount: number;
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
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedFilter]);

  // Auto-refresh reports every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReportData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedFilter]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?filter=${selectedFilter}`, {
        cache: 'no-store', // Prevent caching
      });
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
        setLastUpdated(new Date());
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
          <p className="text-gray-600 mt-1">
            Analytics and insights for your business
            {lastUpdated && (
              <span className="text-xs text-gray-500 ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchReportData()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
          {/* Detailed Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Collected Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                ₹{((data?.collectedRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Money in hand (delivered orders)</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm text-gray-600">COD to Collect</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                ₹{((data?.codToCollectRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data?.codToCollectCount || 0} COD orders awaiting delivery
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600">Total Pipeline</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                ₹{((data?.expectedTotal || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Complete revenue picture</p>
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
