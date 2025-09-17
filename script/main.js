#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import alternateFile from "./alternateFile.js";

const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36mℹ️  ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  step: (step, msg) => console.log(`\x1b[35m🔄 Step ${step}: ${msg}\x1b[0m`),
};

const main = () => {
  log.info("Starting Claude Code proxy setup...");

  // 1. Get global npm root directory
  log.step(1, "Getting global npm root directory");
  const npmGlobalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
  const claudePath = path.join(npmGlobalRoot, "@anthropic-ai", "claude-code");
  const cliPath = path.join(claudePath, "cli.js");
  log.info(`Claude Path: ${claudePath}`);
  log.info(`Claude cliPath: ${cliPath}`);

  // 2. Check if directory exists
  log.step(2, "Verifying Claude Code installation directory");
  if (!fs.existsSync(claudePath)) {
    log.error(`Directory does not exist: ${claudePath}`);
    process.exit(1);
  }

  log.success("Claude Code directory found");

  // 3. 检测文件里包不包含claude-code-proxy: Has been injected，如果包含则跳过
  log.step(3, "Checking if cli.js has already been modified");
  if (!fs.existsSync(cliPath)) {
    log.error(`cli.js does not exist in: ${claudePath}`);
    process.exit(1);
  }

  const cliContent = fs.readFileSync(cliPath, "utf-8");
  const isModified = cliContent.includes(
    "claude-code-proxy: Has been injected"
  );
  log.success(
    "cli.js has already been modified. Skipping further modifications."
  );
  
  if (!isModified) {
    log.success("cli.js is unmodified. Proceeding with modifications.");

    // 4. Backup cli.js
    log.step(4, "Creating backup of cli.js");
    const backupPath = path.join(claudePath, "cli.bak");

    if (fs.existsSync(cliPath)) {
      fs.renameSync(cliPath, backupPath);
      log.success("Backup created: cli.js -> cli.bak");
    } else {
      log.error("cli.js does not exist");
      process.exit(1);
    }

    // 5. Format file using js-beautify
    log.step(5, "Formatting file with js-beautify");
    execSync(`js-beautify "${backupPath}" > "${cliPath}"`, {
      stdio: "inherit",
    });
    log.success("New cli.js generated with proper formatting");

    // 6. Apply custom modifications
    log.step(6, "Applying custom modifications to cli.js");
    alternateFile(cliPath);
    log.success("Custom modifications applied successfully");

    // 7. Set executable permissions
    log.step(7, "Setting executable permissions");
    execSync(`chmod +x ${cliPath}`, { stdio: "inherit" });
    log.success("Executable permissions set");

    log.success("🎉 Script execution completed successfully!");
  }
};

export default main;
