const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb")
const crypto = require("crypto")

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}

exports.handler = async (event) => {
  console.log("POST /tasks event:", JSON.stringify(event))

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
    const priorityOptions = new Set(["low", "medium", "high"])
    const normalizedPriority = String(body.priority || "medium").toLowerCase()

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
    const normalizedCategory = String(body.category || "productivity")
      .toLowerCase()
      .replace(/\s+/g, "")
    const resolvedCategory = categoryOptions.has(normalizedCategory)
      ? categoryLabelByKey[normalizedCategory]
      : "Productivity"
    const trimmedDescription = body.description
      ? String(body.description).trim()
      : ""

    if (!body.title || !body.title.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Title is required" }),
      }
    }

    const item = {
      userId,
      taskId: crypto.randomUUID(),
      title: body.title.trim(),
      description: trimmedDescription || `${resolvedCategory} related task`,
      priority: priorityOptions.has(normalizedPriority)
        ? normalizedPriority
        : "medium",
      dueDate: body.dueDate ? String(body.dueDate) : "",
      category: resolvedCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    await docClient.send(
      new PutCommand({
        TableName: process.env.TASKS_TABLE,
        Item: item,
      })
    )

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error("Create task error:", error)

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to create task" }),
    }
  }
}

