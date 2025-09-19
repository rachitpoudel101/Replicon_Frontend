// import React, { useEffect, useState, type JSX } from 'react';
// import Navbar from '@/layouts/Navbar';
// import Sidebar from '@/layouts/Sidebar';
// import apiClient from '@/services/apiClient';
// import { apiEndpoints } from '@/services/apiEndpoints';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogClose,
// } from '@/components/ui/dialog';
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
//   TableHead,
// } from '@/components/ui/table';

// type TrainerMember = {
//   id?: number | string;
//   name?: string;
//   email?: string;
//   trainer_id?: number | string | null;
//   [key: string]: any;
// };

// type User = {
//   id?: number | string;
//   name?: string;
//   email?: string;
//   [key: string]: any;
// };

// function normalizeResponse<T = any>(resp: any): T {
//   if (resp == null) return resp;
//   return ('data' in resp ? resp.data : resp) as T;
// }

// const AssignTrainerMemberPage = (): JSX.Element => {
//   const [items, setItems] = useState<TrainerMember[]>([]);
//   const [trainers, setTrainers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState<TrainerMember | null>(null);
//   const [form, setForm] = useState<{ name?: string; email?: string; trainer_id?: string | number | null }>({});

//   async function loadList() {
//     setLoading(true);
//     setError(null);
//     try {
//       const resp = await apiClient.get(apiEndpoints.trainermember.list);
//       const data = normalizeResponse<TrainerMember[]>(resp) ?? [];
//       setItems(Array.isArray(data) ? data : []);
//     } catch (err: any) {
//       setError(err?.message || 'Failed to load trainer members');
//       toast.error(err?.message || 'Failed to load trainer members');
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function loadTrainers() {
//     try {
//       const resp = await apiClient.get(apiEndpoints.users.list);
//       const data = normalizeResponse<User[]>(resp) ?? [];
//       // keep only users with role === 'trainer' when available
//       const list = Array.isArray(data) ? data : [];
//       setTrainers(list.filter((u) => (u as any).role ? (u as any).role === 'trainer' : true));
//     } catch {
//       // non-fatal
//     }
//   }

//   useEffect(() => {
//     loadTrainers();
//     loadList();
//   }, []);

//   function openCreate() {
//     setEditing(null);
//     setForm({ name: '', email: '', trainer_id: null });
//     setDialogOpen(true);
//   }

//   function openEdit(item: TrainerMember) {
//     setEditing(item);
//     setForm({ name: String(item.name ?? ''), email: String(item.email ?? ''), trainer_id: item.trainer_id ?? null });
//     setDialogOpen(true);
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     if (name === 'trainer_id') {
//       // normalize trainer_id: empty string -> null, numeric string -> number, otherwise string id
//       const val = value === '' ? null : (/^\d+$/.test(value) ? Number(value) : value);
//       setForm((s) => ({ ...s, [name]: val }));
//     } else {
//       setForm((s) => ({ ...s, [name]: value }));
//     }
//   };

//   async function handleSave(e?: React.FormEvent) {
//     e?.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       // ensure trainer_id is null or proper type (number or string) before sending
//       let trainer_id: string | number | null = null;
//       if (form.trainer_id !== undefined && form.trainer_id !== null && String(form.trainer_id) !== '') {
//         if (typeof form.trainer_id === 'string' && /^\d+$/.test(form.trainer_id)) trainer_id = Number(form.trainer_id);
//         else trainer_id = form.trainer_id as string | number;
//       }
//       const payload = { name: form.name, email: form.email, trainer_id };
//       let resultItem: TrainerMember | null = null;
//       if (editing && editing.id != null) {
//         const resp = await apiClient.put(apiEndpoints.trainermember.update(editing.id), payload);
//         resultItem = normalizeResponse<TrainerMember>(resp);
//         setItems((prev) => prev.map((it) => (String(it.id) === String(editing.id) ? resultItem! : it)));
//         toast.success('Trainer member updated');
//       } else {
//         const resp = await apiClient.post(apiEndpoints.trainermember.create, payload);
//         resultItem = normalizeResponse<TrainerMember>(resp);
//         setItems((prev) => [resultItem!, ...prev]);
//         toast.success('Trainer member created');
//       }
//       setDialogOpen(false);
//     } catch (err: any) {
//       const msg = err?.message || 'Save failed';
//       setError(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete(id: string | number) {
//     if (!confirm('Are you sure you want to delete this item?')) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await apiClient.delete(apiEndpoints.trainermember.delete(id));
//       setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
//       toast.success('Deleted successfully');
//     } catch (err: any) {
//       const msg = err?.message || 'Delete failed';
//       setError(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
//       <Navbar />
//       <div className="flex flex-1">
//         <Sidebar />
//         <main className="flex-1 px-8 py-8 border-r border-gray-200 dark:border-gray-700 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
//           <ToastContainer />
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-black dark:text-white">Assign Trainer Member</h2>
//             <div className="flex items-center gap-3">
//               <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//                 <DialogTrigger asChild>
//                   <button
//                     className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 transition"
//                     onClick={openCreate}
//                   >
//                     Create Trainer Member
//                   </button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
//                   <DialogTitle className="mb-4 text-xl font-bold text-black dark:text-white">
//                     {editing ? 'Edit Trainer Member' : 'Create Trainer Member'}
//                   </DialogTitle>
//                   <form onSubmit={handleSave} className="space-y-4">
//                     <input
//                       name="name"
//                       placeholder="Name"
//                       value={form.name ?? ''}
//                       onChange={handleChange}
//                       className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                       required
//                     />
//                     <input
//                       name="email"
//                       placeholder="Email"
//                       value={form.email ?? ''}
//                       onChange={handleChange}
//                       type="email"
//                       className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                       required
//                     />
//                     <select
//                       name="trainer_id"
//                       value={form.trainer_id ?? ''}
//                       onChange={handleChange}
//                       className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                     >
//                       <option value="">-- unassigned --</option>
//                       {trainers.map((t) => (
//                         <option key={String(t.id)} value={String(t.id)}>
//                           {t.name ?? t.email ?? String(t.id)}
//                         </option>
//                       ))}
//                     </select>

//                     <div className="flex gap-4 mt-4 justify-end">
//                       <DialogClose asChild>
//                         <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Cancel</button>
//                       </DialogClose>
//                       <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
//                         {editing ? 'Update' : 'Create'}
//                       </button>
//                     </div>
//                     {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
//                   </form>
//                 </DialogContent>
//               </Dialog>

//               <button onClick={loadList} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Refresh</button>
//             </div>
//           </div>

//           <div className="rounded shadow p-4 w-full max-w-6xl overflow-x-auto bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
//             <Table className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 w-full text-base">
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="text-black dark:text-white px-6 py-4 text-lg">S.N.</TableHead>
//                   <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Name</TableHead>
//                   <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Email</TableHead>
//                   <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Trainer</TableHead>
//                   <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Action</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {items.length === 0 ? (
//                   <TableRow>
//                     <TableCell className="px-6 py-4 text-center" colSpan={5}>No trainer members</TableCell>
//                   </TableRow>
//                 ) : (
//                   items.map((it, idx) => {
//                     const trainer = trainers.find((t) => String(t.id) === String(it.trainer_id));
//                     return (
//                       <TableRow key={String(it.id)} className="text-black dark:text-white text-base">
//                         <TableCell className="px-6 py-4">{idx + 1}</TableCell>
//                         <TableCell className="px-6 py-4">{it.name ?? '-'}</TableCell>
//                         <TableCell className="px-6 py-4">{it.email ?? '-'}</TableCell>
//                         <TableCell className="px-6 py-4">{trainer ? trainer.name ?? trainer.email : (it.trainer_id ? String(it.trainer_id) : '-')}</TableCell>
//                         <TableCell className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button onClick={() => openEdit(it)} className="px-3 py-1 bg-yellow-300 rounded hover:bg-yellow-400">Edit</button>
//                             <button onClick={() => handleDelete(it.id!)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AssignTrainerMemberPage ;