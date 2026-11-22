require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});

console.log("1000 Rank PDF Bot is running...");

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId,
        `🎓 Welcome to 1000 Rank PDF Hub!

Get your most repeated questions PDFs for:

📘 Mathematics
⚗️ Chemistry
⚡ Physics

These PDFs are prepared to help you focus on important exam questions.

Click the button below to continue.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Get My PDFs", callback_data: "get_pdfs" }]
                ]
            }
        }
    );
});
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    if (query.data === "verify_subscription") {
        await bot.answerCallbackQuery(query.id);

        await bot.sendMessage(
            chatId,
            "🎉 Here are your Most Repeated Questions PDFs!"
        );

        await bot.sendDocument(chatId, pdfFiles.maths, {
            caption: "📘 Mathematics – Most Repeated Questions"
        });

        await bot.sendDocument(chatId, pdfFiles.chemistry, {
            caption: "⚗️ Chemistry – Most Repeated Questions"
        });

        await bot.sendDocument(chatId, pdfFiles.physics, {
            caption: "⚡ Physics – Most Repeated Questions"
        });
    }

    if (query.data === "get_pdfs") {
    await bot.answerCallbackQuery(query.id);

    await bot.sendMessage(
        chatId,
        "📢 Step 1: Subscribe to our YouTube channel.\n\nStep 2: Return here and click Verify Subscription.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "▶️ Subscribe to YouTube",
                        url: "https://www.youtube.com/channel/UCmA7VlGIiEWqMtKMHyhtn0A?sub_confirmation=1"
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
});
const path = require("path");

const pdfFiles = {
    maths: path.join(__dirname, "pdfs", "maths.pdf"),
    chemistry: path.join(__dirname, "pdfs", "chemistry.pdf"),
    physics: path.join(__dirname, "pdfs", "physics.pdf")
};

bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "send_pdfs") {
        await bot.answerCallbackQuery(query.id);

        await bot.sendMessage(chatId, "🎉 Your study PDFs are ready!");

        await bot.sendDocument(chatId, pdfFiles.maths, {
            caption: "📘 Mathematics – Most Repeated Questions"
        });

        await bot.sendDocument(chatId, pdfFiles.chemistry, {
            caption: "⚗️ Chemistry – Most Repeated Questions"
        });

        await bot.sendDocument(chatId, pdfFiles.physics, {
            caption: "⚡ Physics – Most Repeated Questions"
        });
    }
});