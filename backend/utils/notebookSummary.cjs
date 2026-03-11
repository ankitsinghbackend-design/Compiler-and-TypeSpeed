const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function generateNotebookSummary(notebook) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Handle both 'qas' and 'qa' properties for compatibility
  const qaEntries = notebook.qas || notebook.qa || [];
  
  if (!qaEntries || qaEntries.length === 0) {
    throw new Error("Notebook contains no Q&A entries to summarize");
  }

  // Create a comprehensive prompt for notebook summarization
  const notebookContent = qaEntries.map((qa, index) => {
    return `Q${index + 1}: ${qa.question}\nCode: ${qa.code}\nLanguage: ${qa.language}\n---`;
  }).join('\n\n');

  const prompt = `You are an expert technical writing assistant for DSA interview prep.
Your job is to generate clean, professional revision sheets in markdown for any DSA topic. The revision sheet should be crisp, structured, and optimized for last-minute review.
Follow this exact format with markdown headings, bullets, and minimal code bits — no long explanations, no full code.

NOTEBOOK CONTENT:
${notebookContent}

📘 FORMAT:
# 📘 ${notebook.name} – Revision Sheet

---

## 🔍 Topic Summary
- 2 to 3 bullet points describing what this topic covers
- Why it's important in interviews or real-world systems

---

## 🧠 Core Concepts & Strategies
- List 6–8 named strategies, not explanations
- e.g., "Two-pointer reversal", "Slow-fast loop detection", "Dummy node technique"

---

## ⚙️ Pattern Templates
For each key pattern, include:
🔸 Title (1 line max)  
🔹 Code Bit (in markdown code block)

Example:
\`\`\`cpp
// Fast and Slow Pointers
ListNode* slow = head, *fast = head;
while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
}
\`\`\`

---



Generate the revision sheet now using this exact format.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating notebook summary:", error);
    throw new Error("Failed to generate notebook summary");
  }
}

module.exports = { generateNotebookSummary };