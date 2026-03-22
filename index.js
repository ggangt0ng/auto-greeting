import { getContext } from "../../../scripts/st-context.js";
import { eventSource } from "../../../scripts/events.js";
import { generate } from "../../../scripts/generate.js";
import { addOneMessage } from "../../../scripts/chat.js";

let customAddonPrompt = "";
let autoEnabled = true;
let hasGenerated = false;

/* =========================
   프롬프트 구성
========================= */
function buildPrompt(context) {
    const char = context.character;
    const user = context.power_user?.persona || "";
    const world = context.world_info || "";

    const basePrompt = context.mainPrompt || "";

    return `
${basePrompt}

[Character Info]
${char?.description || ""}

[User Persona]
${user}

[World Info]
${world}

${customAddonPrompt}
`;
}

/* =========================
   생성
========================= */
async function generateGreeting() {
    const context = getContext();
    const prompt = buildPrompt(context);

    const result = await generate({ prompt });
    return result;
}

/* =========================
   메시지 삽입
========================= */
async function insertGreeting() {
    const context = getContext();
    const greeting = await generateGreeting();

    addOneMessage({
        name: context.character.name,
        is_user: false,
        mes: greeting
    });
}

/* =========================
   settings.html UI 연결
========================= */
function setupUI() {
    const promptBox = document.getElementById("ag-prompt");
    const toggle = document.getElementById("ag-auto-toggle");
    const btn = document.getElementById("ag-generate");

    if (!promptBox) return;

    promptBox.value = customAddonPrompt;

    promptBox.addEventListener("input", () => {
        customAddonPrompt = promptBox.value;
    });

    toggle.addEventListener("change", () => {
        autoEnabled = toggle.checked;
    });

    btn.addEventListener("click", async () => {
        await insertGreeting();
    });
}

/* =========================
   이벤트 자동 실행
========================= */
eventSource.on("CHAT_CHANGED", async () => {
    if (!autoEnabled) return;
    if (hasGenerated) return;

    hasGenerated = true;
    await insertGreeting();
});

eventSource.on("CHAT_CREATED", () => {
    hasGenerated = false;
});

/* =========================
   초기화 / 마술봉용 init
========================= */
export function init() {
    // DOM 로드 후 UI 연결
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupUI, 500);
    });
}