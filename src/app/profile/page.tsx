"use client";

import React from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

// Utility to generate a unique 6-digit code
function generateBusinessId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    businessName: '',
    businessId: '',
    address: '',
    gst: '',
    email: '',
    phone: '',
    logo: null as File | null,
    logoUrl: '',
    terms: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string|null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string|null>(null);
  const [showSummary, setShowSummary] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    // Fetch email from localStorage/session if available (Google or normal sign in)
    const saved = localStorage.getItem('businessInfo');
    const emailFromSession = localStorage.getItem('userEmail');
    const cachedLogoUrl = localStorage.getItem('logoUrl');
    if (saved) {
      const parsed = JSON.parse(saved);
      setForm(prev => ({ ...prev, ...parsed, logoUrl: cachedLogoUrl || parsed.logoUrl }));
      setLoading(false);
    } else if (emailFromSession) {
      setForm(prev => ({ ...prev, email: emailFromSession, businessId: generateBusinessId(), logoUrl: cachedLogoUrl || '' }));
      setLoading(false);
    } else {
      setForm(prev => ({ ...prev, businessId: generateBusinessId(), logoUrl: cachedLogoUrl || '' }));
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, logo: file }));
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  }

  async function uploadLogo(file: File): Promise<string> {
    // Upload logo to imgbb
    const formData = new FormData();
    formData.append('image', file);
    // Using your actual imgbb API key
    const apiKey = '272785e1c6e6221d927bad99483ff9ed';
    const imgbbEndpoint = `https://api.imgbb.com/1/upload?key=${apiKey}`;
    const res = await fetch(imgbbEndpoint, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.data && data.data.url) return data.data.url;
    throw new Error(data.error?.message || 'Logo upload to imgbb failed');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    let logoUrl = form.logoUrl;
    try {
      if (form.logo) {
        logoUrl = await uploadLogo(form.logo);
        localStorage.setItem('logoUrl', logoUrl); // Cache logo URL
      }
      // Register or update user
      const userPayload = {
        email: form.email,
        businessProfile: {
          businessId: form.businessId,
          name: form.businessName,
          address: form.address,
          gst: form.gst,
          phone: form.phone,
          email: form.email,
          logoUrl,
          terms: form.terms,
        }
      };
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save profile');
      localStorage.setItem('businessInfo', JSON.stringify({ ...form, logoUrl }));
      setSaving(false);
      setTimeout(() => {
        setShowSummary(true);
      }, 700);
    } catch (err: any) {
      setSaving(false);
      setSaveError(err.message || 'Failed to save profile');
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  if ((showSummary || localStorage.getItem('businessInfo')) && !editing) {
    // Show profile summary after save or if profile exists
    const businessInfo = showSummary ? { ...form } : JSON.parse(localStorage.getItem('businessInfo')!);
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <ServerNavbar isLoggedIn={true} businessName={businessInfo.businessName} />
        <div className="flex-grow max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Business Profile</h2>
              <button className="btn-primary text-sm" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-2">
                <div><b>Business Name:</b> {businessInfo.businessName}</div>
                <div><b>Business ID:</b> {businessInfo.businessId}</div>
                <div><b>GST Number:</b> {businessInfo.gst}</div>
                <div><b>Address:</b> {businessInfo.address}</div>
                <div><b>Email:</b> {businessInfo.email}</div>
                <div><b>Phone:</b> {businessInfo.phone}</div>
                <div><b>Terms & Conditions:</b> {businessInfo.terms}</div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                {businessInfo.logoUrl && (
                  <img src={businessInfo.logoUrl} alt="Logo" className="h-32 rounded border mb-2" />
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <ServerNavbar isLoggedIn={true} businessName={form.businessName} />
      <div className="flex-grow max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">Business Profile</h1>
        <form className="bg-white rounded shadow p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="flex-1 space-y-2">
              <div>
                <label className="font-medium block mb-1">Business Name</label>
                <input type="text" name="businessName" value={form.businessName} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
              </div>
              <div>
                <label className="font-medium block mb-1">Business ID (auto-generated)</label>
                <input type="text" name="businessId" value={form.businessId} className="w-full border border-gray-300 rounded px-3 py-2" disabled />
              </div>
              <div>
                <label className="font-medium block mb-1">GST Number</label>
                <input type="text" name="gst" value={form.gst} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
              </div>
              <div>
                <label className="font-medium block mb-1">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="font-medium block mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
              </div>
              <div>
                <label className="font-medium block mb-1">Phone</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
              </div>
              <div>
                <label className="font-medium block mb-1">Logo</label>
                <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} className="w-full" />
                {logoPreview && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={logoPreview} alt="Logo Preview" className="h-16 rounded border" />
                    <button type="button" onClick={() => {
                      setForm(prev => ({ ...prev, logo: null, logoUrl: '', }));
                      setLogoPreview(null);
                      localStorage.removeItem('logoUrl');
                    }} className="ml-2 text-xs text-red-600 underline">Remove Logo</button>
                  </div>
                )}
                {form.logoUrl && !logoPreview && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={form.logoUrl} alt="Logo" className="h-16 rounded border" />
                    <button type="button" onClick={() => {
                      setForm(prev => ({ ...prev, logo: null, logoUrl: '', }));
                      setLogoPreview(null);
                      localStorage.removeItem('logoUrl');
                    }} className="ml-2 text-xs text-red-600 underline">Remove Logo</button>
                  </div>
                )}
              </div>
              <div>
                <label className="font-medium block mb-1">Terms & Conditions</label>
                <textarea name="terms" value={form.terms || ''} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} placeholder="Enter your business terms and conditions here..." />
                <div className="text-xs text-gray-500 mt-1">These will appear automatically on every receipt you generate.</div>
              </div>
            </div>
          </div>
          {saveError && <div className="text-red-600 mb-2">{saveError}</div>}
          <div className="flex gap-4 mt-4">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
