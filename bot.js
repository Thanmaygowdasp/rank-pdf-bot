
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const fs = require("fs");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});

const YOUTUBE_URL =
    "https://www.youtube.com/channel/UCmA7VlGIiEWqMtKMHyhtn0A?sub_confirmation=1";

const pdfFiles = {
    maths: path.join(__dirname, "pdfs", "maths.pdf"),
    chemistry: path.join(__dirname, "pdfs", "chemistry.pdf"),
    physics: path.join(__dirname, "pdfs", "physics.pdf")
};

console.log("1000 Rank PDF Bot is running...");

// Welcome message
bot.onText(/^\/start(?:@\w+)?$/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
        chatId,
        `🎓 Welcome to KCET 2027 Rank Booster!

Get our 10-year KCET question analysis for:

📘 Mathematics
⚗️ Chemistry
⚡ Physics

Discover how many questions appeared
from each chapter over the past 10 years.

Use this analysis to plan your preparation
more effectively.

Click below to get your PDFs!`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Get My PDFs", callback_data: "get_pdfs" }]
                ]
            }
        }
    );
});

// Handle all button clicks
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    try {
        await bot.answerCallbackQuery(query.id);

        // Show subscription instructions
        if (query.data === "get_pdfs") {
            await bot.sendMessage(
                chatId,
                `📢 Step 1: Subscribe to our YouTube channel.

Step 2: Return to this bot.

Step 3: Click Verify Subscription.
`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "▶️ Subscribe to YouTube",
                                url: YOUTUBE_URL
                            }],
                            [{
                                text: "✅ Verify Subscription",
                                callback_data: "verify_subscription"
                            }]
                        ]
                    }
                }
            );
        }

        // User confirms subscription
        else if (query.data === "verify_subscription") {
            await bot.sendMessage(
                chatId,
                "🎉 Thank you for supporting our channel!\n\nYour 10-year KCET chapter-wise question analysis is ready!"
            );

            for (const [subject, file] of Object.entries(pdfFiles)) {
                if (!fs.existsSync(file)) {
                    await bot.sendMessage(
                        chatId,
                        `⚠️ ${subject} PDF is currently unavailable.`
                    );
                    continue;
                }

                const captions = {
    maths: "📘 Mathematics – 10-Year Chapter-Wise Question Analysis",
    chemistry: "⚗️ Chemistry – 10-Year Chapter-Wise Question Analysis",
    physics: "⚡ Physics – 10-Year Chapter-Wise Question Analysis"
};

                await bot.sendDocument(chatId, file, {
                    caption: captions[subject]
                });
            }

            await bot.sendMessage(
                chatId,
                "📚 Happy studying! All the best for KCET 2027."
            );
        }

    } catch (error) {
        console.error("Bot error:", error.message);
    }
});

bot.on("polling_error", (error) => {
    console.error("Polling error:", error.message);
});
