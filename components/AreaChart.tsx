"use client";  // Important: Marks this as a client-side component

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 0.4 },
  { name: 'Feb', value: 0.5 },
  { name: 'Mar', value: 3.6 },
  { name: 'Apr', value: 0.8 },
  { name: 'May', value: 0.3 },
];

export default function ChartComponent() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Area type="monotone" dataKey="value" stroke="#86efac" fill="#86efac" />
      </AreaChart>
    </ResponsiveContainer>
  );
}