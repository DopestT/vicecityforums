const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const OPENAI_MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest';

for (const [name, value] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY })) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

const restBase = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;

async function sb(path, { method = 'GET', body, prefer = 'return=representation' } = {}) {
  const response = await fetch(`${restBase}/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${method} ${path}: ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function openai(path, body) {
  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`OpenAI ${path}: ${response.status} ${text}`);
  return JSON.parse(text);
}

function extractResponseText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (typeof part.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

function parseJsonObject(text) {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Model did not return JSON: ${text.slice(0, 500)}`);
  return JSON.parse(match[0]);
}

async function moderateText(text) {
  if (!text.trim()) return { flagged: false, categories: [] };
  const data = await openai('moderations', {
    model: OPENAI_MODERATION_MODEL,
    input: text.slice(0, 12000),
  });
  const result = data.results?.[0] || {};
  const categories = Object.entries(result.categories || {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);
  return { flagged: Boolean(result.flagged), categories };
}

const OPERATOR_INSTRUCTIONS = `
You are ViceWire, the clearly labeled AI community operator for Vice City Forums, an independent GTA VI fan forum.

Your job is to improve community quality without pretending to be a human or an official Rockstar/Take-Two account.

Rules:
- Never claim affiliation with Rockstar Games or Take-Two Interactive.
- Never invent breaking news, release details, leaks, sources, quotes, or facts.
- Treat rumors as rumors and avoid amplifying unsupported claims as facts.
- Do not permanently ban users, delete significant user content, change rules, or take financial/legal actions.
- Flag severe harassment, threats, scams, spam, sexual exploitation, doxxing, dangerous wrongdoing, or other clearly unsafe content for owner review.
- A public reply should be concise, useful, natural, and appropriate for a gaming forum.
- Prefer no action when a human discussion is healthy and does not need intervention.
- Keep reasoning_summary to one short operator-facing sentence. Do not provide hidden chain-of-thought.

Return ONLY JSON with this shape:
{
  "action": "noop" | "reply" | "flag" | "lock_recommendation",
  "risk": "low" | "medium" | "high",
  "reasoning_summary": "short explanation",
  "reply": "public reply text or empty string"
}`;

async function decideForumEvent(job) {
  const payload = job.payload || {};
  const title = String(payload.title || '');
  const body = String(payload.body || '');
  const text = [title, body].filter(Boolean).join('\n\n');

  const moderation = await moderateText(text);
  if (moderation.flagged) {
    return {
      action: 'flag',
      risk: 'high',
      reasoning_summary: `Moderation system flagged: ${moderation.categories.join(', ') || 'unsafe content'}.`,
      reply: '',
    };
  }

  const data = await openai('responses', {
    model: OPENAI_MODEL,
    input: [
      { role: 'system', content: OPERATOR_INSTRUCTIONS },
      { role: 'user', content: `Event kind: ${job.kind}\nForum content:\n${text.slice(0, 16000)}` },
    ],
  });

  const decision = parseJsonObject(extractResponseText(data));
  const allowed = new Set(['noop', 'reply', 'flag', 'lock_recommendation']);
  if (!allowed.has(decision.action)) decision.action = 'noop';
  if (!['low', 'medium', 'high'].includes(decision.risk)) decision.risk = 'medium';
  decision.reasoning_summary = String(decision.reasoning_summary || '').slice(0, 500);
  decision.reply = String(decision.reply || '').slice(0, 3000);
  return decision;
}

async function generateCommunityThread(prompt) {
  const data = await openai('responses', {
    model: OPENAI_MODEL,
    input: [
      {
        role: 'system',
        content: `You are ViceWire AI, the clearly labeled community operator for an independent GTA VI fan forum. Create one strong discussion starter. Do not invent news, leaks, dates, quotes, or official claims. Keep it conversational and designed to invite member opinions. Return ONLY JSON: {"title":"...","body":"..."}.`,
      },
      { role: 'user', content: String(prompt || 'Create a fresh daily GTA VI / Vice City community discussion prompt that does not depend on unverified news.') },
    ],
  });
  const result = parseJsonObject(extractResponseText(data));
  return {
    title: String(result.title || 'ViceWire Daily Discussion').slice(0, 140),
    body: String(result.body || '').slice(0, 12000),
  };
}

async function insertAction(job, decision, status = 'pending', payload = {}) {
  const rows = await sb('vicewire_actions', {
    method: 'POST',
    body: {
      job_id: job.id,
      action_type: decision.action,
      target_table: job.source_table || null,
      target_id: job.source_id || null,
      payload,
      risk_level: decision.risk || 'low',
      status,
      model: OPENAI_MODEL,
      reasoning_summary: decision.reasoning_summary || null,
      executed_at: status === 'executed' ? new Date().toISOString() : null,
    },
  });
  return rows?.[0];
}

async function markJob(jobId, status, extra = {}) {
  const body = { status, ...extra };
  if (status === 'processing') body.started_at = new Date().toISOString();
  if (status === 'done' || status === 'failed') body.completed_at = new Date().toISOString();
  await sb(`vicewire_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', body });
}

async function handleForumEvent(job, settings) {
  const decision = await decideForumEvent(job);

  if (decision.action === 'noop') {
    await insertAction(job, decision, 'executed');
    return;
  }

  if (decision.action === 'reply') {
    const threadId = job.kind === 'thread_created' ? job.source_id : job.payload?.thread_id;
    if (!threadId || !decision.reply) {
      await insertAction(job, { ...decision, action: 'noop', reasoning_summary: 'Reply was not executable because the thread target or reply text was missing.' }, 'executed');
      return;
    }

    if (settings.auto_reply) {
      const replyRows = await sb('replies', {
        method: 'POST',
        body: {
          thread_id: threadId,
          author_id: null,
          body: decision.reply,
          is_demo: true,
          demo_author_label: settings.public_label || 'VICEWIRE AI',
        },
      });
      await insertAction(job, decision, 'executed', { reply_id: replyRows?.[0]?.id || null, thread_id: threadId, reply: decision.reply });
    } else {
      await insertAction(job, decision, 'pending', { thread_id: threadId, reply: decision.reply });
    }
    return;
  }

  // Flags and lock recommendations always require owner/admin review in V1.
  await insertAction(job, decision, 'pending');
}

async function getGeneralCategory() {
  const rows = await sb('categories?select=id,slug,name&slug=eq.general-discussion&limit=1');
  if (rows?.[0]) return rows[0];
  const fallback = await sb('categories?select=id,slug,name&order=sort_order.asc&limit=1');
  return fallback?.[0] || null;
}

async function handleThreadGeneration(job, settings) {
  if (!settings.auto_post && job.kind === 'daily_post') {
    await insertAction(job, {
      action: 'noop', risk: 'low', reasoning_summary: 'Daily post skipped because auto_post is disabled.'
    }, 'executed');
    return;
  }

  const category = await getGeneralCategory();
  if (!category) throw new Error('No forum category exists for ViceWire posting.');

  const prompt = job.payload?.prompt || (job.kind === 'daily_post'
    ? 'Create today\'s community discussion prompt. Make it specific enough to spark opinions, but do not rely on current rumors or unverified news.'
    : 'Create a community discussion thread based on the admin request.');

  const generated = await generateCommunityThread(prompt);
  if (!generated.body) throw new Error('Model returned an empty thread body.');

  const rows = await sb('threads', {
    method: 'POST',
    body: {
      category_id: category.id,
      author_id: null,
      title: generated.title,
      body: generated.body,
      is_demo: true,
      demo_author_label: settings.public_label || 'VICEWIRE AI',
    },
  });

  await insertAction(job, {
    action: 'create_thread',
    risk: 'low',
    reasoning_summary: 'ViceWire created a clearly labeled community discussion thread.'
  }, 'executed', { thread_id: rows?.[0]?.id || null, ...generated });

  if (job.kind === 'daily_post') {
    await sb('vicewire_settings?id=eq.1', { method: 'PATCH', body: { last_daily_post_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
  }
}

async function maybeQueueDailyPost(settings) {
  if (!settings.enabled || !settings.auto_post) return;
  const last = settings.last_daily_post_at ? new Date(settings.last_daily_post_at).getTime() : 0;
  if (Date.now() - last < 22 * 60 * 60 * 1000) return;

  const since = encodeURIComponent(new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString());
  const existing = await sb(`vicewire_jobs?select=id&kind=eq.daily_post&status=in.(queued,processing)&created_at=gte.${since}&limit=1`);
  if (existing?.length) return;
  await sb('vicewire_jobs', { method: 'POST', body: { kind: 'daily_post', payload: {} } });
}

async function main() {
  const settingsRows = await sb('vicewire_settings?select=*&id=eq.1&limit=1');
  const settings = settingsRows?.[0];
  if (!settings) throw new Error('ViceWire settings row is missing. Apply supabase/vicewire.sql first.');
  if (!settings.enabled) {
    console.log('ViceWire is disabled. Nothing to do.');
    return;
  }

  await maybeQueueDailyPost(settings);

  const limit = Math.max(1, Math.min(Number(settings.max_jobs_per_run || 10), 50));
  const now = encodeURIComponent(new Date().toISOString());
  const jobs = await sb(`vicewire_jobs?select=*&status=eq.queued&available_at=lte.${now}&order=created_at.asc&limit=${limit}`);
  console.log(`ViceWire processing ${jobs?.length || 0} job(s).`);

  for (const job of jobs || []) {
    try {
      await markJob(job.id, 'processing', { attempts: Number(job.attempts || 0) + 1, last_error: null });
      if (job.kind === 'thread_created' || job.kind === 'reply_created') {
        if (settings.auto_moderate || settings.auto_reply) await handleForumEvent(job, settings);
        else await insertAction(job, { action: 'noop', risk: 'low', reasoning_summary: 'Forum event skipped because automated review and replies are disabled.' }, 'executed');
      } else if (job.kind === 'manual_prompt' || job.kind === 'daily_post') {
        await handleThreadGeneration(job, settings);
      }
      await markJob(job.id, 'done');
    } catch (error) {
      console.error(`Job ${job.id} failed`, error);
      await markJob(job.id, 'failed', { last_error: String(error?.message || error).slice(0, 2000) });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
