import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"

const MotionDiv = motion.div

export default function TaskForm({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [category, setCategory] = useState("Productivity")
  const [dueDate, setDueDate] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setErrorMessage("You did not write a task yet.")
      return
    }

    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      category,
      dueDate,
    }

    setErrorMessage("")
    onAdd(payload)
    setTitle("")
    setDescription("")
    setPriority("medium")
    setCategory("Productivity")
    setDueDate("")
  }

  return (
    <Box mb={6}>
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <MotionDiv
            key="collapsed"
            initial={{ opacity: 0.7, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Box display="flex" justifyContent="flex-start">
              <Button
                variant="ghost"
                w={{ base: "88px", md: "108px" }}
                h={{ base: "88px", md: "108px" }}
                borderRadius="full"
                color="blue.600"
                bg="blue.50"
                _hover={{ bg: "blue.100" }}
                onClick={() => setIsExpanded(true)}
              >
                <Plus size={44} color="currentColor" />
              </Button>
            </Box>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="expanded"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <Box borderWidth="1px" borderRadius="xl" p={{ base: 4, md: 5 }}>
              <VStack as="form" onSubmit={handleSubmit} align="stretch" gap={4}>
                <HStack justify="space-between" align="center">
                  <Heading size="md">Create Task</Heading>
                  <Button
                    size="sm"
                    variant="outline"
                    borderWidth="1px"
                    borderColor="gray.300"
                    borderRadius="full"
                    minW="36px"
                    h="36px"
                    p={0}
                    color="gray.700"
                    _hover={{ bg: "gray.100" }}
                    aria-label="Collapse create task panel"
                    onClick={() => {
                      setIsExpanded(false)
                      setErrorMessage("")
                    }}
                  >
                    <X size={16} />
                  </Button>
                </HStack>
                <Text color="fg.muted" fontSize="sm">
                  Add details now so tasks are easier to prioritize and plan.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Field.Root required>
                    <Field.Label>
                      Title
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="What needs to get done?"
                      value={title}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        setTitle(nextValue)
                        if (nextValue.trim()) {
                          setErrorMessage("")
                        }
                      }}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Priority</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Category</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Health">Health</option>
                        <option value="Learning">Learning</option>
                        <option value="Productivity">Productivity</option>
                        <option value="Social">Social</option>
                        <option value="Selfcare">Selfcare</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Due Date &amp; Time</Field.Label>
                    <Input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root gridColumn={{ base: "span 1", md: "span 2" }}>
                    <Field.Label>Description</Field.Label>
                    <Textarea
                      placeholder="Add extra details (optional)"
                      resize="vertical"
                      minH="100px"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field.Root>
                </SimpleGrid>

                {errorMessage ? (
                  <Alert.Root status="error" variant="surface">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{errorMessage}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : null}

                <Button colorScheme="blue" type="submit" alignSelf="flex-start">
                  Add Task
                </Button>
              </VStack>
            </Box>
          </MotionDiv>
        )}
      </AnimatePresence>
    </Box>
  )
}
