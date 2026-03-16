import { Button } from "@chakra-ui/react"
import "./PrimaryButton.css"

export default function PrimaryButton({ children, ...props }) {
  return (
    <Button className="primary-button" {...props}>
      {children}
    </Button>
  )
}
