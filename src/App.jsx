import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Navbar from "./components/navigation/Navbar"
import Dashboard from "./pages/Dashboard"
import Habits from "./pages/Habits"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import Statistics from "./pages/Statistics"
import { isAuthenticated } from "./services/auth"

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/confirm-registration" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
