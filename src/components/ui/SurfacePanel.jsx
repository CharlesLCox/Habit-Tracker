import { Box } from "@chakra-ui/react"
import "./SurfacePanel.css"

export default function SurfacePanel({
  children,
  p = { base: 4, md: 5 },
  interactive = true,
  ...props
}) {
  return (
    <Box
      className={`surface-panel${interactive ? " surface-panel--interactive" : ""}`}
      borderWidth="1px"
      borderRadius="2xl"
      bg="white"
      p={p}
      {...props}
    >
      {children}
    </Box>
  )
}
