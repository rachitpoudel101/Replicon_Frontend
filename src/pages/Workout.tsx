// import React, { useEffect, useState, useRef } from "react";
// import { useWorkoutPlanStore, type WorkoutPlan } from "@/stores/workoutStore";
// import { useAuthStore } from "@/stores/authStore";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogClose,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
//   TableHead,
// } from "@/components/ui/table";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Navbar from "@/layouts/Navbar";
// import Sidebar from "@/layouts/Sidebar";
// import { FaEllipsisV } from "react-icons/fa";
// import apiClient from "@/services/apiClient";
// import { apiEndpoints } from "@/services/apiEndpoints";

// // local User type for dropdown population
// interface User {
//   id: string | number;
//   username?: string;
//   first_name?: string;
//   last_name?: string;
//   email?: string;
//   // role may come as a string, nested object, number or array on different backends
//   role?: string | { name?: string; title?: string } | number | Array<unknown> | null;
// }

// const initialForm: Partial<WorkoutPlan> = {
//   name: "",
//   description: "",
//   goal: "",
//   day_of_week: "",
//   duration_weeks: 1,
//   calories_target: undefined,
//   is_active: true,
//   plan_exercises: [],
//   trainer: "",
//   member: "",
// };
// // add allowed options / mappings for API-compatible values
// const DAY_OPTIONS = [
//   { label: "Monday", code: "MON" },
//   { label: "Tuesday", code: "TUE" },
//   { label: "Wednesday", code: "WED" },
//   { label: "Thursday", code: "THU" },
//   { label: "Friday", code: "FRI" },
//   { label: "Saturday", code: "SAT" },
//   { label: "Sunday", code: "SUN" },
// ];
// const DAY_MAP: Record<string, string> = Object.fromEntries(DAY_OPTIONS.map(o => [o.label, o.code]));

// // Adjust these to match backend choices; common examples shown
// const GOAL_OPTIONS = [
//   { label: "Weight Loss", code: "weight_loss" },
//   { label: "Muscle Gain", code: "muscle_gain" },
//   { label: "Endurance", code: "endurance" },
//   { label: "Flexibility", code: "flexibility" },
// ];
// const GOAL_MAP: Record<string, string> = Object.fromEntries(GOAL_OPTIONS.map(o => [o.label, o.code]));

// const Workout = () => {
//   const {
//     workoutPlans,
//     fetchWorkoutPlans,
//     createWorkoutPlan,
//     updateWorkoutPlan,
//     deleteWorkoutPlan,
//   } = useWorkoutPlanStore();
//   const { user } = useAuthStore();

//   // users list for trainer/member dropdowns
//   const [users, setUsers] = useState<User[]>([]);
//   // helper to extract a readable role string from various possible shapes
//   const extractRole = (u: any): string | undefined => {
//     if (!u) return undefined;
//     // common direct role properties
//     if (typeof u.role === "string") return u.role;
//     if (typeof u.role === "number") return String(u.role);
//     if (typeof u.user_type === "string") return u.user_type;
//     if (typeof u.role_name === "string") return u.role_name;

//     // nested profile or role object
//     if (u.role && typeof u.role === "object") {
//       if (typeof u.role.name === "string") return u.role.name;
//       if (typeof u.role.title === "string") return u.role.title;
//     }
//     if (u.profile && typeof u.profile === "object") {
//       if (typeof u.profile.role === "string") return u.profile.role;
//       if (typeof u.profile.role?.name === "string") return u.profile.role.name;
//     }

//     // support roles array like [{name:'trainer'}] or ['trainer']
//     if (Array.isArray(u.roles) && u.roles.length) {
//       const r = u.roles[0];
//       if (typeof r === "string") return r;
//       if (r && typeof r.name === "string") return r.name;
//     }
//     if (Array.isArray(u.role) && u.role.length) {
//       const r = u.role[0];
//       if (typeof r === "string") return r;
//       if (r && typeof r.name === "string") return r.name;
//     }

//     // boolean flags
//     if (u.is_trainer || u.isTrainer) return "trainer";
//     if (u.is_member || u.isMember) return "member";

//     return undefined;
//   };
//   // split users by role for dropdowns (case-insensitive match)
//   const trainers = users.filter((u) => {
//     const r = extractRole(u);
//     return Boolean(r && String(r).toLowerCase().includes("trainer"));
//   });
//   const members = users.filter((u) => {
//     const r = extractRole(u);
//     return Boolean(r && String(r).toLowerCase().includes("member"));
//   });

