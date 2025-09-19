// import { create } from "zustand";
// import { apiEndpoints } from "@/services/apiEndpoints";
// import apiClient from "@/services/apiClient";

// export interface WorkoutPlanExercise {
//   id: string | number;
//   exercise: string | number;
//   exercise_name?: string;
//   sets?: number;
//   reps?: number;
//   rest_seconds?: number;

// }

// export interface WorkoutPlan {
//   id: string | number;
//   trainer: string | number;
//   trainer_name?: string;
//   member: string | number;
//   member_name?: string;
//   name: string;
//   description: string;
//   goal: string;
//   day_of_week: string;
//   duration_weeks: number;
//   calories_target?: number | null;
//   is_active: boolean;
//   created_date?: string;
//   updated_date?: string;
//   plan_exercises: WorkoutPlanExercise[]; // or any[] if unsure
// }

// interface WorkoutPlanState {
//   workoutPlans: WorkoutPlan[];
//   loading: boolean;
//   error: string | null;
//   fetchWorkoutPlans: () => Promise<void>;
//   getWorkoutPlan: (id: string | number) => Promise<WorkoutPlan | null>;
//   createWorkoutPlan: (data: Partial<WorkoutPlan>) => Promise<WorkoutPlan | null>;
//   updateWorkoutPlan: (id: string | number, data: Partial<WorkoutPlan>) => Promise<WorkoutPlan | null>;
//   deleteWorkoutPlan: (id: string | number) => Promise<boolean>;
//   setWorkoutPlans: (plans: WorkoutPlan[]) => void;
// }

// export const useWorkoutPlanStore = create<WorkoutPlanState>((set) => ({
//   workoutPlans: [],
//   loading: false,
//   error: null,

//   setWorkoutPlans: (plans) => set({ workoutPlans: plans }),

//   fetchWorkoutPlans: async () => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await apiClient.get(apiEndpoints.workoutPlan.list);
//       set({ workoutPlans: data as WorkoutPlan[], loading: false });
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       console.error("fetchWorkoutPlans error:", errorMessage, err);
//       set({ error: errorMessage, loading: false });
//     }
//   },

//   getWorkoutPlan: async (id) => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await apiClient.get(apiEndpoints.workoutPlan.detail(id));
//       set({ loading: false });
//       return data as WorkoutPlan;
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       console.error("getWorkoutPlan error:", errorMessage, err);
//       set({ error: errorMessage, loading: false });
//       return null;
//     }
//   },

//   createWorkoutPlan: async (data) => {
//     set({ loading: true, error: null });
//     try {
//       const { data: plan } = await apiClient.post(apiEndpoints.workoutPlan.create, data);
//       set((state) => ({
//         workoutPlans: [...state.workoutPlans, plan as WorkoutPlan],
//         loading: false,
//       }));
//       return plan as WorkoutPlan;
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       set({ error: errorMessage, loading: false });
//       return null;
//     }
//   },

//   updateWorkoutPlan: async (id, data) => {
//     set({ loading: true, error: null });
//     try {
//       const { data: plan } = await apiClient.patch(apiEndpoints.workoutPlan.update(id), data);
//       set((state) => ({
//         workoutPlans: state.workoutPlans.map((p) => (p.id === plan.id ? (plan as WorkoutPlan) : p)),
//         loading: false,
//       }));
//       return plan as WorkoutPlan;
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       set({ error: errorMessage, loading: false });
//       return null;
//     }
//   },

//   deleteWorkoutPlan: async (id) => {
//     set({ loading: true, error: null });
//     try {
//       await apiClient.delete(apiEndpoints.workoutPlan.delete(id));
//       set((state) => ({
//         workoutPlans: state.workoutPlans.filter((p) => p.id !== id),
//         loading: false,
//       }));
//       return true;
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : String(err);
//       set({ error: errorMessage, loading: false });
//       return false;
//     }
//   },
// }));
