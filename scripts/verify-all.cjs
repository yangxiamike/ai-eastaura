#!/usr/bin/env node

const { spawnSync } = require("child_process");

const includeIntakeFlow = process.env.VERIFY_INCLUDE_INTAKE_FLOW === "true";

const steps = [
  {
    name: "typecheck",
    command: "npm",
    args: ["run", "typecheck"],
  },
  {
    name: "workbench_proxy",
    command: "npm",
    args: ["run", "verify:workbench-proxy"],
  },
  {
    name: "notification_channels",
    command: "npm",
    args: ["run", "verify:notification-channels"],
  },
];

if (includeIntakeFlow) {
  steps.push({
    name: "intake_flow",
    command: "npm",
    args: ["run", "verify:intake-flow"],
  });
}

const summary = [];
let failed = false;

for (const step of steps) {
  console.log(`\n=== verify step: ${step.name} ===`);
  const startedAt = Date.now();
  const result = spawnSync(step.command, step.args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  const durationMs = Date.now() - startedAt;
  const exitCode = typeof result.status === "number" ? result.status : 1;

  summary.push({
    step: step.name,
    exitCode,
    durationMs,
  });

  if (exitCode !== 0) {
    failed = true;
    break;
  }
}

console.log("\n=== verify summary ===");
console.log(JSON.stringify({ failed, includeIntakeFlow, steps: summary }, null, 2));
process.exit(failed ? 1 : 0);
