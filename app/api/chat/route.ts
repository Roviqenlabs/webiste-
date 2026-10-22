import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
export const runtime = 'nodejs';
const schema = z.object({ message: z.string().trim().min(1).max(2000) });
const systemPrompt = `You are the Roviqen Labs website assistant. Roviqen Labs is an early-stage IT and robotics startup presenting concept areas: AI Assistant, Smart IoT, Robotics, Smart Software, Pick & Place, and Room Sense. Help visitors understand these concepts and ask useful questions about their business goals. Be friendly, clear, and honest. Do not claim concept projects are completed deployments. Never invent clients, results, prices, dates, certifications, or guarantees. For quotes, invite the visitor to use the contact form. Never request passwords, API keys, payment card details, or other secrets.`;
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please enter a message up to 2000 characters.' }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Live AI is not configured yet. Please use the contact form or try the demo assistant later.' }, { status: 503 });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: parsed.data.message }], max_tokens: 350, temperature: 0.4 });
    return NextResponse.json({ reply: result.choices[0]?.message?.content?.trim() || 'Please try again or contact our team.' });
  } catch { return NextResponse.json({ error: 'The assistant is temporarily unavailable. Please try again.' }, { status: 500 }); }
}
