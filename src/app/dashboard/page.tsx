'use client';

import Link from 'next/link';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import DashboardCard from './components/DashboardCard';
import { FcSalesPerformance } from 'react-icons/fc';
import { MdLocalOffer } from 'react-icons/md';
import { FaRegFileAlt } from 'react-icons/fa';
import NotificationBell from '../components/NotificationBell';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  // Get business info from localStorage
  const [businessName, setBusinessName] = useState('');
  const [businessId, setBusinessId] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('businessInfo');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBusinessName(parsed.businessName || 'Business User');
        setBusinessId(parsed.businessId || '');
      } else {
        setBusinessName('Business User');
        setBusinessId('');
      }
    }
  }, []);

  // Dashboard statistics (empty for live look)
  const dashboardStats: { title: string; value: string; icon: string }[] = [];

  // Recent receipts (empty for live look)
  const recentReceipts: { id: string; date: string; customer: string; amount: string }[] = [];

  return (
    <main className="min-h-screen flex flex-col">
      <ServerNavbar isLoggedIn={true} businessName={businessName} />
      
      <div className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back to your Green Receipt business portal. Your Business ID: <span className="font-medium">{businessId || 'N/A'}</span>
              </p>
            </div>
            <div className="flex items-center justify-end gap-4 mb-4">
              {/* Notification Bell - pass userId from auth/session */}
              <NotificationBell userId={businessId} />
            </div>
          </div>
          
          {/* Quick Action Buttons - Centered */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <Link href="/generate-receipt" 
              className="btn-primary flex items-center text-lg px-6 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Generate Receipt
            </Link>
            <Link href="/recent-receipts" className="btn-primary flex items-center text-lg px-6 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 013-3h4a3 3 0 013 3v12a3 3 0 01-3 3H8a3 3 0 01-3-3V4zm3-1a1 1 0 00-1 1v12a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Recent Receipts
            </Link>
          </div>

          {/* Sales, Offers, Drafts Buttons - with icons, reduced size */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <Link href="/sales" className="btn-secondary flex flex-col items-center justify-center text-base px-4 py-3 w-28 h-20">
              <FcSalesPerformance className="text-3xl mb-1" />
              Sales
            </Link>
            <Link href="/offers" className="btn-secondary flex flex-col items-center justify-center text-base px-4 py-3 w-28 h-20">
              <MdLocalOffer className="text-3xl mb-1 text-yellow-600" />
              Offers
            </Link>
            <Link href="/drafts" className="btn-secondary flex flex-col items-center justify-center text-base px-4 py-3 w-28 h-20">
              <FaRegFileAlt className="text-3xl mb-1 text-blue-600" />
              Drafts
            </Link>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {dashboardStats.map((stat, index) => (
              <DashboardCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>
          
          {/* Recent Receipts */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary-800">Recent Receipts</h2>
              <Link href="/recent-receipts" className="text-primary-600 hover:text-primary-900 font-medium">View All</Link>
            </div>
            
            {recentReceipts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary-100 text-primary-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Receipt #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentReceipts.map((receipt, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {receipt.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <Link href={`/receipts/${receipt.id}/view`} className="text-primary-600 hover:text-primary-900">
                              View
                            </Link>
                            <Link href={`/receipts/${receipt.id}/print`} className="text-gray-600 hover:text-gray-900">
                              Print
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No receipts yet. Create your first receipt!</p>
              </div>
            )}
          </div>
          
          {/* Quick Tips */}
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-primary-800 mb-4">Tips for using Green Receipt</h2>
            <div className="space-y-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-primary-700">Create a custom receipt template that matches your brand's style.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-primary-700">Add your most common products to speed up receipt creation.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-primary-700">Import your customer database to keep track of all customer interactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 