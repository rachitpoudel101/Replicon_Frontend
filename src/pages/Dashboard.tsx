import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import Sidebar from "@/layouts/Sidebar";
import Navbar from "@/layouts/Navbar";


const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const fetchSelf = useAuthStore((state) => state.fetchSelf);

  useEffect(() => {
    fetchSelf();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-white text-black dark:bg-black dark:text-white border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="bg-gray-100 dark:bg-zinc-900 shadow rounded-lg p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-2">Welcome{user?.username ? `, ${user.username}` : ''}!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">This is your dashboard. Here you can manage your account and view important information.</p>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-4 transition-colors duration-300">
                  <h3 className="font-semibold text-lg mb-1">User Info</h3>
                  <p><span className="font-medium">Name:</span> {user?.username || 'N/A'}</p>
                  <p><span className="font-medium">Role:</span> {user?.role || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

