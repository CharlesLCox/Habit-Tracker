const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}

exports.handler = async (event) => {
  console.log("DELETE /tasks/{taskId} event:", JSON.stringify(event))

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
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.TASKS_TABLE,
        Key: {
          userId,
          taskId,
        },
      })
    )

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Task deleted", taskId }),
    }
  } catch (error) {
    console.error("Delete task error:", error)

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Failed to delete task" }),
    }
  }
}

