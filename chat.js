// Vercel serverless function: POST /api/chat
// Keeps your NVIDIA API key on the server so it never reaches the browser.
//
// Setup (Vercel → Project → Settings → Environment Variables):
//   NVIDIA_API_KEY   your key from https://build.nvidia.com (starts with "nvapi-")
//   NVIDIA_MODEL     optional, defaults to meta/llama-3.1-70b-instruct

const ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

const SYSTEM = `You are AI Companion, the friendly study assistant inside CampusHub, a college portal for students and faculty.
Help with: planning study time, breaking down assignments, explaining course topics (operating systems, databases, networks, algorithms, discrete maths), and understanding attendance rules (75% minimum).
Be warm, concise and practical. Use short paragraphs or a short list. If the user shares portal data (tasks, attendance, events), use it to give specific advice.
Never invent grades, deadlines or facts about the person that were not provided. If you are unsure, say so.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "AI Companion is not connected yet. Add NVIDIA_API_KEY in your Vercel project settings, then redeploy." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const context = typeof body?.context === "string" ? body.context.slice(0, 2000) : "";

  // Keep only the last 12 well-formed turns and cap their length.
  const history = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!history.length) return res.status(400).json({ error: "Send at least one message." });

  try {
    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        model: process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct",
        messages: [{ role: "system", content: SYSTEM + (context ? `\n\nPortal data for this user:\n${context}` : "") }, ...history],
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 600,
        stream: false,
      }),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("NVIDIA API error", upstream.status, detail.slice(0, 300));
      return res.status(502).json({ error: `The AI service returned an error (${upstream.status}). Check your API key and model name.` });
    }
    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ reply: reply || "I couldn't come up with an answer. Try rephrasing?" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not reach the AI service. Try again in a moment." });
  }
};
