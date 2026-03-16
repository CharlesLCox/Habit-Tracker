const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb")
const crypto = require("crypto")

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}

const dayOptions = new Set([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
])

const categoryOptions = new Set([
  "health",
  "learning",
  "productivity",
  "social",
  "selfcare",
])

const categoryLabelByKey = {
  health: "Health",
  learning: "Learning",
  productivity: "Productivity",
  social: "Social",
  selfcare: "Selfcare",
}

exports.handler = async (event) => {
  console.log("POST /habits event:", JSON.stringify(event))

  const claims = event.requestContext?.authorizer?.claims
  const userId = claims?.sub

  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Unauthorized" }),
    }
  }

  try {
    const body = JSON.parse(event.body || "{}")
    const title = body.title ? String(body.title).trim() : ""
    const normalizedCategory = String(body.category || "selfcare")
      .toLowerCase()
      .replace(/\s+/g, "")
    const resolvedCategory = categoryOptions.has(normalizedCategory)
      ? categoryLabelByKey[normalizedCategory]
      : "Selfcare"
    const description = body.description
      ? String(body.description).trim()
      : `${resolvedCategory} related habit`

    const incomingDays = Array.isArray(body.activeDays) ? body.activeDays : []
    const activeDays = incomingDays
      .map((day) => String(day).trim())
      .filter((day, index, allDays) => {
        return dayOptions.has(day) && allDays.indexOf(day) === index
      })

    if (!title) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Title is required" }),
      }
    }

    const item = {
      userId,
      habitId: crypto.randomUUID(),
      title,
      description,
      category: resolvedCategory,
      activeDays,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }

    await docClient.send(
      new PutCommand({
        TableName: process.env.HABITS_TABLE,
        Item: item,
      })
    )

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error("Create habit error:", error)

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to create habit" }),
    }
  }
}
