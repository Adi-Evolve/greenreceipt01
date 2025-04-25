"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode.react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';

export default function PublicReceiptPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/receipts/${id}`)
      .then(res => res.json())
      .then(setReceipt);
  }, [id]);

  if (!receipt) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <ServerNavbar isLoggedIn={false} />
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Receipt #{receipt.code}</h1>
        <div className="bg-white rounded shadow p-6 mb-4">
          <div className="mb-2 font-semibold">Customer: {receipt.customerName}</div>
          <div className="mb-2">Date: {new Date(receipt.date).toLocaleDateString()}</div>
          <div className="mb-2">Amount: ₹{receipt.amount}</div>
          <div className="mb-2">Business: {receipt.businessName}</div>
          {/* Add more receipt details as needed */}
        </div>
        <div className="mt-8">
          <QRCode value={typeof window !== 'undefined' ? window.location.href : ''} size={128} />
          <div className="text-xs mt-2 text-gray-500">Scan to view this receipt online</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
