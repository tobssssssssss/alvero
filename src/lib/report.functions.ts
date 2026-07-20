import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ReportSchema = z.object({
  kind: z.enum(["error", "recovered", "security"]),
  message: z.string().min(1).max(1500),
  stack: z.string().max(4000).optional().default(""),
  url: z.string().max(500).optional().default(""),
});

export const reportEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ReportSchema.parse(d))
  .handler(async ({ data }) => {
    const webhook = process.env.DISCORD_ORDER_WEBHOOK;
    if (!webhook) return { ok: false as const };

    const colors = { error: 0xff3355, recovered: 0x00c078, security: 0xffa500 };
    const titles = {
      error: "🛑 Chyba na stránke — Alvero",
      recovered: "✅ Chyba opravená — stránka beží",
      security: "⚠️ Bezpečnostné upozornenie — Alvero",
    };

    const embed = {
      title: titles[data.kind],
      color: colors[data.kind],
      fields: [
        { name: "Správa", value: data.message.slice(0, 1000) },
        ...(data.stack ? [{ name: "Stack", value: "```" + data.stack.slice(0, 900) + "```" }] : []),
        ...(data.url ? [{ name: "URL", value: data.url }] : []),
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "Alvero Monitor" },
    };

    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Alvero Monitor", embeds: [embed] }),
    }).catch(() => {});

    return { ok: true as const };
  });
