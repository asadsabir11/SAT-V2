import { sql } from "@/lib/db";


export type DiscussionPost = {
  id: string;
  title: string;
  body: string;
  topic: string;
  author_email: string;
  author_name: string;
  is_answered: boolean;
  reply_count: number;
  created_at: string;
};

export type DiscussionReply = {
  id: string;
  post_id: string;
  body: string;
  author_email: string;
  author_name: string;
  is_best_answer: boolean;
  is_instructor: boolean;
  created_at: string;
};

let ready = false;
async function ensureTables() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS discussion_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      topic TEXT DEFAULT 'General',
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      is_answered BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS discussion_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      body TEXT NOT NULL,
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      is_best_answer BOOLEAN DEFAULT false,
      is_instructor BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function getAllPosts(topic?: string): Promise<DiscussionPost[]> {
  await ensureTables();
  const rows = topic && topic !== "All"
    ? await sql`
        SELECT p.*, COUNT(r.id)::int AS reply_count
        FROM discussion_posts p
        LEFT JOIN discussion_replies r ON r.post_id = p.id
        WHERE p.topic = ${topic}
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
    : await sql`
        SELECT p.*, COUNT(r.id)::int AS reply_count
        FROM discussion_posts p
        LEFT JOIN discussion_replies r ON r.post_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
  return rows as DiscussionPost[];
}

export async function getPostById(id: string): Promise<DiscussionPost | null> {
  await ensureTables();
  const rows = await sql`
    SELECT p.*, COUNT(r.id)::int AS reply_count
    FROM discussion_posts p
    LEFT JOIN discussion_replies r ON r.post_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
  `;
  return (rows[0] as DiscussionPost) ?? null;
}

export async function getReplies(postId: string): Promise<DiscussionReply[]> {
  await ensureTables();
  const rows = await sql`
    SELECT * FROM discussion_replies
    WHERE post_id = ${postId}
    ORDER BY is_best_answer DESC, created_at ASC
  `;
  return rows as DiscussionReply[];
}

export async function createPost(data: {
  title: string; body: string; topic: string;
  author_email: string; author_name: string;
}): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO discussion_posts (id, title, body, topic, author_email, author_name)
    VALUES (${id}, ${data.title}, ${data.body}, ${data.topic}, ${data.author_email}, ${data.author_name})
  `;
  return id;
}

export async function createReply(data: {
  post_id: string; body: string;
  author_email: string; author_name: string; is_instructor: boolean;
}): Promise<string> {
  await ensureTables();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO discussion_replies (id, post_id, body, author_email, author_name, is_instructor)
    VALUES (${id}, ${data.post_id}, ${data.body}, ${data.author_email}, ${data.author_name}, ${data.is_instructor})
  `;
  return id;
}

export async function markBestAnswer(replyId: string, postId: string) {
  await ensureTables();
  await sql`UPDATE discussion_replies SET is_best_answer = false WHERE post_id = ${postId}`;
  await sql`UPDATE discussion_replies SET is_best_answer = true WHERE id = ${replyId}`;
  await sql`UPDATE discussion_posts SET is_answered = true WHERE id = ${postId}`;
}

export async function deleteReply(replyId: string) {
  await ensureTables();
  await sql`DELETE FROM discussion_replies WHERE id = ${replyId}`;
}

export async function deletePost(postId: string) {
  await ensureTables();
  await sql`DELETE FROM discussion_replies WHERE post_id = ${postId}`;
  await sql`DELETE FROM discussion_posts WHERE id = ${postId}`;
}
