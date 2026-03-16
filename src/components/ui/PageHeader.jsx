import { Heading, Text, VStack } from "@chakra-ui/react"
import "./PageHeader.css"

export default function PageHeader({ title, subtitle, mb = 0 }) {
  return (
    <VStack className="page-header" align="stretch" gap={1} mb={mb}>
      <Heading>{title}</Heading>
      {subtitle ? <Text color="fg.muted">{subtitle}</Text> : null}
    </VStack>
  )
}
