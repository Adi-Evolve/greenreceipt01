"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReceiptPreview from './ReceiptPreview';
import QRCode from 'qrcode.react';

// Define interfaces for our data structures
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  gst: number;
  amount: number;
}

interface ReceiptData {
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  customerId: string;
  date: string;
  products: Product[];
  subtotal: number;
  gstTotal: number;
  total: number;
  termsAndConditions: string;
  warrantyDays: number;
  returnDays: number;
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst: string;
    businessId: string;
  };
}

const ReceiptEditor = () => {
  // State for receipt data
  const [receipt, setReceipt] = useState<ReceiptData>({
    receiptNumber: `GR-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: '',
    customerPhone: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    products: [
      {
        id: '1',
        name: '',
        price: 0,
        quantity: 1,
        gst: 18,
        amount: 0
      }
    ],
    subtotal: 0,
    gstTotal: 0,
    total: 0,
    termsAndConditions: 'Thank you for your business. All items are subject to our standard return policy.',
    warrantyDays: 30,
    returnDays: 7,
    businessInfo: {
      name: 'Sample Business Ltd.',
      address: '123 Business Street, City, State, PIN',
      phone: '1234567890',
      email: 'business@example.com',
      gst: '27AADCB2230M1ZT',
      businessId: '123456'
    }
  });

  // State for column configuration
  const [columns, setColumns] = useState({
    product: true,
    quantity: true,
    gst: true,
    price: true,
    amount: true
  });

  // State for elements visibility
  const [elements, setElements] = useState({
    logo: true,
    businessInfo: true,
    customerInfo: true,
    termsAndConditions: true,
    warranty: true,
    qrCode: true
  });

  // State for preview mode
  const [showPreview, setShowPreview] = useState(false);
  
  // State for QR Code
  const [qrValue, setQrValue] = useState('');

  // Calculate totals whenever products change
  useEffect(() => {
    const calculatedProducts = receipt.products.map(product => ({
      ...product,
      amount: product.price * product.quantity * (1 + product.gst / 100)
    }));
    
    const subtotal = calculatedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const gstTotal = calculatedProducts.reduce((sum, product) => sum + (product.price * product.quantity * (product.gst / 100)), 0);
    const total = subtotal + gstTotal;
    
    setReceipt(prev => ({
      ...prev,
      products: calculatedProducts,
      subtotal,
      gstTotal,
      total
    }));
    
    // Generate QR code value (JSON of receipt data)
    setQrValue(JSON.stringify({
      receipt: receipt.receiptNumber,
      business: receipt.businessInfo.name,
      businessId: receipt.businessInfo.businessId,
      customer: receipt.customerName,
      total: total.toFixed(2),
      date: receipt.date
    }));
  }, [receipt.products, receipt.customerName, receipt.date]);

  // Handle input change for receipt fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like businessInfo.name
      const [parent, child] = name.split('.');
      setReceipt(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level properties
      setReceipt(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle product change
  const handleProductChange = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = [...receipt.products];
    
    // Convert string values to numbers for numerical fields
    if (field === 'price' || field === 'quantity' || field === 'gst') {
      updatedProducts[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    } else {
      (updatedProducts[index] as any)[field] = value;
    }
    
    setReceipt(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };

  // Add a new product row
  const addProduct = () => {
    setReceipt(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: `${prev.products.length + 1}`,
          name: '',
          price: 0,
          quantity: 1,
          gst: 18,
          amount: 0
        }
      ]
    }));
  };

  // Remove a product row
  const removeProduct = (index: number) => {
    if (receipt.products.length > 1) {
      const updatedProducts = [...receipt.products];
      updatedProducts.splice(index, 1);
      
      setReceipt(prev => ({
        ...prev,
        products: updatedProducts
      }));
    }
  };

  // Toggle column visibility
  const toggleColumn = (column: keyof typeof columns) => {
    setColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Toggle element visibility
  const toggleElement = (element: keyof typeof elements) => {
    setElements(prev => ({
      ...prev,
      [element]: !prev[element]
    }));
  };

  // Handle saving the receipt
  const saveReceipt = () => {
    // In a real app, this would save to the database
    alert('Receipt saved successfully!');
    // Here you would typically make an API call to save the receipt
  };

  // Handle saving as draft
  const saveAsDraft = () => {
    // In a real app, this would save to localStorage or database as a draft
    localStorage.setItem('receiptDraft', JSON.stringify(receipt));
    alert('Receipt saved as draft!');
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {!showPreview ? (
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Receipt Details</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="bg-primary-100 text-primary-700 px-4 py-2 rounded-md hover:bg-primary-200 transition-colors"
              >
                Preview Receipt
              </button>
              <button
                type="button"
                onClick={saveAsDraft}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={saveReceipt}
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
              >
                Save Receipt
              </button>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Elements</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.entries(elements).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`element-${key}`}
                    checked={value}
                    onChange={() => toggleElement(key as keyof typeof elements)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`element-${key}`} className="ml-2 text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {elements.businessInfo && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="businessInfo.name" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="businessInfo.name"
                      id="businessInfo.name"
                      value={receipt.businessInfo.name}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="businessInfo.gst" className="block text-sm font-medium text-gray-700">
                    GST Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="businessInfo.gst"
                      id="businessInfo.gst"
                      value={receipt.businessInfo.gst}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="businessInfo.address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="businessInfo.address"
                      id="businessInfo.address"
                      value={receipt.businessInfo.address}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="businessInfo.phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="businessInfo.phone"
                      id="businessInfo.phone"
                      value={receipt.businessInfo.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="businessInfo.email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="businessInfo.email"
                      id="businessInfo.email"
                      value={receipt.businessInfo.email}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {elements.customerInfo && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="customerName"
                      id="customerName"
                      value={receipt.customerName}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                    Customer Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="customerPhone"
                      id="customerPhone"
                      value={receipt.customerPhone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                    Customer ID (10-digit)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="customerId"
                      id="customerId"
                      value={receipt.customerId}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter customer's 10-digit ID"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={receipt.date}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={addProduct}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={() => {
                    document.getElementById('columnsDropdown')?.classList.toggle('hidden');
                  }}
                >
                  Customize Columns
                </button>
                <div id="columnsDropdown" className="absolute right-0 mt-10 w-48 bg-white shadow-lg rounded-md hidden z-10">
                  <div className="p-2">
                    {Object.entries(columns).map(([key, value]) => (
                      <div key={key} className="flex items-center p-2">
                        <input
                          type="checkbox"
                          id={`column-${key}`}
                          checked={value}
                          onChange={() => toggleColumn(key as keyof typeof columns)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`column-${key}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {key}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    {columns.product && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                    )}
                    {columns.quantity && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                    )}
                    {columns.price && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    )}
                    {columns.gst && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST %
                      </th>
                    )}
                    {columns.amount && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    )}
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipt.products.map((product, index) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      {columns.product && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                            placeholder="Enter product name"
                          />
                        </td>
                      )}
                      {columns.quantity && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={product.quantity}
                            min="1"
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                          />
                        </td>
                      )}
                      {columns.price && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={product.price}
                            min="0"
                            step="0.01"
                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                          />
                        </td>
                      )}
                      {columns.gst && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={product.gst}
                            min="0"
                            step="0.01"
                            onChange={(e) => handleProductChange(index, 'gst', e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                          />
                        </td>
                      )}
                      {columns.amount && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{product.amount.toFixed(2)}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-900"
                          disabled={receipt.products.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  <tr>
                    <td colSpan={columns.product ? 2 : 1} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Subtotal:
                    </td>
                    <td colSpan={columns.quantity ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={columns.price ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={columns.gst ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={(columns.amount ? 1 : 0) + 1} className="px-6 py-4 text-sm text-gray-900">
                      ₹{receipt.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={columns.product ? 2 : 1} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      GST:
                    </td>
                    <td colSpan={columns.quantity ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={columns.price ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={columns.gst ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={(columns.amount ? 1 : 0) + 1} className="px-6 py-4 text-sm text-gray-900">
                      ₹{receipt.gstTotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={columns.product ? 2 : 1} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      Total:
                    </td>
                    <td colSpan={columns.quantity ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={columns.price ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={columns.gst ? 1 : 0} className="px-6 py-4"></td>
                    <td colSpan={(columns.amount ? 1 : 0) + 1} className="px-6 py-4 text-lg font-bold text-gray-900">
                      ₹{receipt.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {elements.termsAndConditions && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
              <div>
                <label htmlFor="termsAndConditions" className="sr-only">Terms and Conditions</label>
                <textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  rows={3}
                  value={receipt.termsAndConditions}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
          )}
          
          {elements.warranty && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Warranty & Return Policy</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="warrantyDays" className="block text-sm font-medium text-gray-700">
                    Warranty Period (days)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="warrantyDays"
                      id="warrantyDays"
                      min="0"
                      value={receipt.warrantyDays}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="returnDays" className="block text-sm font-medium text-gray-700">
                    Return Period (days)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="returnDays"
                      id="returnDays"
                      min="0"
                      value={receipt.returnDays}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {elements.qrCode && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Preview</h3>
              <div className="flex justify-center">
                <div className="p-4 bg-white border border-gray-200 rounded-md">
                  <QRCode value={qrValue} size={150} />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                This QR code will be included in the receipt and can be scanned by customers.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <ReceiptPreview 
            receipt={receipt} 
            elements={elements} 
            columns={columns} 
          />
          <div className="p-6 bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Edit Receipt
            </button>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-primary-100 text-primary-700 px-4 py-2 rounded-md hover:bg-primary-200 transition-colors"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={saveReceipt}
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
              >
                Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptEditor; 