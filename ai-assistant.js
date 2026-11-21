import { startAssistantChat } from "./firebase-init.js";

const launcher = document.querySelector("#aiLauncher");
const panel = document.querySelector("#aiPanel");
const closeButton = document.querySelector("#aiClose");
const messages = document.querySelector("#aiMessages");
const form = document.querySelector("#aiForm");
const input = document.querySelector("#aiInput");
const sendButton = document.querySelector("#aiSend");
const useSchedule = document.querySelector("#aiUseSchedule");

let chat;
let isSending = false;

try {
  chat = startAssistantChat();
} catch (error) {
  console.error("Unable to initialize the Firebase AI Logic chat:", error);
}

function setPanelOpen(isOpen) {
  panel.hidden = !isOpen;
  launcher.hidden = isOpen;
  launcher.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) input.focus();
}

function appendMessage(text, kind = "assistant") {
  const message = document.createElement("div");
  message.className = `ai-message ${kind}`;
  message.textContent = text;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function getScheduleSummary() {
  try {
    const items = JSON.parse(localStorage.getItem("dayflow.items.v1") || "[]");
    if (!Array.isArray(items) || items.length === 0) return "目前沒有儲存的行程。";

    const categories = { study: "學習", leisure: "休閒", life: "生活", task: "待辦" };
    return items.slice(0, 40).map((item) => {
      const title = String(item.title || "未命名").slice(0, 80);
      const date = String(item.date || "日期未定");
      const time = String(item.time || "整天");
      const category = categories[item.category] || "其他";
      return `- ${date} ${time}｜${category}｜${title}`;
    }).join("\n");
  } catch {
    return "讀取行程摘要時發生問題。";
  }
}

function getFriendlyError(error) {
  const details = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  if (details.includes("app check") || details.includes("appcheck") || details.includes("permission_denied")) {
    return "AI 服務的 Firebase App Check 尚未完成設定。請稍後再試，或聯絡系統管理者。";
  }
  if (details.includes("api key") || details.includes("api_key") || details.includes("not enabled")) {
    return "Firebase AI Logic 尚未完成啟用。請稍後再試，或聯絡系統管理者。";
  }
  return "目前無法取得回覆，請稍後再試。";
}

async function sendMessage(rawText) {
  const text = rawText.trim();
  if (!text || isSending) return;
  if (!chat) {
    appendMessage("AI 助手目前無法啟動，請稍後再試。", "assistant error");
    return;
  }

  appendMessage(text, "user");
  input.value = "";
  isSending = true;
  input.disabled = true;
  sendButton.disabled = true;
  document.querySelectorAll(".ai-suggestion").forEach((button) => { button.disabled = true; });
  const pendingMessage = appendMessage("正在整理想法…");

  try {
    const prompt = useSchedule.checked
      ? `${text}\n\n[使用者已選擇提供目前行程摘要]\n${getScheduleSummary()}`
      : text;
    const result = await chat.sendMessage(prompt);
    pendingMessage.textContent = result.response.text() || "我暫時沒有可顯示的回覆，請換個方式再問一次。";
  } catch (error) {
    console.error("Firebase AI Logic request failed:", error);
    pendingMessage.classList.add("error");
    pendingMessage.textContent = getFriendlyError(error);
  } finally {
    isSending = false;
    input.disabled = false;
    sendButton.disabled = false;
    document.querySelectorAll(".ai-suggestion").forEach((button) => { button.disabled = false; });
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }
}

launcher.addEventListener("click", () => setPanelOpen(true));
closeButton.addEventListener("click", () => setPanelOpen(false));
form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
document.querySelectorAll(".ai-suggestion").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.aiPrompt || ""));
});
