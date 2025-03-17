"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="max-w-6xl mx-auto px-4 py-16"
      >
        {/* Hero Section */}
        <motion.div 
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            <span className="text-green-600">Medi</span>Sage
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your intelligent health companion powered by AI. Get instant insights from your medical documents and personalized health recommendations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Try Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              icon: "🔍",
              title: "AI Analysis",
              description: "Advanced AI algorithms analyze your medical reports with high precision"
            },
            {
              icon: "💡",
              title: "Smart Insights",
              description: "Get personalized health insights and recommendations"
            },
            {
              icon: "🤖",
              title: "Chat Assistant",
              description: "Interactive AI chat to answer your health-related questions"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-xl p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Upload", desc: "Upload your medical documents" },
              { step: "2", title: "Analyze", desc: "AI analyzes your reports" },
              { step: "3", title: "Chat", desc: "Ask health-related questions" },
              { step: "4", title: "Insights", desc: "Get personalized insights" }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={fadeIn}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Join thousands of users who trust MediSage for their health insights</p>
          <Link href="/home">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Start Your Journey
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Add animations here
