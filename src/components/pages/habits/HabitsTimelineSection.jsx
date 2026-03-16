import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import SurfacePanel from "../../ui/SurfacePanel"

export default function HabitsTimelineSection({ days, selectedDate, onSelectDate }) {
  return (
    <SurfacePanel>
      <Box overflowX="auto" py={1}>
        <HStack w="fit-content" minW="100%" justify="center" gap={3}>
          {days.map((day) => {
            const isSelected = day.key === selectedDate

            return (
              <VStack
                key={day.key}
                as="button"
                type="button"
                boxSize={{ base: "86px", md: "102px" }}
                flexShrink={0}
                justify="center"
                borderWidth="1px"
                borderRadius="full"
                borderColor={isSelected ? "blue.500" : day.isToday ? "green.500" : "border"}
                bg={isSelected ? "blue.500" : "bg"}
                color={isSelected ? "white" : "inherit"}
                boxShadow={isSelected ? "0 10px 20px rgba(59, 130, 246, 0.28)" : "none"}
                gap={0}
                cursor="pointer"
                aria-pressed={isSelected}
                transition="transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: isSelected
                    ? "0 12px 24px rgba(59, 130, 246, 0.32)"
                    : "0 8px 18px rgba(15, 23, 42, 0.12)",
                }}
                _active={{ transform: "translateY(0)" }}
                onClick={() => onSelectDate(day.key)}
              >
                <Text fontSize="sm" fontWeight="medium">
                  {day.weekday}
                </Text>
                <Text fontSize="xl" fontWeight="bold" lineHeight="1.2">
                  {day.dayNumber}
                </Text>
                <Text fontSize="xs">{day.month}</Text>
              </VStack>
            )
          })}
        </HStack>
      </Box>
    </SurfacePanel>
  )
}
