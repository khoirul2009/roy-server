import TelegramBot from 'node-telegram-bot-api';





// Membuat instance bot
const bot = (token) => new TelegramBot(token, { polling: true });

// Mengekspor bot untuk digunakan di file lain
export default bot;
