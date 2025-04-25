import React from 'react';
import ServerNavbar from '@/components/ServerNavbar';
import Footer from '@/components/Footer';

export default function DraftsPage() {
  // This will later fetch drafts from local storage or MongoDB
  type Draft = {
    id: string;
    lastEdited: string;
  };
  const drafts: Draft[] = [];
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <ServerNavbar isLoggedIn={true} />
      <div className="flex-grow max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">Draft Receipts</h1>
        {drafts.length === 0 ? (
          <div className="text-center text-gray-500">No drafts yet. Start creating a bill and your drafts will appear here.</div>
        ) : (
          <ul className="space-y-4">
            {drafts.map((draft, idx) => (
              <li key={idx} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <span>Draft #{draft.id} - Last edited: {draft.lastEdited}</span>
                <button className="btn-primary">Resume</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </main>
  );
}
