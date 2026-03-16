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
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"

const MotionDiv = motion.div

const selectableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export default function HabitForm({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Selfcare")
  const [activeDays, setActiveDays] = useState([])
  const [errorMessage, setErrorMessage] = useState("")

  function toggleDay(day) {
    setActiveDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((currentDay) => currentDay !== day)
      }

      return [...prev, day]
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setErrorMessage("Please enter a habit title.")
      return
    }

    if (!activeDays.length) {
      setErrorMessage("Please select at least one active day.")
      return
    }

    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      category,
      activeDays,
    }

    setErrorMessage("")
    onAdd(payload)
    setTitle("")
    setDescription("")
    setCategory("Selfcare")
    setActiveDays([])
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
                aria-label="Expand create habit panel"
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
                  <Heading size="md">Create Habit</Heading>
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
                    aria-label="Collapse create habit panel"
                    onClick={() => {
                      setIsExpanded(false)
                      setErrorMessage("")
                    }}
                  >
                    <X size={16} />
                  </Button>
                </HStack>

                <Text color="fg.muted" fontSize="sm">
                  Add a habit with category and active days.
                </Text>

                <Field.Root required>
                  <Field.Label>
                    Title
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    placeholder="What habit do you want to track?"
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
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    placeholder="Describe your habit (optional)"
                    resize="vertical"
                    minH="100px"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Active Days</Field.Label>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {selectableDays.map((day) => {
                      const isSelected = activeDays.includes(day)

                      return (
                        <Button
                          key={day}
                          type="button"
                          size="sm"
                          variant={isSelected ? "solid" : "outline"}
                          colorPalette={isSelected ? "blue" : "gray"}
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                        </Button>
                      )
                    })}
                  </Box>
                </Field.Root>

                {errorMessage ? (
                  <Alert.Root status="error" variant="surface">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{errorMessage}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : null}

                <Button colorScheme="blue" type="submit" alignSelf="flex-start">
                  Add Habit
                </Button>
              </VStack>
            </Box>
          </MotionDiv>
        )}
      </AnimatePresence>
    </Box>
  )
}
