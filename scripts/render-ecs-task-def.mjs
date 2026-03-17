import fs from "node:fs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function pickDefined(source, keys) {
  const selected = {};
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      selected[key] = source[key];
    }
  }
  return selected;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input;
const outputPath = args.output;
const imageUri = args["image-uri"];
const containerName = args["container-name"];

if (!inputPath || !outputPath || !imageUri) {
  throw new Error(
    "Usage: node scripts/render-ecs-task-def.mjs --input <in.json> --output <out.json> --image-uri <image> [--container-name <name>]"
  );
}

const raw = fs.readFileSync(inputPath, "utf8");
const parsed = JSON.parse(raw);
const taskDef = parsed.taskDefinition ?? parsed;

const allowedKeys = [
  "family",
  "taskRoleArn",
  "executionRoleArn",
  "networkMode",
  "containerDefinitions",
  "volumes",
  "placementConstraints",
  "requiresCompatibilities",
  "cpu",
  "memory",
  "tags",
  "pidMode",
  "ipcMode",
  "proxyConfiguration",
  "inferenceAccelerators",
  "ephemeralStorage",
  "runtimePlatform"
];

const newTaskDef = pickDefined(taskDef, allowedKeys);
const containers = Array.isArray(taskDef.containerDefinitions)
  ? taskDef.containerDefinitions
  : [];

if (!containers.length) {
  throw new Error("No containerDefinitions found in source task definition.");
}

let targetIndex = 0;
if (containerName) {
  targetIndex = containers.findIndex((container) => container.name === containerName);
  if (targetIndex < 0) {
    throw new Error(`Container '${containerName}' was not found in task definition.`);
  }
} else if (containers.length > 1) {
  throw new Error(
    "Task definition has multiple containers. Provide --container-name to choose which container image to update."
  );
}

newTaskDef.containerDefinitions = containers.map((container, index) => {
  if (index !== targetIndex) return container;
  return {
    ...container,
    image: imageUri
  };
});

fs.writeFileSync(outputPath, JSON.stringify(newTaskDef, null, 2));
