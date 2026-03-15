import { Box, Flex, useMediaQuery } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useOutlet,
} from "react-router-dom"
import Navbar from "./components/navigation/Navbar"
import ProfileMenu from "./components/navigation/ProfileMenu"
import Dashboard from "./pages/Dashboard"
import Habits from "./pages/Habits"
import Login from "./pages/Login"
import Settings from "./pages/Settings"
import Statistics from "./pages/Statistics"
import { isAuthenticated } from "./services/auth"

const MotionDiv = motion.div

function ProtectedLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const authenticated = isAuthenticated()
  const [isLandscape] = useMediaQuery("(orientation: landscape)")
  const [isMobile] = useMediaQuery("(max-width: 768px)")
  const isSideNav = isLandscape && !isMobile

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Flex minH="100vh" direction={isSideNav ? "row" : "column"}>
      <Navbar isSideNav={isSideNav} />
      {isSideNav ? (
        <Box position="fixed" top="3" right="4" zIndex="dropdown">
          <ProfileMenu />
        </Box>
      ) : null}
      <Box flex="1" overflow="hidden">
        <AnimatePresence mode="wait" initial={false}>
          <MotionDiv
            key={location.pathname}
            style={{ width: "100%" }}
            variants={{
              enter: { opacity: 0 },
              center: { opacity: 1 },
              exit: { opacity: 0 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            {outlet}
          </MotionDiv>
        </AnimatePresence>
      </Box>
    </Flex>
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
