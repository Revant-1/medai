"use client";

import React, { useState } from 'react';
import { SettingsIcon, LockIcon, ShareIcon, UserIcon, User, Menu } from 'lucide-react';
import Nav from '@/components/Nav';
import Link from "next/link";

const SettingsPage = () => {
  const [name, setName] = useState('Arun');
  const [email, setEmail] = useState('arun@example.com');
  const [password, setPassword] = useState('********');
  const [notifications, setNotifications] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
     <div className="flex h-screen">    

     <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div
          className={`
            fixed inset-y-0 left-0 transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }
            lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30
            w-64 bg-white shadow-lg
          `}
        >
          <div className="p-6">
            <Link href="/home">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  MediSage
                </span>
              </div>
            </Link>
          </div>
          <Nav />
        </div>

      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <SettingsIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Account</h3>
            <p className="text-gray-500">Manage your account details</p>
          </div>
        </div>
        <div className="flex items-center">
          <LockIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-gray-500">Update your password and security settings</p>
          </div>
        </div>
        <div className="flex items-center">
          <ShareIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Sharing</h3>
            <p className="text-gray-500">Manage your sharing preferences</p>
          </div>
        </div>
        <div className="flex items-center">
          <UserIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-gray-500">Update your personal information</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-gray-500">Receive updates and alerts</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage;