export const SUCCESS_BURST_PARTICLES = Array.from({ length: 42 }, (_, index) => {
  const angle = index * 18
  const radians = (angle * Math.PI) / 180
  const outwardX = Math.cos(radians)
  const outwardY = Math.sin(radians)
  const edgeDistance = 45 + (index % 3) * 2.5

  return {
    angle,
    outwardX,
    outwardY,
    startX: 50 + outwardX * edgeDistance,
    startY: 50 + outwardY * edgeDistance,
  }
})

export const SUCCESS_BURST_COLORS = [
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#f97316",
]

export function runCompleteShake(shakeControls) {
  return shakeControls.start({
    x: [0, -8, 8, -6, 6, 0],
    rotate: [0, -1.2, 1.2, -0.9, 0.9, 0],
    transition: {
      duration: 0.38,
      ease: "easeInOut",
    },
  })
}
