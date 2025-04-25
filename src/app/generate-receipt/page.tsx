"use client";

import React, { useEffect, useState } from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  quantity: number;
  gst: number;
  price: number;
  amount: number;
  discount?: number;
}

interface ReceiptFormat {
  columns: {
    product: boolean;
    quantity: boolean;
    gst: boolean;
    price: boolean;
    amount: boolean;
    serial?: boolean;
    discount?: boolean;
  };
  elements: {
    logo: boolean;
    businessInfo: boolean;
    customerInfo: boolean;
    termsAndConditions: boolean;
    warranty: boolean;
    qrCode: boolean;
    signature?: boolean;
    notes?: boolean;
  };
  font?: string;
  color?: string;
  layout?: string;
  showBorder?: boolean;
  showGrid?: boolean;
  preview?: boolean;
}

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  businessId: string;
  logoUrl?: string;
  terms?: string;
}

const defaultFormat: ReceiptFormat = {
  columns: {
    product: true,
    quantity: true,
    gst: true,
    price: true,
    amount: true,
  },
  elements: {
    logo: true,
    businessInfo: true,
    customerInfo: true,
    termsAndConditions: false, // hide from receipt form
    warranty: true,
    qrCode: true,
  },
};

const defaultBusinessInfo: BusinessInfo = {
  name: '',
  address: '',
  phone: '',
  email: '',
  gst: '',
  businessId: '',
  terms: '',
};

