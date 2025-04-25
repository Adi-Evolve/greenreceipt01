"use client";

import React, { useState } from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import { MdLocalOffer, MdAdd } from 'react-icons/md';

interface Offer {
  id: string;
  title: string;
  description: string;
  validTill: string;
}

const SAMPLE_OFFERS: Offer[] = [
  { id: '1', title: 'Summer Discount', description: 'Get 10% off on all products!', validTill: '2025-06-30' },
  { id: '2', title: 'Festive Offer', description: 'Buy 2 get 1 free on select items.', validTill: '2025-12-31' },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(SAMPLE_OFFERS);
  const [showForm, setShowForm] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', validTill: '' });

  function handleAddOffer(e: React.FormEvent) {
    e.preventDefault();
    setOffers(prev => [...prev, { ...newOffer, id: String(Date.now()) }]);
    setShowForm(false);
    setNewOffer({ title: '', description: '', validTill: '' });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MdLocalOffer className="text-3xl text-yellow-600" /> Offers & Promotions
          </h1>
          <button className="btn-primary flex items-center mb-4" onClick={() => setShowForm(v => !v)}>
            <MdAdd className="mr-2" /> {showForm ? 'Cancel' : 'Add Offer'}
          </button>
          {showForm && (
            <form className="bg-white rounded shadow p-4 mb-4" onSubmit={handleAddOffer}>
              <input className="border p-2 mb-2 w-full" placeholder="Title" value={newOffer.title} onChange={e => setNewOffer(o => ({ ...o, title: e.target.value }))} required />
              <textarea className="border p-2 mb-2 w-full" placeholder="Description" value={newOffer.description} onChange={e => setNewOffer(o => ({ ...o, description: e.target.value }))} required />
              <input className="border p-2 mb-2 w-full" type="date" value={newOffer.validTill} onChange={e => setNewOffer(o => ({ ...o, validTill: e.target.value }))} required />
              <button className="btn-primary" type="submit">Save Offer</button>
            </form>
          )}
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="bg-white rounded shadow p-4">
                <div className="font-semibold text-lg flex items-center gap-2">
                  <MdLocalOffer className="text-xl text-yellow-600" /> {offer.title}
                </div>
                <div className="text-gray-700 mb-2">{offer.description}</div>
                <div className="text-xs text-gray-500">Valid Till: {offer.validTill}</div>
              </div>
            ))}
            {offers.length === 0 && <div className="text-gray-500">No offers available.</div>}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
