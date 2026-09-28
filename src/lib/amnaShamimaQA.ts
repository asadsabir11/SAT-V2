import { sql } from "@/lib/db";

// A separate, isolated Q&A board rather than widening the shared discussion.ts
// board — that table has no program column at all (a single board shared by
// every SAT/O-Level student) and its access gate is hardcoded to check the
// SAT-only access level (getStudentAccessLevel), so it would silently lock
// out every Amna Shamima student regardless of any change made here. Simpler
// shape too: no topics (this program has none) and no student-side replies —
// only staff (founder/teacher) answer, so a post is "answered" the moment the
// first reply exists.

export type AmnaShamimaQAPost = {
  id: string;
  title: string;
  body: string;
  author_email: string;
  author_name: string;
  is_answered: boolean;
  reply_count: number;
  created_at: string;
};

export type AmnaShamimaQAReply = {
  id: string;
  post_id: string;
  body: string;
  author_email: string;
  author_name: string;
  created_at: string;
};

let ready = false;
async function ensureTables() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS amna_shamima_qa_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      is_answered BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS amna_shamima_qa_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      body TEXT NOT NULL,
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllQAPosts(): Promise<AmnaShamimaQAPost[]> {
  await ensureTables();
  const rows = await sql`
    SELECT p.*, COUNT(r.id)::int AS reply_count
    FROM amna_shamima_qa_posts p
    LEFT JOIN amna_shamima_qa_replies r ON r.post_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  return rows as AmnaShamimaQAPost[];
}

export async function getQAPostById(id: string): Promise<AmnaShamimaQAPost | null> {
  await ensureTables();
  const rows = await sql`
    SELECT p.*, COUNT(r.id)::int AS reply_count
    FROM amna_shamima_qa_posts p
    LEFT JOIN amna_shamima_qa_replies r ON r.post_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
  `;
  return (rows[0] as AmnaShamimaQAPost) ?? null;
}

export async function getQAReplies(postId: string): Promise<AmnaShamimaQAReply[]> {
  await ensureTables();
  const rows = await sql`SELECT * FROM amna_shamima_qa_replies WHERE post_id = ${postId} ORDER BY created_at ASC`;
  return rows as AmnaShamimaQAReply[];
}

export async function createQAPost(data: { title: string; body: string; author_email: string; author_name: string }): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO amna_shamima_qa_posts (id, title, body, author_email, author_name)
    VALUES (${id}, ${data.title}, ${data.body}, ${data.author_email}, ${data.author_name})
  `;
  return id;
}

export async function createQAReply(data: { post_id: string; body: string; author_email: string; author_name: string }): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO amna_shamima_qa_replies (id, post_id, body, author_email, author_name)
    VALUES (${id}, ${data.post_id}, ${data.body}, ${data.author_email}, ${data.author_name})
  `;
  await sql`UPDATE amna_shamima_qa_posts SET is_answered = true WHERE id = ${data.post_id}`;
  return id;
}

export async function deleteQAPost(postId: string) {
  await ensureTables();
  await sql`DELETE FROM amna_shamima_qa_replies WHERE post_id = ${postId}`;
  await sql`DELETE FROM amna_shamima_qa_posts WHERE id = ${postId}`;
}

export async function deleteQAReply(replyId: string) {
  await ensureTables();
  await sql`DELETE FROM amna_shamima_qa_replies WHERE id = ${replyId}`;
}
