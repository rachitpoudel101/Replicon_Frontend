// import apiClient from '@/services/apiClient';
// import { apiEndpoints } from '@/services/apiEndpoints';

// export type TrainerMember = {
//   id?: number | string;
//   // add other fields your API returns/accepts
//   name?: string;
//   email?: string;
//   [key: string]: unknown;
// };

// type State = {
//   items: TrainerMember[];
//   loading: boolean;
//   error: Error | null;
// };

// const state: State = {
//   items: [],
//   loading: false,
//   error: null,
// };

// export const trainermemberStore = {
//   state,

//   async fetchList(query?: Record<string, unknown>) {
//     state.loading = true;
//     state.error = null;
//     try {
//       const data = await apiClient.get<TrainerMember[]>(apiEndpoints.trainermember.list, { params: query });
//       state.items = Array.isArray(data) ? data : [];
//       return state.items;
//     } catch (err) {
//       state.error = err as Error;
//       throw err;
//     } finally {
//       state.loading = false;
//     }
//   },

//   async fetchDetail(id: string | number) {
//     state.loading = true;
//     state.error = null;
//     try {
//       const response = await apiClient.get<TrainerMember>(apiEndpoints.trainermember.detail(id));
//       const data = response.data;
//       // optionally update/merge into items
//       const idx = state.items.findIndex((i) => String(i.id) === String(id));
//       if (idx === -1) state.items.push(data);
//       else state.items[idx] = data;
//       return data;
//     } catch (err) {
//       state.error = err as Error;
//       throw err;
//     } finally {
//       state.loading = false;
//     }
//   },

//   async create(payload: Partial<TrainerMember>) {
//     state.loading = true;
//     state.error = null;
//     try {
//       const response = await apiClient.post<TrainerMember>(apiEndpoints.trainermember.create, payload);
//       state.items.unshift(response.data);
//       return response.data;
//     } catch (err) {
//       state.error = err as Error;
//       throw err;
//     } finally {
//       state.loading = false;
//     }
//   },

//   async update(id: string | number, payload: Partial<TrainerMember>) {
//     state.loading = true;
//     state.error = null;
//     try {
//       const response = await apiClient.put<TrainerMember>(apiEndpoints.trainermember.update(id), payload);
//       const idx = state.items.findIndex((i) => String(i.id) === String(id));
//       if (idx !== -1) state.items[idx] = response.data;
//       return response.data;
//     } catch (err) {
//       state.error = err as Error;
//       throw err;
//     } finally {
//       state.loading = false;
//     }
//   },

//   async remove(id: string | number) {
//     state.loading = true;
//     state.error = null;
//     try {
//       await apiClient.delete(apiEndpoints.trainermember.delete(id));
//       state.items = state.items.filter((i) => String(i.id) !== String(id));
//       return true;
//     } catch (err) {
//       state.error = err as Error;
//       throw err;
//     } finally {
//       state.loading = false;
//     }
//   },
// };
