#!/usr/bin/env node
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";
import main from "../script/main.js";
import fs from "fs";
import dayjs from 'dayjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

main();

app.use(express.static(path.resolve(__dirname, "../public")));

app.use(express.json({ limit: "5mb" }));

app.post("/api/message/create", async (req, res) => {
  const formattedNow = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const messagesLogPath = path.resolve(__dirname, "../messages/messages.log");
  const messagesLogBackupPath = path.resolve(__dirname, `../messages/${formattedNow}.log`);
  fs.copyFileSync(messagesLogPath, messagesLogBackupPath);
  fs.writeFileSync(messagesLogPath, "");
  res.json({ ok: true, name:  formattedNow});
});

app.get("/api/message/get", async (req, res) => {
  const defaultName = "messages.log";
  const { name = defaultName } = req.query;
  const messagesLogPath = path.resolve(__dirname, `../messages/${name}`);
  const messages = fs.readFileSync(messagesLogPath, "utf-8");
  res.json({ ok: true, messages });
});

app.get("/api/message/list", async (req, res) => {
  try {
    const messagesLogPath = path.resolve(__dirname, "../messages");
    const messages = fs.readdirSync(messagesLogPath)
      .filter(message => message.endsWith('.log'))
      .map(filename => {
        const stats = fs.statSync(path.join(messagesLogPath, filename));
        return {
          filename,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => {
        if (a.filename === "messages.log" && b.filename !== "messages.log") return -1;
        if (a.filename !== "messages.log" && b.filename === "messages.log") return 1;
        
        return new Date(b.mtime) - new Date(a.mtime);
      })
      .map(item => item.filename);

    res.json({ ok: true, messages });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Claude Peek start: ${url}`);
  open(url);
});
