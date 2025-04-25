import React from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

export default function AddCustomerPage() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get businessId from localStorage (set after profile save)
  React.useEffect(() => {
    const bizId = localStorage.getItem('businessId');
    if (!bizId) {
      setError('Please complete your business profile first.');
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      setError('Business profile not found.');
      setLoading(false);
      return;
    }
    try {
      const { error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            business_id: businessId,
            name: form.name,
            email: form.email,
            phone: form.phone
          }
        ]);
      if (insertError) throw insertError;
      setForm({ name: '', email: '', phone: '' });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">Add Customer</h1>
        <form className="bg-white p-6 rounded shadow space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-600 focus:border-primary-600" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-600 focus:border-primary-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-600 focus:border-primary-600" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Adding...' : 'Add Customer'}</button>
          {success && <div className="text-green-600 mt-2">Customer added successfully!</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      </div>
      <Footer />
    </main>
  );
}
