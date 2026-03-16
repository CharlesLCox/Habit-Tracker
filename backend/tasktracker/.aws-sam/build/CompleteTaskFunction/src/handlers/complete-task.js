const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}

exports.handler = async (event) => {
  console.log("PATCH /tasks/{taskId}/complete event:", JSON.stringify(event))

  const claims = event.requestContext?.authorizer?.claims
  const userId = claims?.sub
  const taskId = event.pathParameters?.taskId

  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Unauthorized" }),
    }
  }

  if (!taskId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "taskId is required" }),
    }
  }

  try {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.TASKS_TABLE,
        Key: { userId, taskId },
        UpdateExpression: "SET completed = :completed, completedAt = :completedAt",
        ExpressionAttributeValues: {
          ":completed": true,
          ":completedAt": new Date().toISOString(),
        },
        ConditionExpression: "attribute_exists(taskId)",
        ReturnValues: "ALL_NEW",
      })
    )

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result.Attributes),
    }
  } catch (error) {
    console.error("Complete task error:", error)

    if (error?.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Task not found" }),
      }
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to complete task" }),
    }
  }
}