export default function GenerateReceiptPage() {
  const [format, setFormat] = useState<ReceiptFormat>(defaultFormat);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [products, setProducts] = useState<Product[]>([{
    id: '1', name: '', price: 0, quantity: 1, gst: 0, amount: 0
  }]);
  const [customerId, setCustomerId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState('');
  const [warranty, setWarranty] = useState('');
  const [returnDays, setReturnDays] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);

  useEffect(() => {
    // Load format from localStorage
    const savedFormat = localStorage.getItem('receiptFormat');
    if (savedFormat) setFormat(JSON.parse(savedFormat));
    // Load business info from localStorage
    const savedBiz = localStorage.getItem('businessInfo');
    let bizId = '';
    if (savedBiz) {
      const info = JSON.parse(savedBiz);
      setBusinessInfo(info);
      bizId = info.businessId;
      localStorage.setItem('businessId', info.businessId);
    } else {
      bizId = localStorage.getItem('businessId') || '';
    }
    setReceiptNumber(`GR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setDate(new Date().toISOString().split('T')[0]);
    // Fetch customers and products for this business
    if (bizId) {
      fetch(`http://localhost:3000/api/customers/${bizId}`)
        .then(res => res.json())
        .then(data => setCustomers(data || []));
      fetch(`http://localhost:3000/api/products/${bizId}`)
        .then(res => res.json())
        .then(data => setProductsList(data || []));
    }
  }, []);

  useEffect(() => {
    // Update QR value whenever receipt changes
    const total = products.reduce((sum, p) => sum + p.price * p.quantity * (format.columns.gst ? (1 + p.gst/100) : 1), 0);
    setQrValue(JSON.stringify({
      receiptNumber,
      businessId: businessInfo.businessId,
      businessName: businessInfo.name,
      customerId,
      products,
      total: total.toFixed(2),
      date
    }));
  }, [products, customerId, receiptNumber, businessInfo, date, format]);

  // Handle customer input (ID only, numeric)
  function handleCustomerIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '');
    setCustomerId(val);
  }

  // Product input with suggestion dropdown
  function handleProductNameChange(idx: number, value: string) {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, name: value } : p));
    if (value.length > 0) {
      const suggestions = productsList.filter(prod => prod.name.toLowerCase().includes(value.toLowerCase()));
      setProductSuggestions(suggestions);
    } else {
      setProductSuggestions([]);
    }
  }
  function handleSelectProductSuggestion(idx: number, prod: any) {
    setProducts(prev => prev.map((p, i) => i === idx ? {
      ...p,
      name: prod.name,
      price: prod.price,
      gst: prod.gst || 0,
      id: prod.id
    } : p));
    setProductSuggestions([]);
  }
  function handleProductListChange(idx: number, field: keyof Product, value: string | number) {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  }
  function addProduct() {
    setProducts(prev => [...prev, { id: '', name: '', price: 0, quantity: 1, gst: 0, amount: 0 }]);
  }
  function removeProduct(idx: number) {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSaveReceipt(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const total = products.reduce((sum, p) => sum + p.price * p.quantity * (format.columns.gst ? (1 + p.gst/100) : 1), 0);
    const receiptData = {
      businessId: businessInfo.businessId,
      receiptNumber,
      customerId,
      products,
      total,
      date,
      terms: businessInfo.terms || '',
      qrValue
    };
    fetch('http://localhost:3000/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData),
    })
      .then(async res => {
        const data = await res.json();
        setSaving(false);
        if (!res.ok || data.error) setSaveError(data.error || 'Failed to save receipt');
        else setSaveSuccess(true);
      })
      .catch(err => {
        setSaving(false);
        setSaveError('Error saving receipt: ' + err.message);
      });
  }

  function handleDownloadPDF() {
    const doc = new jsPDF();
    doc.setFont(format.font || 'Arial');
    doc.setTextColor(format.color || '#000000');
    doc.text(businessInfo.name || 'Business Name', 14, 15);
    doc.text(businessInfo.address || '', 14, 22);
    doc.text(businessInfo.phone || '', 14, 29);
    doc.text(businessInfo.email || '', 14, 36);
    doc.text('Receipt No: ' + receiptNumber, 150, 15);
    doc.text('Date: ' + date, 150, 22);
    const columns = Object.entries(format.columns).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    const dataRows = products.map((p, idx) => {
      return columns.map(col => {
        if (col === 'Serial') return idx + 1;
        if (col === 'Product') return p.name;
        if (col === 'Quantity') return p.quantity;
        if (col === 'GST') return p.gst;
        if (col === 'Price') return p.price;
        if (col === 'Amount') return (p.price * p.quantity * (format.columns.gst ? (1 + p.gst/100) : 1)).toFixed(2);
        if (col === 'Discount') return p.discount || 0;
        return '';
      });
    });
    doc.autoTable({
      head: [columns],
      body: dataRows,
      startY: 45,
      theme: format.showGrid ? 'grid' : 'plain',
      styles: { font: format.font || 'Arial', textColor: format.color || '#000000' },
      tableLineWidth: format.showBorder ? 0.1 : 0,
    });
    let y = 55;
    if (doc.lastAutoTable && typeof doc.lastAutoTable.finalY === 'number') {
      y = doc.lastAutoTable.finalY + 10;
    }
    if (format.elements.termsAndConditions && businessInfo.terms) {
      doc.text('Terms: ' + businessInfo.terms, 14, y);
      y += 7;
    }
    if (format.elements.notes) {
      doc.text('Notes: Sample notes here...', 14, y);
      y += 7;
    }
    if (format.elements.signature) {
      doc.text('Signature: ___________________', 14, y);
      y += 7;
    }
    doc.save(`receipt_${receiptNumber}.pdf`);
  }

  // Calculate subtotal, gst, total
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const gstTotal = format.columns.gst ? products.reduce((sum, p) => sum + (p.price * p.quantity * (p.gst/100)), 0) : 0;
  const total = subtotal + gstTotal;

  return (
    <main className="min-h-screen flex flex-col">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-6">Generate Receipt</h1>
          <form className="space-y-6" onSubmit={handleSaveReceipt}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Receipt Number</label>
                <input type="text" value={receiptNumber} readOnly className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" />
              </div>
              <div>
                <label className="block font-medium mb-1">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Customer ID</label>
              <input type="number" value={customerId} onChange={handleCustomerIdChange} className="w-full border border-gray-300 rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Products</label>
              <table className="min-w-full border border-gray-300 rounded">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Product</th>
                    <th className="px-2 py-1">Qty</th>
                    {format.columns.gst && <th className="px-2 py-1">GST (%)</th>}
                    <th className="px-2 py-1">Price</th>
                    <th className="px-2 py-1">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={idx}>
                      <td className="relative">
                        <input
                          type="text"
                          value={p.name}
                          onChange={e => handleProductNameChange(idx, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-32"
                          autoComplete="off"
                        />
                        {productSuggestions.length > 0 && p.name && (
                          <ul className="absolute z-10 bg-white border border-gray-300 rounded w-32 mt-1 max-h-32 overflow-y-auto">
                            {productSuggestions.map(prod => (
                              <li
                                key={prod.id}
                                className="px-2 py-1 hover:bg-primary-100 cursor-pointer"
                                onClick={() => handleSelectProductSuggestion(idx, prod)}
                              >
                                {prod.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td><input type="number" min={1} value={p.quantity} onChange={e => handleProductListChange(idx, 'quantity', Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 w-16" required /></td>
                      {format.columns.gst && <td><input type="number" min={0} value={p.gst} onChange={e => handleProductListChange(idx, 'gst', Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 w-16" /></td>}
                      <td><input type="number" min={0} value={p.price} onChange={e => handleProductListChange(idx, 'price', Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 w-20" required /></td>
                      <td className="text-right">₹{(p.price * p.quantity * (format.columns.gst ? (1 + p.gst/100) : 1)).toFixed(2)}</td>
                      <td><button type="button" onClick={() => removeProduct(idx)} className="text-red-500">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addProduct} className="btn-primary mt-2">Add Product</button>
            </div>
            <div className="flex justify-end gap-6 text-right">
              <div>
                <div className="text-sm">Subtotal: <span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
                {format.columns.gst && <div className="text-sm">GST: <span className="font-semibold">₹{gstTotal.toFixed(2)}</span></div>}
                <div className="text-lg font-bold">Total: ₹{total.toFixed(2)}</div>
              </div>
            </div>
            {format.elements.warranty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Warranty (days)</label>
                  <input type="number" value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Return Period (days)</label>
                  <input type="number" value={returnDays} onChange={e => setReturnDays(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              </div>
            )}
            {format.elements.qrCode && (
              <div className="flex flex-col items-center mt-4">
                <QRCode value={qrValue} size={150} />
                <div className="text-xs text-gray-500 mt-2">Scan to view receipt details</div>
              </div>
            )}
            {businessInfo.terms && (
              <div className="bg-gray-100 rounded p-3 mt-4 text-xs text-gray-700">
                <strong>Terms & Conditions:</strong> {businessInfo.terms}
              </div>
            )}
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save & Generate Receipt'}</button>
              <button className="btn-primary mt-4" onClick={handleDownloadPDF}>Download PDF</button>
            </div>
            {saveSuccess && <div className="text-green-600 mt-2">Receipt saved successfully!</div>}
            {saveError && <div className="text-red-600 mt-2">{saveError}</div>}
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}
