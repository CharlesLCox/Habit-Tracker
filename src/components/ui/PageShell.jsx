import { Box } from "@chakra-ui/react"
import "./PageShell.css"

export default function PageShell({ children, maxW = "1200px" }) {
  return (
    <Box className="page-shell" maxW={maxW} mx="auto" mt={10} px={{ base: 4, md: 6 }}>
      {children}
    </Box>
  )
}
