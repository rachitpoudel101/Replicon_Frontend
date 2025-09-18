import React, { useState, useEffect } from "react";
import { useUserListStore } from "../stores/userListStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import Navbar from "@/layouts/Navbar";
import Sidebar from "@/layouts/Sidebar";
import apiClient from "@/services/apiClient";
import { apiEndpoints } from "@/services/apiEndpoints";
import { FaEllipsisV } from "react-icons/fa";

const initialState = {
  id: "",
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  role: "",
  password: "",
  age: "",
  weight: "",
  height: "",
  phone: "",
  bio: "",
  gender: "",
  profile_image: "",
};

// Define a User type for better type safety
interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  password?: string;
  age?: string;
  weight?: string;
  height?: string;
  phone?: string;
  bio?: string;
  gender?: string;
  profile_image?: string;
}

const Users = () => {
  const [form, setForm] = useState(initialState);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null); // New state for file
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const actionMenuRef = React.useRef<HTMLDivElement | null>(null);
  const users = useUserListStore((state) => state.users);
  const setUsers = useUserListStore((state) => state.setUsers);

  // Simulate current user role (replace with real auth logic)
  const currentUserRole = "superadmin" as string; // or "admin", "trainer", "member"

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await apiClient.get(apiEndpoints.users.list);
        const data = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || usersRes.data.results || [];
        setUsers(data);
        setTimeout(() => {
          // Log Zustand users after update
        }, 500);
      } catch {
        // Optionally handle error
      }
    };
    fetchUsers();
  }, [setUsers]);

  // Dropdown close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActionMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenuOpen]);

  // If member, do not show the users page
  if (currentUserRole === "member") {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      // Optionally, set a preview URL in form.profile_image if needed
      setForm({ ...form, profile_image: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "profile_image" && value) formData.append(key, value);
      });
      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      }
      await apiClient.post(apiEndpoints.users.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Fetch updated users list
      const usersRes = await apiClient.get(apiEndpoints.users.list);
      const data = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.users || usersRes.data.results || [];
      setUsers(data);
      setTimeout(() => {
        // Log Zustand users after update
      }, 500);
      setSuccess("User created successfully!");
      toast.success("User created successfully!");
      setForm(initialState);
      setProfileImageFile(null); // Reset file state
      setOpen(false);
    } catch (err: unknown) {
      let errorMsg = "Unknown error";
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'detail' in err.response.data &&
        typeof (err.response.data as { detail?: string }).detail === 'string'
      ) {
        errorMsg = (err.response.data as { detail: string }).detail;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Open edit dialog and clear error/success
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setError("");
    setSuccess("");
    setEditOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-8 py-8 border-r border-gray-200 dark:border-gray-700 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300" >
          <ToastContainer />
          <div className="flex items-center float-end mb-8">
            {/* <h2 className="text-2xl font-bold text-gray-800">Users</h2> */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-4 py-2  bg-black text-white rounded hover:bg-gray-700 transition">Add User</button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-full p-8 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <DialogTitle className="mb-4 text-2xl font-bold text-center text-black dark:text-white">Create User</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-4">
                    <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                    <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  </div>
                  <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  <select name="role" value={form.role} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="trainer">Trainer</option>
                    <option value="member">Member</option>
                  </select>
                  {(form.role === "trainer" || form.role === "member") && (
                    <div className="grid grid-cols-2 gap-4">
                      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="height" placeholder="Height" value={form.height} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} className="input input-bordered w-full col-span-2 py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="profile_image" type="file" accept="image/*" onChange={handleFileChange} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                    </div>
                  )}
                  <div className="flex gap-4 mt-6 justify-center">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold">Create User</button>
                    <DialogClose asChild>
                      <button type="button" className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold">Cancel</button>
                    </DialogClose>
                  </div>
                  {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
                  {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {/* User Details Dialog */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent>
              <DialogTitle>User Details</DialogTitle>
              {selectedUser && (
                <div className="space-y-2 mt-2">
                  <div><b>Username:</b> {selectedUser.username}</div>
                  <div><b>Name:</b> {selectedUser.first_name} {selectedUser.last_name}</div>
                  <div><b>Email:</b> {selectedUser.email}</div>
                  <div><b>Role:</b> {selectedUser.role}</div>
                  {['trainer', 'member'].includes(selectedUser.role) && (
                    <>
                      <div><b>Age:</b> {selectedUser.age}</div>
                      <div><b>Weight:</b> {selectedUser.weight}</div>
                      <div><b>Height:</b> {selectedUser.height}</div>
                      <div><b>Phone:</b> {selectedUser.phone}</div>
                      <div><b>Bio:</b> {selectedUser.bio}</div>
                      <div><b>Gender:</b> {selectedUser.gender}</div>
                      <div><b>Profile Image:</b> {selectedUser.profile_image && (typeof selectedUser.profile_image === 'string' ? <img src={selectedUser.profile_image} alt="Profile" className="w-16 h-16 object-cover rounded" /> : <span>[Image uploaded]</span>)}</div>
                    </>
                  )}
                </div>
              )}
              <DialogClose asChild>
                <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Close</button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          {/* Edit User Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogTitle>Edit User</DialogTitle>
              {selectedUser && (
                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  setSuccess("");
                  // Validation for required fields
                  const requiredFields = [
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "role"
                  ];
                  const missingFields: string[] = [];
                  requiredFields.forEach((field) => {
                    if (!selectedUser[field as keyof User]) missingFields.push(field);
                  });
                  if (["trainer", "member"].includes(selectedUser.role)) {
                    const additionalFields = [
                      "age",
                      "weight",
                      "height",
                      "phone",
                      "bio",
                      "gender"
                    ];
                    additionalFields.forEach((field) => {
                      if (!selectedUser[field as keyof User]) missingFields.push(field);
                    });
                  }
                  if (missingFields.length > 0) {
                    const errorMsg = `Required fields missing: ${missingFields.join(", ")}`;
                    setError(errorMsg);
                    toast.error(errorMsg);
                    return;
                  }
                  try {
                    const formData = new FormData();
                    Object.entries(selectedUser).forEach(([key, value]) => {
                      if (key !== "profile_image" && key !== "password" && value) formData.append(key, value as string);
                    });
                    // Only send password if user entered a new one
                    if (selectedUser.password) {
                      formData.append("password", selectedUser.password);
                    }
                    if (profileImageFile) {
                      formData.append("profile_image", profileImageFile);
                    }
                    await apiClient.patch(apiEndpoints.users.update(selectedUser.id), formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    const usersRes = await apiClient.get(apiEndpoints.users.list);
                    const data = Array.isArray(usersRes.data)
                      ? usersRes.data
                      : usersRes.data.users || usersRes.data.results || [];
                    setUsers(data);
                    setSuccess("User updated successfully!");
                    toast.success("User updated successfully!");
                    setEditOpen(false);
                  } catch (err: unknown) {
                    let errorMsg = "Unknown error";
                    if (
                      typeof err === 'object' &&
                      err !== null &&
                      'response' in err &&
                      typeof (err as { response?: unknown }).response === 'object' &&
                      (err as { response?: { data?: unknown } }).response &&
                      'data' in (err as { response: { data?: unknown } }).response
                    ) {
                      const data = (err as { response: { data: unknown } }).response.data;
                      if (typeof data === 'string') {
                        errorMsg = data;
                      } else if (typeof data === 'object') {
                        errorMsg = JSON.stringify(data);
                      }
                    } else if (err instanceof Error) {
                      errorMsg = err.message;
                    }
                    setError(errorMsg);
                    toast.error(errorMsg);
                  }
                }}>
                  <div className="flex gap-4">
                    <input name="first_name" placeholder="First Name" value={selectedUser.first_name} onChange={e => setSelectedUser({ ...selectedUser, first_name: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                    <input name="last_name" placeholder="Last Name" value={selectedUser.last_name} onChange={e => setSelectedUser({ ...selectedUser, last_name: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  </div>
                  <input name="username" placeholder="Username" value={selectedUser.username} onChange={e => setSelectedUser({ ...selectedUser, username: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  <input name="email" placeholder="Email" value={selectedUser.email} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                  <select name="role" value={selectedUser.role} onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="trainer">Trainer</option>
                    <option value="member">Member</option>
                  </select>
                  {(selectedUser.role === "trainer" || selectedUser.role === "member") && (
                    <div className="grid grid-cols-2 gap-4">
                      <input name="age" placeholder="Age" value={selectedUser.age || ""} onChange={e => setSelectedUser({ ...selectedUser, age: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="weight" placeholder="Weight" value={selectedUser.weight || ""} onChange={e => setSelectedUser({ ...selectedUser, weight: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="height" placeholder="Height" value={selectedUser.height || ""} onChange={e => setSelectedUser({ ...selectedUser, height: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="phone" placeholder="Phone" value={selectedUser.phone || ""} onChange={e => setSelectedUser({ ...selectedUser, phone: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="bio" placeholder="Bio" value={selectedUser.bio || ""} onChange={e => setSelectedUser({ ...selectedUser, bio: e.target.value })} className="input input-bordered w-full col-span-2 py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="gender" placeholder="Gender" value={selectedUser.gender || ""} onChange={e => setSelectedUser({ ...selectedUser, gender: e.target.value })} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                      <input name="profile_image" type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setProfileImageFile(e.target.files[0]); }} className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" />
                    </div>
                  )}
                  <div className="flex gap-4 mt-6 justify-center">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold">Save Changes</button>
                    <DialogClose asChild>
                      <button type="button" className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold">Cancel</button>
                    </DialogClose>
                  </div>
                  {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
                  {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
                </form>
              )}
            </DialogContent>
          </Dialog>
          {/* Delete User Dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogTitle>Delete User</DialogTitle>
              {selectedUser && (
                <div className="space-y-4">
                  <div>Are you sure you want to delete user <b>{selectedUser.username}</b>?</div>
                  <div className="flex gap-4 mt-6 justify-center">
                    <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold" onClick={async () => {
                      setError("");
                      setSuccess("");
                      try {
                        await apiClient.delete(apiEndpoints.users.delete(selectedUser.id));
                        const usersRes = await apiClient.get(apiEndpoints.users.list);
                        const data = Array.isArray(usersRes.data)
                          ? usersRes.data
                          : usersRes.data.users || usersRes.data.results || [];
                        setUsers(data);
                        setSuccess("User deleted successfully!");
                        toast.success("User deleted successfully!");
                        setDeleteOpen(false);
                      } catch (err: unknown) {
                        let errorMsg = "Unknown error";
                        if (
                          typeof err === 'object' &&
                          err !== null &&
                          'response' in err &&
                          typeof (err as { response?: unknown }).response === 'object' &&
                          (err as { response?: { data?: unknown } }).response &&
                          'data' in (err as { response: { data?: unknown } }).response
                        ) {
                          const data = (err as { response: { data: unknown } }).response.data;
                          if (typeof data === 'string') {
                            errorMsg = data;
                          } else if (typeof data === 'object') {
                            errorMsg = JSON.stringify(data);
                          }
                        } else if (err instanceof Error) {
                          errorMsg = err.message;
                        }
                        setError(errorMsg);
                        toast.error(errorMsg);
                      }
                    }}>Delete</button>
                    <DialogClose asChild>
                      <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold">Cancel</button>
                    </DialogClose>
                  </div>
                  {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
                  {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
                </div>
              )}
            </DialogContent>
          </Dialog>
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white text-center">Users List</h3>
            <div className="rounded shadow p-4 w-full max-w-6xl overflow-x-auto bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <Table className = "bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 w-full text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black dark:text-white px-6 py-4 text-lg">S.N.</TableHead>
                    <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Username</TableHead>
                    <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Name</TableHead>
                    <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Role</TableHead>
                    <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Email</TableHead>
                    <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(currentUserRole === "superadmin" || currentUserRole === "admin"
                    ? users
                    : currentUserRole === "trainer"
                    ? users.filter((u) => u.role === "member")
                    : []
                  ).map((u, idx) => {
                    const canEditOrDelete =
                      currentUserRole === "superadmin" ||
                      currentUserRole === "admin";
                    return (
                      <TableRow key={u.id} className="text-black dark:text-white text-base relative">
                        <TableCell className="text-black dark:text-white px-6 py-4 text-base">{idx + 1}</TableCell>
                        <TableCell className="text-black dark:text-white px-6 py-4 text-base">{u.username}</TableCell>
                        <TableCell className="text-black dark:text-white px-6 py-4 text-base">{u.first_name} {u.last_name}</TableCell>
                        <TableCell className="text-black dark:text-white px-6 py-4 text-base">{u.role}</TableCell>
                        <TableCell className="text-black dark:text-white px-6 py-4 text-base">{u.email}</TableCell>
                        <TableCell className="px-6 py-4 relative">
                          <button
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                            onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                            type="button"
                          >
                            <FaEllipsisV />
                          </button>
                          {actionMenuOpen === u.id && (
                            <div ref={actionMenuRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setViewOpen(true);
                                  setActionMenuOpen(null);
                                }}
                              >
                                View
                              </button>
                              {canEditOrDelete && (
                                <>
                                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
                                    onClick={() => {
                                      openEditDialog(u);
                                      setActionMenuOpen(null);
                                    }}
                                  >Edit</button>
                                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setDeleteOpen(true);
                                      setActionMenuOpen(null);
                                    }}
                                  >Delete</button>
                                </>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;
