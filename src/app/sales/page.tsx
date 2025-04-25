"use client";


import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FaFileDownload } from 'react-icons/fa';

export default function SalesPage() {
  const [salesData, setSalesData] = useState<any>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales (₹)',
        data: [12000, 15000, 8000, 19000, 22000, 17000],
        backgroundColor: 'rgba(34,197,94,0.6)',
      },
    ],
  });

  useEffect(() => {
    // Fetch sales data from backend (mocked for now)
    // setSalesData({
    //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //   datasets: [
    //     {
    //       label: 'Sales (₹)',
    //       data: [12000, 15000, 8000, 19000, 22000, 17000],
    //       backgroundColor: 'rgba(34,197,94,0.6)',
    //     },
    //   ],
    // });
  }, []);

  function handleExportCSV() {
    const rows = [
      ['Month', 'Sales'],
      ...salesData.labels.map((label: string, i: number) => [label, salesData.datasets[0].data[i]])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(",")).join("\n");
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = 'sales.csv';
    a.click();
  }

  return (
    <div>
      <ServerNavbar isLoggedIn={true} businessName="Sample Business Ltd." />
      <main className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Sales Analytics</h1>
        {salesData ? (
          <Bar data={salesData} options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Monthly Sales' },
            },
          }} />
        ) : (
          <div>Loading...</div>
        )}
        <button className="btn-primary flex items-center mt-6" onClick={handleExportCSV}>
          <FaFileDownload className="mr-2" /> Export CSV
        </button>
      </main>
      <Footer />
    </div>
  );
}
