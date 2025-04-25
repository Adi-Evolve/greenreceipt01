"use client";

import React, { useEffect, useState, useRef } from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const businessId = typeof window !== 'undefined' ? localStorage.getItem('businessId') || '' : '';

  useEffect(() => {
    supabase.from('customers').select('*').then(({ data }) => setCustomers(data || []));
  }, []);

  useEffect(() => {
    if (businessId) fetch(`/api/customers/${businessId}`).then(res => res.json()).then(setCustomers);
  }, [businessId]);

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!fileInput.current?.files?.[0]) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', fileInput.current.files[0]);
    fetch(`/api/import/customers/${businessId}`, { method: 'POST', body: formData })
      .then(res => res.json())
      .then(() => {
        setImporting(false);
        fileInput.current!.value = '';
        fetch(`/api/customers/${businessId}`).then(res => res.json()).then(setCustomers);
      });
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6">Customers</h1>
          <form className="mb-4" onSubmit={handleImport}>
            <input type="file" ref={fileInput} accept=".csv,.xlsx" className="border p-2 rounded mr-2" required />
            <button className="btn-primary" type="submit" disabled={importing}>{importing ? 'Importing...' : 'Import from Tally/CSV'}</button>
          </form>
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-3 py-2 mb-4 w-full" />
          <table className="w-full border">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t">
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </main>
  );
}
