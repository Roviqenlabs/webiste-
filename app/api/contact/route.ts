import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
export const runtime = 'nodejs';
const schema = z.object({ name:z.string().trim().min(2).max(120), email:z.string().trim().email().max(254), service:z.string().trim().min(1).max(120), message:z.string().trim().min(8).max(5000) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error:'Please check your name, email, service and message, then try again.' }, { status:400 });
    const { name, email, service, message } = parsed.data;
    let saved = false, emailed = false;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false } });
      const { error } = await db.from('contact_enquiries').insert({ name, email, service, message });
      if (error) { console.error('Supabase insert failed'); return NextResponse.json({ error:'We could not save your enquiry right now. Please try again later.' }, { status:500 }); }
      saved = true;
    }
    if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({ from:process.env.CONTACT_FROM_EMAIL, to:process.env.CONTACT_TO_EMAIL, replyTo:email, subject:`Website enquiry: ${service}`, text:`Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}` });
      if (error) { console.error('Email delivery failed'); if (!saved) return NextResponse.json({ error:'Your email could not be sent. Please try again later.' }, { status:502 }); }
      else emailed = true;
    }
    if (!saved && !emailed) return NextResponse.json({ error:'The contact form is not configured yet. Please email adminroviqenlabs@gmail.com directly.' }, { status:503 });
    return NextResponse.json({ ok:true, message:'Thank you! Your enquiry has been received.' });
  } catch { return NextResponse.json({ error:'Something went wrong. Please try again or email adminroviqenlabs@gmail.com.' }, { status:500 }); }
}
