const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// টোকেন মিসিং থাকলে লগে দেখাবে
if (!token || !supabaseUrl || !supabaseKey) {
    console.error("⚠️ Error: Environment Variables Missing!");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = new TelegramBot(token);

function getUserId(telegramId) {
    const hash = crypto.createHash('md5').update(telegramId.toString()).digest('hex');
    return `${hash.substring(0,8)}-${hash.substring(8,12)}-${hash.substring(12,16)}-${hash.substring(16,20)}-${hash.substring(20,32)}`;
}

module.exports = async (req, res) => {
    try {
        console.log("✅ Webhook Hit Received from Telegram!"); 

        if (req.method === 'POST') {
            const update = req.body;
            console.log("📩 User Message:", JSON.stringify(update.message?.text)); 

            if (update.message && update.message.text) {
                const chatId = update.message.chat.id;
                const text = update.message.text.trim();
                const userId = getUserId(update.message.from.id);

                // --- START MENU ---
                if (text === '/start') {
                    const welcomeMsg = `স্বাগতম <b>BlishTracker</b>-এ! 💎\nআপনার প্রিমিয়াম ফাইন্যান্স ট্র্যাকার এখন টেলিগ্রামে রেডি।\n\n<b>কীভাবে হিসাব রাখবেন?</b>\n➕ আয়ের জন্য লিখুন: <code>+ পরিমাণ খাত ওয়ালেট</code>\n(যেমন: <code>+ 5000 Salary Bank</code>)\n\n➖ ব্যয়ের জন্য লিখুন: <code>- পরিমাণ খাত ওয়ালেট</code>\n(যেমন: <code>- 200 Food bKash</code>)\n\n📝 ঋণের জন্য লিখুন: <code>ধার পরিমাণ নাম</code>\n(যেমন: <code>ধার 500 Rahim</code>)`;
                    
                    const opts = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            keyboard: [
                                ['💰 ব্যালেন্স', '📊 রিপোর্ট'],
                                ['➕ আয় যুক্ত করুন', '➖ ব্যয় যুক্ত করুন']
                            ],
                            resize_keyboard: true
                        }
                    };
                    await bot.sendMessage(chatId, welcomeMsg, opts);
                    console.log("✅ Start message sent successfully!");
                    return res.status(200).send('OK');
                }

                // --- CHECK BALANCE ---
                if (text === '💰 ব্যালেন্স') {
                    const { data: wallets } = await supabase.from('wallets').select('*').eq('user_id', userId);
                    const { data: debts } = await supabase.from('debts').select('*').eq('user_id', userId).eq('status', 'unpaid');

                    let totalLiquid = 0;
                    let walletText = '';
                    if (wallets && wallets.length > 0) {
                        wallets.forEach(w => {
                            totalLiquid += parseFloat(w.balance);
                            walletText += `• ${w.name}: ৳${w.balance}\n`;
                        });
                    } else {
                        walletText = 'কোনো ওয়ালেট নেই। লেনদেন করলে স্বয়ংক্রিয়ভাবে তৈরি হবে।\n';
                    }

                    let totalDebt = 0;
                    if (debts) debts.forEach(d => totalDebt += parseFloat(d.amount));

                    let msg = `<b>আপনার বর্তমান আর্থিক অবস্থা:</b>\n────────────────\n💵 <b>মোট লিকুইড ক্যাশ: ৳${totalLiquid}</b>\n\n<b>ওয়ালেট ব্যালেন্স:</b>\n${walletText}\n`;
                    if (totalDebt > 0) {
                        msg += `🔴 <b>মোট ঋণ: -৳${totalDebt}</b>`;
                    } else {
                        msg += `🟢 কোনো ঋণ নেই (All Clear!)`;
                    }

                    await bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
                    return res.status(200).send('OK');
                }

                // --- HELPER BUTTONS ---
                if (text === '➕ আয় যুক্ত করুন') {
                    await bot.sendMessage(chatId, "আয় যুক্ত করতে মেসেজে লিখুন:\n<code>+ 500 Freelance bKash</code>", { parse_mode: 'HTML' });
                    return res.status(200).send('OK');
                }
                if (text === '➖ ব্যয় যুক্ত করুন') {
                    await bot.sendMessage(chatId, "ব্যয় যুক্ত করতে মেসেজে লিখুন:\n<code>- 200 Food Nagad</code>", { parse_mode: 'HTML' });
                    return res.status(200).send('OK');
                }
                if (text === '📊 রিপোর্ট') {
                    await bot.sendMessage(chatId, "শীঘ্রই আসছে! বটের পরবর্তী আপডেটে মাসিক রিপোর্ট যুক্ত হবে।");
                    return res.status(200).send('OK');
                }

                // --- RECORD TRANSACTION (+ / -) ---
                const txMatch = text.match(/^([+-])\s*(\d+(\.\d+)?)\s+(.+?)\s+(.+)$/i);
                if (txMatch) {
                    const sign = txMatch[1];
                    const amount = parseFloat(txMatch[2]);
                    const category = txMatch[4].trim();
                    const walletName = txMatch[5].trim();
                    const type = sign === '+' ? 'income' : 'expense';

                    let { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).ilike('name', walletName).single();
                    
                    if (!walletData) {
                        const { data: newWallet } = await supabase.from('wallets').insert([{ user_id: userId, name: walletName, balance: 0 }]).select().single();
                        walletData = newWallet;
                    }

                    if (type === 'expense' && parseFloat(walletData.balance) < amount) {
                        await bot.sendMessage(chatId, `❌ <b>অপর্যাপ্ত ব্যালেন্স!</b>\nআপনার ${walletData.name} ওয়ালেটে আছে মাত্র ৳${walletData.balance}।`, { parse_mode: 'HTML' });
                        return res.status(200).send('OK');
                    }

                    const newBalance = type === 'income' ? parseFloat(walletData.balance) + amount : parseFloat(walletData.balance) - amount;
                    await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletData.id);

                    await supabase.from('transactions').insert([{
                        user_id: userId,
                        title: category,
                        amount: amount,
                        type: type,
                        wallet: walletData.name
                    }]);

                    const emoji = type === 'income' ? '✅' : '💸';
                    await bot.sendMessage(chatId, `${emoji} <b>সফলভাবে যুক্ত হয়েছে!</b>\nখাত: ${category}\nপরিমাণ: ৳${amount}\nবর্তমান ${walletData.name} ব্যালেন্স: ৳${newBalance}`, { parse_mode: 'HTML' });
                    return res.status(200).send('OK');
                }

                // --- RECORD DEBT ---
                const debtMatch = text.match(/^ধার\s*(\d+(\.\d+)?)\s+(.+)$/i);
                if (debtMatch) {
                    const amount = parseFloat(debtMatch[1]);
                    const name = debtMatch[3].trim();

                    await supabase.from('debts').insert([{
                        user_id: userId,
                        name: name,
                        amount: amount,
                        status: 'unpaid'
                    }]);

                    await bot.sendMessage(chatId, `📝 <b>ঋণ যুক্ত হয়েছে!</b>\nনাম: ${name}\nপরিমাণ: ৳${amount}\n\n<i>নোট: এটি আপনার মূল ব্যালেন্স থেকে কাটা হয়নি, আলাদাভাবে ট্র্যাক করা হচ্ছে।</i>`, { parse_mode: 'HTML' });
                    return res.status(200).send('OK');
                }

                await bot.sendMessage(chatId, "⚠️ কমান্ড বুঝতে পারিনি। দয়া করে সঠিক ফরম্যাট ব্যবহার করুন বা /start চাপুন।");
            }
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Bot Critical Error: ", error);
        // Error হলেও টেলিগ্রামকে 200 পাঠাতে হয়, নাহলে সে বারবার মেসেজ পাঠাতে থাকে
        res.status(200).send('OK'); 
    }
};
