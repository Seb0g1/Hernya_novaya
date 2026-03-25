import "dotenv/config";
import { PgBoss } from "pg-boss";
import { processPublishJob } from "./lib/process-publish-job";
import { PUBLISH_JOB_QUEUE } from "./lib/pg-boss";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const boss = new PgBoss(url);
  await boss.start();
  const existing = await boss.getQueue(PUBLISH_JOB_QUEUE);
  if (!existing) {
    await boss.createQueue(PUBLISH_JOB_QUEUE);
  }
  console.log(`Worker listening on pg-boss queue "${PUBLISH_JOB_QUEUE}"`);
  await boss.work(PUBLISH_JOB_QUEUE, async (jobs) => {
    for (const job of jobs) {
      const data = job.data as { publishJobId: string };
      await processPublishJob(data.publishJobId);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
