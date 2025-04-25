import Link from 'next/link';
import React, { useEffect, useState } from "react";

interface ServerNavbarProps {
  isLoggedIn?: boolean;
  businessName?: string;
}

const ServerNavbar = ({ isLoggedIn = false, businessName }: ServerNavbarProps) => {
  return (
    <nav className="bg-primary-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-2">
                <span className="text-primary-500 font-bold text-lg">GR</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Green Receipt</span>
            </Link>
          </div>
          {/* Only profile, create bill design, recent receipts */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/create-bill-design" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
            >
              Create Bill Design
            </Link>
            <Link 
              href="/recent-receipts" 
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
            >
              Recent Receipts
            </Link>
            <div className="ml-4 flex items-center space-x-2">
              {/* Hydration-safe business name display */}
              <BusinessNameDisplay businessName={businessName} />
              <Link 
                href="/profile" 
                className="bg-primary-600 p-2 rounded-full hover:bg-primary-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hydration-safe business name component
function BusinessNameDisplay({ businessName: propBusinessName }: { businessName?: string }) {
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const bizInfo = localStorage.getItem("businessInfo");
      if (bizInfo) {
        const parsed = JSON.parse(bizInfo);
        setBusinessName(parsed.businessName || propBusinessName || "Business User");
      } else {
        setBusinessName(propBusinessName || "Business User");
      }
    } catch {
      setBusinessName(propBusinessName || "Business User");
    }
  }, [propBusinessName]);

  if (businessName === null) {
    return null; // Optionally render a spinner or placeholder
  }
  return <span className="text-sm font-medium">{businessName}</span>;
}

export default ServerNavbar;