//   // helper that returns users list (does not directly set state)
//   const fetchUsersList = async (): Promise<User[]> => {
//     try {
//       // Try common endpoint keys: try plural first, then singular as fallback
//       let res;
//       try {
//         res = await apiClient.get(apiEndpoints.users?.list ?? apiEndpoints.users?.list);
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       } catch (err) {
//         // fallback: try singular key if plural failed
//         res = await apiClient.get(apiEndpoints.users?.list ?? apiEndpoints.users?.list);
//       }
//       console.debug("fetchUsersList response:", res?.data);
//       const list = Array.isArray(res?.data)
//         ? res.data
//         : (Array.isArray(res?.data?.results) ? res.data.results : []);
//       // normalize roles into a simple shape so filtering works; store original role under _rawRole for debugging
//       return list.map((u: any) => ({ ...u, _rawRole: u.role ?? u.user_type ?? u.profile?.role ?? null, role: extractRole(u) ?? undefined }));
//     } catch (err) {
//       console.error("fetchUsersList error:", err);
//       return [];
//     }
//   };

//   // cache for day_of_week choices returned by backend (if any)
//   const dayChoicesRef = useRef<Array<any> | null>(null);

//   // Try to fetch metadata (OPTIONS) for workoutPlan create endpoint to learn valid choices
//   const fetchDayChoices = async (): Promise<Array<any>> => {
//     if (dayChoicesRef.current) return dayChoicesRef.current;
//     try {
//       const res = await apiClient.options(apiEndpoints.workoutPlan.create);
//       // DRF style: res.data.actions.POST.day_of_week.choices
//       const choices =
//         res?.data?.actions?.POST?.day_of_week?.choices ??
//         res?.data?.actions?.POST?.day_of_week ??
//         res?.data?.day_of_week?.choices ??
//         res?.data?.choices?.day_of_week ??
//         null;
//       if (Array.isArray(choices)) {
//         dayChoicesRef.current = choices;
//         return choices;
//       }
//     } catch (err) {
//       // ignore - not all backends support OPTIONS metadata
//       console.debug("fetchDayChoices: OPTIONS not available or failed", err);
//     }
//     dayChoicesRef.current = [];
//     return [];
//   };

//   // map our UI label (e.g., "Tuesday") to backend accepted value using metadata or fallbacks
//   const getValidDayValue = async (label: string | undefined) => {
//     if (!label) return null;
//     const labelNorm = String(label).trim();
//     const choices = await fetchDayChoices();
//     if (choices && choices.length) {
//       // each choice may look like {value: "...", display_name: "..." } or {value, display}
//       const found = choices.find((c: any) => {
//         if (!c) return false;
//         const v = String(c.value ?? c.key ?? c[0] ?? "");
//         const d = String(c.display_name ?? c.display ?? c.label ?? c[1] ?? "");
//         return (
//           v === labelNorm ||
//           d === labelNorm ||
//           d.toLowerCase() === labelNorm.toLowerCase() ||
//           v.toLowerCase() === labelNorm.toLowerCase()
//         );
//       });
//       if (found) return found.value ?? found.key ?? found;
//     }
//     // fallback strategies
//     const fallbacks = [
//       // pre-existing mapping (MON/TUE)
//       DAY_MAP[labelNorm],
//       // lowercase full name (e.g., 'tuesday')
//       labelNorm.toLowerCase(),
//       // uppercase short (TUE)
//       labelNorm.slice(0, 3).toUpperCase(),
//       // capitalized full (Tuesday)
//       labelNorm.charAt(0).toUpperCase() + labelNorm.slice(1).toLowerCase(),
//     ];
//     for (const f of fallbacks) {
//       if (f !== undefined && f !== null) return f;
//     }
//     return labelNorm;
//   };

//   const [form, setForm] = useState<Partial<WorkoutPlan>>(initialForm);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
//   const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
//   const [viewOpen, setViewOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [actionMenuOpen, setActionMenuOpen] = useState<string | number | null>(null);
//   const actionMenuRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     fetchWorkoutPlans();
//   }, [fetchWorkoutPlans]);

//   // Dropdown close on outside click
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         actionMenuRef.current &&
//         !actionMenuRef.current.contains(event.target as Node)
//       ) {
//         setActionMenuOpen(null);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [actionMenuOpen]);

//   // fetch users for trainer/member dropdowns
//   useEffect(() => {
//     let mounted = true;
//     fetchUsersList().then((list) => {
//       if (!mounted) return;
//       if (!list.length) console.warn("fetchUsers: no users returned from API");
//       setUsers(list);
//     });
//     return () => { mounted = false; };
//   }, []);

//   // ensure users are loaded before opening the modal so selects are populated
//   const openAddDialog = async () => {
//     const list = await fetchUsersList();
//     setUsers(list);
//     setForm({
//       ...initialForm,
//       // prefill trainer or member if current user has that role
//       trainer:
//         user?.role && user.role.toLowerCase() === "trainer" && user?.id !== undefined && user?.id !== null
//           ? String(user.id)
//           : "",
//       member:
//         user?.role && user.role.toLowerCase() === "member" && user?.id !== undefined && user?.id !== null
//           ? String(user.id)
//           : "",
//     });
//     setSelectedPlan(null);
//     setDialogMode("add");
//     setDialogOpen(true);
//     setError("");
//     setSuccess("");
//   };

//   const openEditDialog = async (plan: WorkoutPlan) => {
//     const list = await fetchUsersList();
//     setUsers(list);
//     // ensure trainer/member values are strings so select value matches
//     setForm({ ...plan, trainer: plan.trainer !== undefined && plan.trainer !== null ? String(plan.trainer) : "", member: plan.member !== undefined && plan.member !== null ? String(plan.member) : "" });
//     setSelectedPlan(plan);
//     setDialogMode("edit");
//     setDialogOpen(true);
//     setError("");
//     setSuccess("");
//   };

//   const handleDialogSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     try {
//       // sanitize and map form values to API-expected payload
//       const payload: any = {
//         // copy everything; we'll override specific fields below
//         ...form,
//       };
//       // map day_of_week label -> backend accepted value (try OPTIONS metadata first)
//       if (typeof form.day_of_week === "string" && form.day_of_week) {
//         const mapped = await getValidDayValue(form.day_of_week);
//         payload.day_of_week = mapped;
//       }
//       // map goal label -> backend code
//       if (typeof form.goal === "string" && form.goal) {
//         payload.goal = GOAL_MAP[form.goal] ?? form.goal;
//       }
//       // ensure numeric fields are numbers (not empty strings)
//       payload.duration_weeks = form.duration_weeks ? Number(form.duration_weeks) : null;
//       payload.calories_target = form.calories_target ? Number(form.calories_target) : null;
//       // convert trainer/member to numbers if present (backend expects pk)
//       payload.trainer = form.trainer ? Number(form.trainer) : null;
//       payload.member = form.member ? Number(form.member) : null;

//       // Validate required foreign keys before submit
//       if (!payload.trainer) {
//         // if current user is trainer, auto-assign
//         if (user?.role && user.role.toLowerCase() === "trainer" && user?.id) {
//           payload.trainer = Number(user.id);
//         } else {
//           setError("Trainer is required. Please select a trainer.");
//           toast.error("Trainer is required.");
//           return;
//         }
//       }
//       if (!payload.member) {
//         setError("Member is required. Please select a member.");
//         toast.error("Member is required.");
//         return;
//       }

//       if (dialogMode === "add") {
//         const created = await createWorkoutPlan(payload);
//         if (created) {
//           toast.success("Workout plan created!");
//           setSuccess("Workout plan created!");
//         }
//       } else if (dialogMode === "edit" && selectedPlan) {
//         const updated = await updateWorkoutPlan(selectedPlan.id, payload);
//         if (updated) {
//           toast.success("Workout plan updated!");
//           setSuccess("Workout plan updated!");
//         }
//       }
//       setDialogOpen(false);
//       setForm(initialForm);
//       setSelectedPlan(null);
//     } catch (err: any) {
//       // If backend returns validation details, try to display them
//       const validation = err?.response?.data;
//       if (validation) {
//         const msg = typeof validation === "string" ? validation : JSON.stringify(validation);
//         setError(msg);
//         toast.error(msg);
//       } else {
//         setError(err.message || "Error occurred");
//         toast.error(err.message || "Error occurred");
//       }
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, type } = e.target;
//     // Use type guard to safely read checked for checkbox inputs
//     if (type === "checkbox" && e.target instanceof HTMLInputElement) {
//       setForm((prev) => ({ ...prev, [name]: e.target.checked }));
//       return;
//     }
//     // For other inputs/selects/textareas, use the value as string/number
//     const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
//       <Navbar />
//       <div className="flex flex-1">
//         <Sidebar />
//         <main className="flex-1 px-8 py-8 border-r border-gray-200 dark:border-gray-700 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
//           <ToastContainer />
//           <div className="flex items-center float-end mb-8">
//             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//               <DialogTrigger asChild>
//                 <button
//                   className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 transition"
//                   onClick={openAddDialog}
//                 >
//                   Add Workout Plan
//                 </button>
//               </DialogTrigger>
//               <DialogContent className="max-w-lg w-full p-8 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
//                 <DialogTitle className="mb-4 text-2xl font-bold text-center text-black dark:text-white">
//                   {dialogMode === "add" ? "Create Workout Plan" : "Edit Workout Plan"}
//                 </DialogTitle>
//                 <form onSubmit={handleDialogSubmit} className="space-y-4">
//                   <input
//                     name="name"
//                     placeholder="Plan Name"
//                     value={form.name || ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   />
//                   <textarea
//                     name="description"
//                     placeholder="Description"
//                     value={form.description || ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   />
//                   <select
//                     name="goal"
//                     value={form.goal || ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   >
//                     <option value="">Select Goal</option>
//                     {GOAL_OPTIONS.map((opt) => (
//                       <option key={opt.code} value={opt.label}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     name="day_of_week"
//                     value={form.day_of_week || ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   >
//                     <option value="">Select Day</option>
//                     {DAY_OPTIONS.map((d) => (
//                       <option key={d.code} value={d.label}>
//                         {d.label}
//                       </option>
//                     ))}
//                   </select>
//                   {/* Trainer select — show only users with role 'trainer' */}
//                   <select
//                     name="trainer"
//                     value={form.trainer !== undefined && form.trainer !== null ? String(form.trainer) : ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   >
//                     <option value="">Select Trainer</option>
//                     {trainers.length === 0 && users.length === 0 && <option value="" disabled>Loading users...</option>}
//                     {trainers.length === 0 && users.length > 0 && <option value="" disabled>No trainers identified — showing all users</option>}
//                     {(trainers.length > 0 ? trainers : users).map((u) => (
//                       <option key={String(u.id)} value={String(u.id)}>
//                         {(u.first_name || u.last_name)
//                           ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
//                           : (u.username || u.email || String(u.id))} {u.role ? `(${String(u.role)})` : ''}
//                       </option>
//                     ))}
//                   </select>
//                   {/* Member select — show only users with role 'member' */}
//                   <select
//                     name="member"
//                     value={form.member !== undefined && form.member !== null ? String(form.member) : ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   >
//                     <option value="">Select Member</option>
//                     {members.length === 0 && users.length === 0 && <option value="" disabled>Loading users...</option>}
//                     {members.length === 0 && users.length > 0 && <option value="" disabled>No members identified — showing all users</option>}
//                     {(members.length > 0 ? members : users).map((u) => (
//                       <option key={String(u.id)} value={String(u.id)}>
//                         {(u.first_name || u.last_name)
//                           ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
//                           : (u.username || u.email || String(u.id))} {u.role ? `(${String(u.role)})` : ''}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     name="duration_weeks"
//                     type="number"
//                     min={1}
//                     placeholder="Duration (weeks)"
//                     value={form.duration_weeks || ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   />
//                   <input
//                     name="calories_target"
//                     type="number"
//                     placeholder="Calories Target"
//                     value={form.calories_target || ""}
//                     onChange={handleChange}
//                     className="input input-bordered w-full py-2 px-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
//                   />
//                   <label className="flex items-center gap-2">
//                     <input
//                       name="is_active"
//                       type="checkbox"
//                       checked={!!form.is_active}
//                       onChange={handleChange}
//                     />
//                     Active
//                   </label>
//                   <div className="flex gap-4 mt-6 justify-center">
//                     <button
//                       type="submit"
//                       className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
//                     >
//                       {dialogMode === "add" ? "Create Plan" : "Save Changes"}
//                     </button>
//                     <DialogClose asChild>
//                       <button
//                         type="button"
//                         className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold"
//                       >
//                         Cancel
//                       </button>
//                     </DialogClose>
//                   </div>
//                   {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
//                   {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
//                 </form>
//               </DialogContent>
//             </Dialog>
//           </div>
//           {/* View Workout Plan Dialog */}
//           <Dialog open={viewOpen} onOpenChange={setViewOpen}>
//             <DialogContent>
//               <DialogTitle>Workout Plan Details</DialogTitle>
//               {selectedPlan && (
//                 <div className="space-y-2 mt-2">
//                   <div><b>Name:</b> {selectedPlan.name}</div>
//                   <div><b>Description:</b> {selectedPlan.description}</div>
//                   <div><b>Goal:</b> {selectedPlan.goal}</div>
//                   <div><b>Day:</b> {selectedPlan.day_of_week}</div>
//                   <div><b>Duration (weeks):</b> {selectedPlan.duration_weeks}</div>
//                   <div><b>Calories Target:</b> {selectedPlan.calories_target}</div>
//                   <div><b>Active:</b> {selectedPlan.is_active ? "Yes" : "No"}</div>
//                   {/* You can add more details as needed */}
//                 </div>
//               )}
//               <DialogClose asChild>
//                 <button className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Close</button>
//               </DialogClose>
//             </DialogContent>
//           </Dialog>
//           {/* Delete Workout Plan Dialog */}
//           <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
//             <DialogContent>
//               <DialogTitle>Delete Workout Plan</DialogTitle>
//               {selectedPlan && (
//                 <div className="space-y-4">
//                   <div>Are you sure you want to delete <b>{selectedPlan.name}</b>?</div>
//                   <div className="flex gap-4 mt-6 justify-center">
//                     <button
//                       className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
//                       onClick={async () => {
//                         setError("");
//                         setSuccess("");
//                         try {
//                           await deleteWorkoutPlan(selectedPlan.id);
//                           toast.success("Workout plan deleted!");
//                           setSuccess("Workout plan deleted!");
//                           setDeleteOpen(false);
//                         } catch (err: any) {
//                           setError(err.message || "Error occurred");
//                           toast.error(err.message || "Error occurred");
//                         }
//                       }}
//                     >
//                       Delete
//                     </button>
//                     <DialogClose asChild>
//                       <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition font-semibold">Cancel</button>
//                     </DialogClose>
//                   </div>
//                   {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
//                   {success && <div className="text-green-600 text-sm mt-2 text-center">{success}</div>}
//                 </div>
//               )}
//             </DialogContent>
//           </Dialog>
//           <div className="flex flex-col items-center justify-center">
//             <h3 className="text-lg font-semibold mb-4 text-black dark:text-white text-center">Workout Plans</h3>
//             <div className="rounded shadow p-4 w-full max-w-6xl overflow-x-auto bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
//               <Table className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 w-full text-base">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">S.N.</TableHead>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Name</TableHead>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Goal</TableHead>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Day</TableHead>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Duration</TableHead>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Active</TableHead>
//                     <TableHead className="text-black dark:text-white px-6 py-4 text-lg">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {workoutPlans.map((plan, idx) => (
//                     <TableRow key={plan.id} className="text-black dark:text-white text-base relative">
//                       <TableCell className="text-black dark:text-white px-6 py-4 text-base">{idx + 1}</TableCell>
//                       <TableCell className="text-black dark:text-white px-6 py-4 text-base">{plan.name}</TableCell>
//                       <TableCell className="text-black dark:text-white px-6 py-4 text-base">{plan.goal}</TableCell>
//                       <TableCell className="text-black dark:text-white px-6 py-4 text-base">{plan.day_of_week}</TableCell>
//                       <TableCell className="text-black dark:text-white px-6 py-4 text-base">{plan.duration_weeks}</TableCell>
//                       <TableCell className="text-black dark:text-white px-6 py-4 text-base">{plan.is_active ? "Yes" : "No"}</TableCell>
//                       <TableCell className="px-6 py-4 relative">
//                         <button
//                           className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
//                           onClick={() => setActionMenuOpen(actionMenuOpen === plan.id ? null : plan.id)}
//                           type="button"
//                         >
//                           <FaEllipsisV />
//                         </button>
//                         {actionMenuOpen === plan.id && (
//                           <div ref={actionMenuRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
//                             <button
//                               className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
//                               onClick={() => {
//                                 setSelectedPlan(plan);
//                                 setViewOpen(true);
//                                 setActionMenuOpen(null);
//                               }}
//                             >
//                               View
//                             </button>
//                             <button
//                               className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400"
//                               onClick={() => {
//                                 openEditDialog(plan);
//                                 setActionMenuOpen(null);
//                               }}
//                             >
//                               Edit
//                             </button>
//                             <button
//                               className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
//                               onClick={() => {
//                                 setSelectedPlan(plan);
//                                 setDeleteOpen(true);
//                                 setActionMenuOpen(null);
//                               }}
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Workout;
