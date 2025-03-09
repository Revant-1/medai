"use client";

import React , { useState }  from 'react';
import { UserIcon, MailIcon, CalendarIcon, User, Menu } from 'lucide-react';
import Nav from '@/components/Nav';
import Link from "next/link";

const ProfilePage = () => {
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

      <div className="flex items-center mb-6">
        <div className="bg-gray-200 rounded-full h-20 w-20 flex items-center justify-center text-gray-500 text-2xl font-bold mr-4">
          AU
        </div>
        <div>
          <h2 className="text-2xl font-bold">Arun</h2>
          <p className="text-gray-500">arun@example.com</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <UserIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Personal Information</h3>
            <p className="text-gray-500">View and update your personal details</p>
          </div>
        </div>
        <div className="flex items-center">
          <MailIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Contact Information</h3>
            <p className="text-gray-500">Manage your email and phone number</p>
          </div>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium">Appointments</h3>
            <p className="text-gray-500">View and manage your upcoming appointments</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;