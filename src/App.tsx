import Login from "./pages/Login";
import Dashboard from "@/pages/Dashboard";
// import AssignTrainerMemberPage from "@/pages/AssignTrainerMember"
import Users from "@/pages/Users";
// import Workout from "@/pages/Workout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom"
// import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div >
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/workout" element={<Workout />} />
              <Route path="/assign" element={<AssignTrainerMemberPage />} /> */}
              <Route path="/users" element={<Users />} />
            </Route>
            {/* Catch-all route */}
            <Route path="/" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App
