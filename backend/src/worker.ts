import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDb } from './db';
import * as schema from './db/schema';
import { eq, like, desc } from 'drizzle-orm';

export type Env = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  JWT_SECRET?: string;
  FRONTEND_URL?: string;
  ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', cors({
  origin: (origin, c) => c.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Health
app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

// -----------------------------------------------------------------------
// Auth middleware
// -----------------------------------------------------------------------
async function requireAuth(c: any, next: any) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // TODO: verify JWT using c.env.JWT_SECRET
  // For now, extract user_id from a simple token
  const token = auth.slice(7);
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    c.set('userId', payload.sub);
    c.set('userEmail', payload.email);
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
  await next();
}

// -----------------------------------------------------------------------
// User routes
// -----------------------------------------------------------------------
const users = new Hono<{ Bindings: Env }>();

users.get('/me', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const profile = await db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, userId)).get();
  return c.json(profile || null);
});

users.put('/me', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const body = await c.req.json();
  const updated = await db.update(schema.userProfiles)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(schema.userProfiles.userId, userId))
    .returning()
    .get();
  return c.json(updated);
});

app.route('/user', users);
app.route('/users', users);

// -----------------------------------------------------------------------
// Projects routes
// -----------------------------------------------------------------------
const projectsRoutes = new Hono<{ Bindings: Env }>();

projectsRoutes.get('/', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const items = await db.select().from(schema.projects)
    .where(eq(schema.projects.userId, userId))
    .orderBy(desc(schema.projects.createdAt))
    .all();
  return c.json(items);
});

projectsRoutes.post('/', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const body = await c.req.json();
  const project = await db.insert(schema.projects).values({
    userId,
    name: body.name,
    cmNumber: body.cmNumber,
    visibility: body.visibility || 'private',
  }).returning().get();
  return c.json(project, 201);
});

projectsRoutes.get('/:id', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const project = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).get();
  if (!project) return c.json({ error: 'Not found' }, 404);
  return c.json(project);
});

projectsRoutes.put('/:id', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updated = await db.update(schema.projects)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(schema.projects.id, id))
    .returning()
    .get();
  return c.json(updated);
});

projectsRoutes.delete('/:id', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  await db.delete(schema.projects).where(eq(schema.projects.id, id)).run();
  return c.json({ ok: true });
});

app.route('/projects', projectsRoutes);

// -----------------------------------------------------------------------
// Documents routes
// -----------------------------------------------------------------------
const documentsRoutes = new Hono<{ Bindings: Env }>();

documentsRoutes.get('/', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const projectId = c.req.query('project_id');
  const query = db.select().from(schema.documents).where(eq(schema.documents.userId, userId));
  if (projectId) query.where(eq(schema.documents.projectId, projectId));
  const items = await query.orderBy(desc(schema.documents.createdAt)).all();
  return c.json(items);
});

documentsRoutes.post('/', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const body = await c.req.json();
  const doc = await db.insert(schema.documents).values({
    userId,
    projectId: body.projectId,
    status: 'pending',
  }).returning().get();
  return c.json(doc, 201);
});

documentsRoutes.get('/:id', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const doc = await db.select().from(schema.documents).where(eq(schema.documents.id, id)).get();
  if (!doc) return c.json({ error: 'Not found' }, 404);
  return c.json(doc);
});

documentsRoutes.post('/:id/versions', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const r2 = c.env.R2;
  const id = c.req.param('id');
  const body = await c.req.parseBody();
  const file = body['file'] as File;

  if (!file) return c.json({ error: 'No file provided' }, 400);

  const storagePath = `documents/${id}/${crypto.randomUUID()}_${file.name}`;
  await r2.put(storagePath, file, {
    httpMetadata: { contentType: file.type },
  });

  const version = await db.insert(schema.documentVersions).values({
    documentId: id,
    storagePath,
    filename: file.name,
    fileType: file.type,
    sizeBytes: file.size,
    source: 'upload',
  }).returning().get();

  await db.update(schema.documents)
    .set({ currentVersionId: version.id, updatedAt: new Date().toISOString() })
    .where(eq(schema.documents.id, id))
    .run();

  return c.json(version, 201);
});

documentsRoutes.get('/:id/download', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const r2 = c.env.R2;
  const id = c.req.param('id');
  const doc = await db.select().from(schema.documents).where(eq(schema.documents.id, id)).get();
  if (!doc) return c.json({ error: 'Not found' }, 404);
  if (!doc.currentVersionId) return c.json({ error: 'No version' }, 404);

  const version = await db.select().from(schema.documentVersions)
    .where(eq(schema.documentVersions.id, doc.currentVersionId)).get();
  if (!version) return c.json({ error: 'Version not found' }, 404);

  const obj = await r2.get(version.storagePath);
  if (!obj) return c.json({ error: 'File not found in storage' }, 404);

  return new Response(obj.body, {
    headers: {
      'Content-Type': version.fileType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${version.filename}"`,
    },
  });
});

app.route('/single-documents', documentsRoutes);

// -----------------------------------------------------------------------
// Chats
// -----------------------------------------------------------------------
const chatRoutes = new Hono<{ Bindings: Env }>();

chatRoutes.get('/:id/messages', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const messages = await db.select().from(schema.chatMessages)
    .where(eq(schema.chatMessages.chatId, id))
    .orderBy(schema.chatMessages.createdAt)
    .all();
  return c.json(messages);
});

chatRoutes.post('/:id/generate-title', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const id = c.req.param('id');
  const body = await c.req.json();
  await db.update(schema.chats)
    .set({ title: body.title })
    .where(eq(schema.chats.id, id))
    .run();
  return c.json({ ok: true });
});

app.route('/chat', chatRoutes);

// -----------------------------------------------------------------------
// Workflows
// -----------------------------------------------------------------------
const workflowRoutes = new Hono<{ Bindings: Env }>();

workflowRoutes.get('/', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const items = await db.select().from(schema.workflows)
    .where(eq(schema.workflows.userId, userId))
    .orderBy(desc(schema.workflows.createdAt))
    .all();
  return c.json(items);
});

workflowRoutes.post('/', requireAuth, async (c) => {
  const db = getDb(c.env.DB);
  const userId = c.get('userId');
  const body = await c.req.json();
  const wf = await db.insert(schema.workflows).values({
    userId,
    title: body.title,
    type: body.type,
    promptMd: body.promptMd,
    columnsConfig: body.columnsConfig ? JSON.stringify(body.columnsConfig) : undefined,
    practice: body.practice,
  }).returning().get();
  return c.json(wf, 201);
});

app.route('/workflows', workflowRoutes);

// -----------------------------------------------------------------------
// Auth (signup / login) — placeholder, uses custom JWT
// -----------------------------------------------------------------------
app.post('/auth/signup', async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();
  // TODO: hash password, create user
  const profile = await db.insert(schema.userProfiles).values({
    userId: body.email,
    displayName: body.name,
    organisation: body.organisation,
  }).returning().get();
  return c.json(profile, 201);
});

app.post('/auth/login', async (c) => {
  const body = await c.req.json();
  // TODO: verify password, generate JWT
  // For now, return a simple token
  const token = btoa(JSON.stringify({ sub: body.email, email: body.email }));
  return c.json({ token, user: { email: body.email } });
});

// -----------------------------------------------------------------------
// Export for Cloudflare Workers
// -----------------------------------------------------------------------
export default app;
