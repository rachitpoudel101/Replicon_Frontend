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
  const users = useUserListStore((state) => state.users);
  const setUsers = useUserListStore((state) => state.setUsers);

  // Simulate current user role (replace with real auth logic)
  const currentUserRole = "superadmin" as string; // or "admin", "trainer", "member"

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await apiClient.get(apiEndpoints.users.list);
        console.log('Fetched users response:', usersRes.data); // Debug log
        const data = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || usersRes.data.results || [];
        console.log('Setting users in Zustand:', data); // Debug log
        setUsers(data);
        setTimeout(() => {
          // Log Zustand users after update
          console.log('Zustand users after setUsers:', useUserListStore.getState().users);
        }, 500);
      } catch {
        // Optionally handle error
      }
    };
    fetchUsers();
  }, [setUsers]);

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
      console.log('Fetched users response after create:', usersRes.data); // Debug log
      const data = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.users || usersRes.data.results || [];
      console.log('Setting users in Zustand after create:', data); // Debug log
      setUsers(data);
      setTimeout(() => {
        // Log Zustand users after update
        console.log('Zustand users after setUsers (create):', useUserListStore.getState().users);
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar userRole={currentUserRole || 'member'} />
        <main className="flex-1 px-8 py-8 border-r border-gray-200 dark:border-gray-700 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300" >
          <ToastContainer />
          <div className="flex items-center float-end mb-8">
            {/* <h2 className="text-2xl font-bold text-gray-800">Users</h2> */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-4 py-2  bg-black text-white rounded hover:bg-gray-700 transition">Add User</button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="mb-4">Create User</DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-3">
                    <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="input input-bordered w-full" />
                    <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="input input-bordered w-full" />
                  </div>
                  <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="input input-bordered w-full" />
                  <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input input-bordered w-full" />
                  <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} className="input input-bordered w-full" />
                  <select name="role" value={form.role} onChange={handleChange} className="input input-bordered w-full">
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="trainer">Trainer</option>
                    <option value="member">Member</option>
                  </select>
                  {(form.role === "trainer" || form.role === "member") && (
                    <div className="grid grid-cols-2 gap-3">
                      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} className="input input-bordered w-full" />
                      <input name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} className="input input-bordered w-full" />
                      <input name="height" placeholder="Height" value={form.height} onChange={handleChange} className="input input-bordered w-full" />
                      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input input-bordered w-full" />
                      <input name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} className="input input-bordered w-full col-span-2" />
                      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} className="input input-bordered w-full" />
                      <input name="profile_image" type="file" accept="image/*" onChange={handleFileChange} className="input input-bordered w-full" />
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Create User</button>
                    <DialogClose asChild>
                      <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Cancel</button>
                    </DialogClose>
                  </div>
                  {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                  {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
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
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white text-center">Users List</h3>
            <div className="rounded shadow p-4 w-full max-w-3xl overflow-x-auto bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <Table className = "bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 ">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black dark:text-white">S.N.</TableHead>
                    <TableHead className="text-black dark:text-white">Username</TableHead>
                    <TableHead className="text-black dark:text-white">Name</TableHead>
                    <TableHead className="text-black dark:text-white">Role</TableHead>
                    <TableHead className="text-black dark:text-white">Email</TableHead>
                    <TableHead className="text-black dark:text-white">Action</TableHead>
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
                      <TableRow key={u.id} className="text-black dark:text-white">
                        <TableCell className="text-black dark:text-white">{idx + 1}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.username}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.first_name} {u.last_name}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.role}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.email}</TableCell>
                        <TableCell>
                          <button
                            className="text-green-600 dark:text-green-400 hover:underline mr-2"
                            onClick={() => {
                              setSelectedUser(u);
                              setViewOpen(true);
                            }}
                          >
                            View
                          </button>
                          {canEditOrDelete && (
                            <>
                              <button className="text-blue-600 dark:text-blue-400 hover:underline mr-2">Edit</button>
                              <button className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                            </>
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
