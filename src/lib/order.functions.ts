import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().min(3).max(40),
    address: z.string().min(3).max(300),
    city: z.string().min(1).max(120),
    zip: z.string().min(2).max(20),
    country: z.string().min(2).max(80),
    note: z.string().max(1000).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        brand: z.string(),
        color: z.string(),
        size: z.number(),
        qty: z.number().int().min(1).max(20),
        price: z.number().min(0),
      }),
    )
    .min(1)
    .max(30),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => OrderSchema.parse(data))
  .handler(async ({ data }) => {
    const webhook = process.env.DISCORD_ORDER_WEBHOOK;
    if (!webhook) throw new Error("Discord webhook not configured");

    const total = data.items.reduce((s, i) => s + i.qty * i.price, 0);
    const orderId = `ALV-${Date.now().toString(36).toUpperCase()}`;

    const itemsField = data.items
      .map(
        (i) =>
          `• **${i.brand} ${i.name}** — farba **${i.color}**, veľkosť ${i.size} × ${i.qty}  =  €${(
            i.qty * i.price
          ).toFixed(2)}`,
      )
      .join("\n");

    const address = `${data.customer.address}\n${data.customer.zip} ${data.customer.city}\n${data.customer.country}`;

    const embed: {
      title: string;
      description: string;
      color: number;
      fields: { name: string; value: string; inline: boolean }[];
      timestamp: string;
      footer: { text: string };
    } = {
      title: "🥂 Nová objednávka — Alvero",
      description: `Objednávka **${orderId}**`,
      color: 0xd4af37,
      fields: [
        {
          name: "👤 Zákazník",
          value: `**${data.customer.name}**\n${data.customer.email}\n${data.customer.phone}`,
          inline: false,
        },
        { name: "📍 Adresa doručenia", value: address, inline: false },
        { name: "👞 Položky (značka · farba · veľkosť)", value: itemsField, inline: false },
        { name: "💰 Spolu", value: `**€${total.toFixed(2)}**`, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "Alvero" },
    };

    if (data.customer.note) {
      embed.fields.push({ name: "📝 Poznámka", value: data.customer.note, inline: false });
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Alvero Orders", embeds: [embed] }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`Discord webhook failed [${res.status}]: ${txt}`);
      throw new Error(`Nepodarilo sa odoslať objednávku (${res.status})`);
    }

    return { ok: true as const, orderId, total };
  });
