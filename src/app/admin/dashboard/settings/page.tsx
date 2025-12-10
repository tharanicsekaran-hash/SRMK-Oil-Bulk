"use client";

import { Settings as SettingsIcon, Tag, MapPin, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your admin portal settings</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Role Management</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manage user roles and permissions for admin and delivery users.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Configure Roles →
          </button>
        </div>

        {/* Delivery Zones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Delivery Zones</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Set up delivery zones and assign delivery agents to specific areas.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Manage Zones →
          </button>
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Product Categories</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manage product categories and organize your inventory.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Edit Categories →
          </button>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">General Settings</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configure general system settings and preferences.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Open Settings →
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <p className="text-blue-800">
          <span className="font-semibold">Note:</span> Advanced settings configuration UI is under development. 
          Contact system administrator for custom configurations.
        </p>
      </div>
    </div>
  );
}
