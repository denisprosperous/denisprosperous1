"use client"

import { useEffect, useRef } from "react"

interface ChartData {
  name: string
  [key: string]: string | number
}

interface BarChartProps {
  data: ChartData[]
}

export function BarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    // Find max value for scaling
    let maxValue = 0
    const keys = Object.keys(data[0]).filter((key) => key !== "name")

    data.forEach((item) => {
      keys.forEach((key) => {
        if (typeof item[key] === "number" && item[key] > maxValue) {
          maxValue = item[key] as number
        }
      })
    })

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Draw bars
    const barWidth = availableWidth / data.length / (keys.length + 1)

    // Colors for different data series
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]

    data.forEach((item, i) => {
      keys.forEach((key, j) => {
        const value = item[key] as number
        const barHeight = (value / maxValue) * availableHeight

        ctx.fillStyle = colors[j % colors.length]
        ctx.fillRect(
          padding + i * (barWidth * (keys.length + 1)) + j * barWidth,
          height - padding - barHeight,
          barWidth,
          barHeight,
        )
      })

      // Draw x-axis labels
      ctx.fillStyle = "#666"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(
        item.name.toString(),
        padding + i * (barWidth * (keys.length + 1)) + (barWidth * keys.length) / 2,
        height - padding + 15,
      )
    })

    // Draw y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue * i) / 5)
      const y = height - padding - (i / 5) * availableHeight

      ctx.fillStyle = "#666"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toString(), padding - 5, y + 3)

      // Draw grid line
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = "#eee"
      ctx.stroke()
    }

    // Draw legend
    const legendX = width - padding - 100
    const legendY = padding

    keys.forEach((key, i) => {
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(legendX, legendY + i * 20, 15, 15)

      ctx.fillStyle = "#666"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(key, legendX + 20, legendY + i * 20 + 12)
    })
  }, [data])

  return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
}

export function LineChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    // Find max value for scaling
    let maxValue = 0
    const keys = Object.keys(data[0]).filter((key) => key !== "name")

    data.forEach((item) => {
      keys.forEach((key) => {
        if (typeof item[key] === "number" && item[key] > maxValue) {
          maxValue = item[key] as number
        }
      })
    })

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Colors for different data series
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]

    // Draw lines
    keys.forEach((key, j) => {
      ctx.beginPath()

      data.forEach((item, i) => {
        const value = item[key] as number
        const x = padding + i * (availableWidth / (data.length - 1))
        const y = height - padding - (value / maxValue) * availableHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.strokeStyle = colors[j % colors.length]
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw points
      data.forEach((item, i) => {
        const value = item[key] as number
        const x = padding + i * (availableWidth / (data.length - 1))
        const y = height - padding - (value / maxValue) * availableHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = colors[j % colors.length]
        ctx.fill()
      })
    })

    // Draw x-axis labels
    data.forEach((item, i) => {
      ctx.fillStyle = "#666"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.name.toString(), padding + i * (availableWidth / (data.length - 1)), height - padding + 15)
    })

    // Draw y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue * i) / 5)
      const y = height - padding - (i / 5) * availableHeight

      ctx.fillStyle = "#666"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toString(), padding - 5, y + 3)

      // Draw grid line
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = "#eee"
      ctx.stroke()
    }

    // Draw legend
    const legendX = width - padding - 100
    const legendY = padding

    keys.forEach((key, i) => {
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(legendX, legendY + i * 20, 15, 15)

      ctx.fillStyle = "#666"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(key, legendX + 20, legendY + i * 20 + 12)
    })
  }, [data])

  return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
}

export function PieChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Colors
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

    // Calculate total value
    const total = data.reduce((sum, item) => sum + (item.value as number), 0)

    // Draw pie slices
    let startAngle = 0

    data.forEach((item, i) => {
      const value = item.value as number
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY)

      startAngle += sliceAngle
    })

    // Draw legend
    const legendX = width - 150
    const legendY = 40

    data.forEach((item, i) => {
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(legendX, legendY + i * 20, 15, 15)

      ctx.fillStyle = "#666"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`${item.name}: ${item.value}`, legendX + 20, legendY + i * 20 + 12)
    })
  }, [data])

  return <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
}
