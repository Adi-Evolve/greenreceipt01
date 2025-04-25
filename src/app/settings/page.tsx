"use client";

import React, { useState, useEffect } from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import BackupRestorePanel from '../components/BackupRestorePanel';

const COLOR_THEMES = [
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Gray', value: 'gray', class: 'bg-gray-700' },
];

// Helper to fetch all business data from backend for backup
async function getAllData(businessId: string) {
  const [products, customers, staff, expenses, invoices, reminders] = await Promise.all([
    fetch(`/api/products/${businessId}`).then(r => r.json()),
    fetch(`/api/customers/${businessId}`).then(r => r.json()),
    fetch(`/api/staff/${businessId}`).then(r => r.json()),
    fetch(`/api/expenses/${businessId}`).then(r => r.json()),
    fetch(`/api/invoices/${businessId}`).then(r => r.json()),
    fetch(`/api/reminders/${businessId}`).then(r => r.json()),
  ]);
  return { products, customers, staff, expenses, invoices, reminders };
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [color, setColor] = useState('green');
  const businessId = typeof window !== 'undefined' ? localStorage.getItem('businessId') || '' : '';

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    const savedColor = localStorage.getItem('colorTheme');
    if (savedColor) setColor(savedColor);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem('theme', theme);
    localStorage.setItem('colorTheme', color);
    alert('Settings saved!');
    window.location.reload();
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow bg-gray-50">
        <div className="max-w-xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <BackupRestorePanel businessId={businessId} getAllData={() => getAllData(businessId)} />
          <form className="bg-white rounded shadow p-6 space-y-6" onSubmit={handleSave}>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
                Enable notifications
              </label>
            </div>
            <div>
              <label className="block font-medium mb-1">Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className="border rounded px-3 py-2">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Color Theme</label>
              <div className="flex gap-3">
                {COLOR_THEMES.map(t => (
                  <button type="button" key={t.value} className={`w-8 h-8 rounded-full border-2 ${color === t.value ? 'border-black' : 'border-transparent'} ${t.class}`} onClick={() => setColor(t.value)} aria-label={t.name}></button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">Save Settings</button>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
