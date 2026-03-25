import { PgBoss } from "pg-boss";

export const PUBLISH_JOB_QUEUE = "publish-job";

const globalForBoss = globalThis as unknown as { boss: PgBoss | undefined };

async function ensureQueue(boss: PgBoss): Promise<void> {
  const existing = await boss.getQueue(PUBLISH_JOB_QUEUE);
  if (!existing) {
    await boss.createQueue(PUBLISH_JOB_QUEUE);
  }
}

export async function getBoss(): Promise<PgBoss> {
  if (globalForBoss.boss) return globalForBoss.boss;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const boss = new PgBoss(url);
  await boss.start();
  await ensureQueue(boss);
  globalForBoss.boss = boss;
  return boss;
}

export async function enqueuePublishJob(jobId: string): Promise<void> {
  const boss = await getBoss();
  await boss.send(PUBLISH_JOB_QUEUE, { publishJobId: jobId });
}
