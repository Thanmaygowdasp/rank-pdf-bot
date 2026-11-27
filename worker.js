
const YOUTUBE_URL =
  "https://www.youtube.com/channel/UCmA7VlGIiEWqMtKMHyhtn0A?sub_confirmation=1";

const PDF_FILES = {
  maths: {
    name: "maths.pdf",
    caption: "📘 Mathematics – 10-Year Chapter-Wise Question Analysis",
  },
  chemistry: {
    name: "chemistry.pdf",
    caption: "⚗️ Chemistry – 10-Year Chapter-Wise Question Analysis",
  },
  physics: {
    name: "physics.pdf",
    caption: "⚡ Physics – 10-Year Chapter-Wise Question Analysis",
  },
};

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("KCET PDF Bot is running!");
    }

    const secret = request.headers.get(
      "X-Telegram-Bot-Api-Secret-Token"
    );

    if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const update = await request.json();
    const message = update.message;
    const query = update.callback_query;

    if (message?.text?.startsWith("/start")) {
      await sendMessage(
        env,
        message.chat.id,
        "🎓 Welcome to 1000 Rank PDF Hub!\n\n" +
          "Get your KCET 10-Year Chapter-Wise Question Analysis PDFs:\n\n" +
          "📘 Mathematics\n⚗️ Chemistry\n⚡ Physics\n\n" +
          "Subscribe to our YouTube channel to support our educational content.",
        {
          inline_keyboard: [
            [{ text: "🚀 Get My PDFs", callback_data: "get_pdfs" }],
          ],
        }
      );
    }

    if (query) {
      const chatId = query.message.chat.id;

      await telegram(env, "answerCallbackQuery", {
        callback_query_id: query.id,
      });

      if (query.data === "get_pdfs") {
        await sendMessage(
          env,
          chatId,
          "📢 Step 1: Subscribe to our YouTube channel.\n\n" +
            "Step 2: Return here.\n\n" +
            "Step 3: Click Verify Subscription.\n\n" +
            "Note: Verification is self-confirmation; the bot cannot independently check YouTube subscriptions.",
          {
            inline_keyboard: [
              [{ text: "▶️ Subscribe to YouTube", url: YOUTUBE_URL }],
              [
                {
                  text: "✅ Verify Subscription",
                  callback_data: "verify_subscription",
                },
              ],
            ],
          }
        );
      }

      if (query.data === "verify_subscription") {
        await sendMessage(
          env,
          chatId,
          "🎉 Thank you for supporting our channel!\nPreparing your KCET PDFs..."
        );

        for (const pdf of Object.values(PDF_FILES)) {
          await sendPdf(env, chatId, pdf);
        }

        await sendMessage(
          env,
          chatId,
          "📚 Happy studying! All the best for KCET 2027."
        );
      }
    }

    return new Response("OK");
  },
};

async function telegram(env, method, data) {
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.description || "Telegram API error");
  }

  return result;
}

async function sendMessage(env, chatId, text, keyboard) {
  const data = { chat_id: chatId, text };

  if (keyboard) data.reply_markup = keyboard;

  return telegram(env, "sendMessage", data);
}

async function sendPdf(env, chatId, pdf) {
  const fileUrl =
    `https://raw.githubusercontent.com/Thanmaygowdasp/rank-pdf-bot/main/pdfs/${pdf.name}`;

  const download = await fetch(fileUrl);

  if (!download.ok) {
    throw new Error(`Could not download ${pdf.name}`);
  }

  const blob = await download.blob();

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", pdf.caption);
  form.append("document", blob, pdf.name);

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`,
    {
      method: "POST",
      body: form,
    }
  );

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.description || `Could not send ${pdf.name}`);
  }
}
