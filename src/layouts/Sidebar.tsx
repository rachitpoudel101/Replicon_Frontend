import { NavLink } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";

const sidebarItems = [
	{ name: 'Dashboard', path: '/dashboard' },
	{ name: 'Users', path: '/users', adminOnly: true }, // 👈 added flag
	{ name: 'Customers', path: '/customers' },
];

const Sidebar = () => {
	const { user } = useAuthStore();
	const userRole = (user?.role || '').toLowerCase();
	const allowedRolesForUsers = ['admin', 'superadmin'];
	if (!['admin', 'superadmin', 'member'].includes(userRole)) {
		console.warn('Sidebar: Unexpected userRole value:', userRole);
	}
	// Filter items based on role
	const visibleItems = sidebarItems.filter((item) => {
		if (item.adminOnly) {
			return allowedRolesForUsers.includes(userRole);
		}
		return true;
	});

	return (
		<aside className="w-64 bg-white text-black dark:bg-black dark:text-white border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
			<nav className="mt-5 px-2">
				{visibleItems.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						className={({ isActive }) =>
							`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
								isActive
									? 'bg-black text-white dark:bg-white dark:text-black'
									: 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'
							}`
						}
					>
						{item.name}
					</NavLink>
				))}
			</nav>
		</aside>
	);
};

export default Sidebar;
