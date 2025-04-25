"use client";
import React, { useEffect, useState } from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RecentReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      setError('Business profile not found.');
      setLoading(false);
      return;
    }
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data: receiptsData, error: receiptsError } = await supabase
          .from('receipts')
          .select('*')
          .eq('business_id', businessId)
          .order('date', { ascending: false });
        if (receiptsError) throw receiptsError;
        setReceipts(receiptsData || []);
        // Fetch all customer info for mapping id to name
        const { data: customersData } = await supabase
          .from('customers')
          .select('id, name');
        const custMap: any = {};
        (customersData || []).forEach((c: any) => { custMap[c.id] = c.name; });
        setCustomers(custMap);
      } catch (err: any) {
        setError(err.message || 'Failed to load receipts');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredReceipts = receipts.filter(receipt => {
    const customerName = customers[receipt.customer_id] || '';
    return (
      (receipt.receipt_number || receipt.id).toLowerCase().includes(search.toLowerCase()) ||
      (customerName && customerName.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">All Receipts</h1>
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by receipt number or customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-80"
          />
          <Link href="/analytics" className="btn-primary">View Analytics</Link>
        </div>
        <div className="bg-white rounded shadow p-6">
          {loading ? (
            <div>Loading receipts...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
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
                {filteredReceipts.map((receipt, idx) => (
                  <tr key={receipt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.receipt_number || receipt.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receipt.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customers[receipt.customer_id] || receipt.customer_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(receipt.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/receipts/${receipt.id}/view`} className="text-primary-600 hover:text-primary-900">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
