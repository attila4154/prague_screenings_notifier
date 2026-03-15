import type { FastifyBaseLogger } from "fastify";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendMessage(chatId: any, text: string, logger: FastifyBaseLogger) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  logger.info(res);
}
