import React, { useState } from "react";
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

const Users = () => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const createUser = useUserListStore((state) => state.createUser);
  const users = useUserListStore((state) => state.users);

  // Simulate current user role (replace with real auth logic)
  const currentUserRole = "superadmin"; // or "admin", "trainer", "member"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const result = createUser({ ...form, id: Date.now().toString() });
    if (!result.success) {
      setError(result.error || "Unknown error");
      toast.error(result.error || "Unknown error");
    } else {
      setSuccess("User created successfully!");
      toast.success("User created successfully!");
      setForm(initialState);
      setOpen(false);
    }
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
                      <input name="profile_image" placeholder="Profile Image URL" value={form.profile_image} onChange={handleChange} className="input input-bordered w-full" />
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
                    {(currentUserRole === "superadmin" || currentUserRole === "admin") && (
                      <TableHead className="text-black dark:text-white">Action</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u, idx) => {
                    const canEditOrDelete =
                      currentUserRole === "superadmin" ||
                      (currentUserRole === "admin" && (u.role === "trainer" || u.role === "member"));
                    return (
                      <TableRow key={u.id} className="text-black dark:text-white">
                        <TableCell className="text-black dark:text-white">{idx + 1}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.username}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.first_name} {u.last_name}</TableCell>
                        <TableCell className="text-black dark:text-white">{u.role}</TableCell>
                        {(currentUserRole === "superadmin" || currentUserRole === "admin") && (
                          <TableCell>
                            {canEditOrDelete && (
                              <>
                                <button className="text-blue-600 dark:text-blue-400 hover:underline mr-2">Edit</button>
                                <button className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                              </>
                            )}
                          </TableCell>
                        )}
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
