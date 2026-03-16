const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/

exports.handler = async (event) => {
  console.log("PATCH /habits/{habitId}/complete event:", JSON.stringify(event))

  const claims = event.requestContext?.authorizer?.claims
  const userId = claims?.sub
  const habitId = event.pathParameters?.habitId
  const body = JSON.parse(event.body || "{}")
  const completionDate = String(body.date || "").trim()

  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Unauthorized" }),
    }
  }

  if (!habitId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "habitId is required" }),
    }
  }

  if (!completionDate || !datePattern.test(completionDate)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "date (YYYY-MM-DD) is required" }),
    }
  }

  try {
    const existingResult = await docClient.send(
      new GetCommand({
        TableName: process.env.HABITS_TABLE,
        Key: { userId, habitId },
      })
    )

    const existingHabit = existingResult.Item
    if (!existingHabit) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Habit not found" }),
      }
    }

    const existingCompletedDates = Array.isArray(existingHabit.completedDates)
      ? existingHabit.completedDates
      : []

    if (existingCompletedDates.includes(completionDate)) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(existingHabit),
      }
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.HABITS_TABLE,
        Key: { userId, habitId },
        UpdateExpression:
          "SET completedDates = list_append(if_not_exists(completedDates, :empty), :newDate), updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":empty": [],
          ":newDate": [completionDate],
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    )

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Attributes),
    }
  } catch (error) {
    console.error("Complete habit error:", error)

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to complete habit" }),
    }
  }
}
