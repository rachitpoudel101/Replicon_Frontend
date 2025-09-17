import { useAuthStore } from "@/stores/authStore";
import ThemeToggleBtn from "@/components/ThemeToggleBtn";

const Navbar = () => {
    const logout = useAuthStore((state) => state.logout)
  return (
    <header className="bg-white text-black dark:bg-black dark:text-white shadow w-full border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Replicon</h1>
        <div className="flex items-center gap-3">
          <ThemeToggleBtn />
          <button
            onClick={logout}
            className="bg-black text-white dark:bg-white dark:text-red-600 px-4 py-2 rounded hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors duration-200 shadow"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;