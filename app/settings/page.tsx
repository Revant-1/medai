"use client";

import React, { useState } from "react";
import { SettingsIcon, LockIcon, ShareIcon, UserIcon, User, Menu } from "lucide-react";
import Nav from "@/components/Nav";
import Link from "next/link";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
      <div className="flex h-screen">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-72 bg-white shadow-lg`}
        >
          <div className="p-6 border-b border-gray-200">
            <Link href="/home">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  MediSage
                </span>
              </div>
            </Link>
          </div>
          <Nav />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Settings</h2>
          <div className="space-y-6">
            {/* Settings Items */}
            {[
              { icon: SettingsIcon, title: "Account", desc: "Manage your account details" },
              { icon: LockIcon, title: "Security", desc: "Update your password and security settings" },
              { icon: ShareIcon, title: "Sharing", desc: "Manage your sharing preferences" },
              { icon: UserIcon, title: "Profile", desc: "Update your personal information" },
            ].map(({ icon: Icon, title, desc }, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Icon className="h-6 w-6 text-lime-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{title}</h3>
                  <p className="text-gray-500">{desc}</p>
                </div>
              </div>
            ))}

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
                <p className="text-gray-500">Receive updates and alerts</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="opacity-0 w-0 h-0"
                />
                <span
                  className={`absolute top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all ${
                    notifications ? "bg-lime-500" : ""
                  }`}
                />
                <span
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-all ${
                    notifications ? "translate-x-6" : ""
                  }`}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
