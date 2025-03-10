"use client";

import React, { useState } from "react";
import { UserIcon, MailIcon, CalendarIcon, User, Menu } from "lucide-react";
import Nav from "@/components/Nav";
import Link from "next/link";

const ProfilePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-100">
      <div className="flex h-screen">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30
          w-72 bg-white shadow-lg flex flex-col`}
        >
          <div className="p-6 border-b">
            <Link href="/home">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-lime-700 to-green-700 bg-clip-text text-transparent">
                  MediSage
                </span>
              </div>
            </Link>
          </div>
          <Nav />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 p-6 space-y-6 max-w-3xl mx-auto">
          {/* Profile Section */}
          <div className="bg-white shadow-md rounded-2xl p-6 flex items-center gap-6">
            <div className="bg-gray-200 rounded-full h-20 w-20 flex items-center justify-center text-gray-500 text-2xl font-bold">
              AU
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Arun</h2>
              <p className="text-gray-500">arun@example.com</p>
            </div>
          </div>

          {/* Information Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <UserIcon className="h-7 w-7 text-lime-600" />,
                title: "Personal Information",
                description: "View and update your personal details",
              },
              {
                icon: <MailIcon className="h-7 w-7 text-lime-600" />,
                title: "Contact Information",
                description: "Manage your email and phone number",
              },
              {
                icon: <CalendarIcon className="h-7 w-7 text-lime-600" />,
                title: "Appointments",
                description: "View and manage your upcoming appointments",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center bg-white shadow-md rounded-2xl p-5 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mr-4">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
