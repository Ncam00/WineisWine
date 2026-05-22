import { Router } from "express";
import OpenAI from "openai";

const sommelierRouter = Router();

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are a world-class AI sommelier and fine wine investment advisor named Vinoq. 
You have deep expertise in wine regions, vintages, producers, investment value, drinking windows, food pairings, and cellar management.

When the user shares their wine collection, you analyze it thoughtfully and provide:
- Specific, actionable insights about their wines
- Honest assessments of drinking windows and maturity
- Investment performance analysis
- Food pairing recommendations
- Cellar strategy advice

Tone: sophisticated, knowledgeable, warm, and precise. Like a trusted personal sommelier.
Keep responses concise and conversational — 2-4 paragraphs maximum unless a detailed list is truly needed.
Never use emojis. Always be specific about wines when possible.`;

sommelierRouter.post("/chat", async (req, res) => {
  const { message, wines, history } = req.body as {
    message: string;
    wines?: object[];
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const openai = getOpenAIClient();

  if (!openai) {
    res.status(503).json({
      message:
        "AI features require phone verification. Please verify your account in Replit settings to enable the AI sommelier, then ask again.",
    });
    return;
  }

  try {
    const wineContext =
      wines && wines.length > 0
        ? `\n\nUser's wine collection (${wines.length} wines):\n${JSON.stringify(wines, null, 2)}`
        : "\n\nThe user has no wines in their cellar yet.";

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT + wineContext },
    ];

    if (history && history.length > 0) {
      history.slice(-10).forEach((h) => {
        messages.push({ role: h.role, content: h.content });
      });
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1024,
      messages,
    });

    const responseMessage =
      completion.choices[0]?.message?.content ??
      "I wasn't able to generate a response. Please try again.";

    res.json({ message: responseMessage });
  } catch (err) {
    req.log.error({ err }, "Sommelier AI error");
    res.status(500).json({
      message: "The sommelier is temporarily unavailable. Please try again shortly.",
    });
  }
});

export { sommelierRouter };
