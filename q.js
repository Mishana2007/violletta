const { Telegraf, Markup } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();

const TOKEN = '7125691060:AAEqLOALOiAhPuk-Ir0W5PhbnR5EDsXQpvM'; // Укажи токен своего бота
const bot = new Telegraf(TOKEN);

const db = new sqlite3.Database('real_estate_bot.db');

// Хранилище для данных регистрации и фильтрации
const userSessions = {};

// Команда /start
bot.start((ctx) => {
    const chatId = ctx.chat.id;
    ctx.reply('Добро пожаловать! Введите ваш номер телефона в формате +7XXXXXXXXXX:');
    userSessions[chatId] = { step: 'phone' };
});

// Обработка сообщений от пользователя
bot.on('text', (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    if (!userSessions[chatId]) return;

    const session = userSessions[chatId];

    if (session.step === 'phone') {
        if (/^\+7\d{10}$/.test(text)) {
            session.phone = text;
            session.step = 'name';
            ctx.reply('Введите ваше ФИО с заглавных букв (например, Иванов Иван Иванович):');
        } else {
            ctx.reply('Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX.');
        }
    } else if (session.step === 'name') {
        if (/^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$/.test(text)) {
            session.name = text;

            // Проверяем, существует ли пользователь
            db.get(
                `SELECT * FROM Users WHERE telegram_id = ?`,
                [chatId],
                (err, row) => {
                    if (err) {
                        console.error(err);
                        ctx.reply('Ошибка проверки данных.');
                        return;
                    }

                    if (row) {
                        ctx.reply('Вы уже зарегистрированы!', Markup.inlineKeyboard([
                            Markup.button.callback('Объявления', 'ads'),
                            Markup.button.callback('Разместить', 'add_ad')
                        ]));
                    } else {
                        // Сохраняем нового пользователя
                        db.run(
                            `INSERT INTO Users (telegram_id, phone, full_name, registration_date) VALUES (?, ?, ?, ?)`,
                            [chatId, session.phone, session.name, new Date().toISOString()],
                            (err) => {
                                if (err) {
                                    console.error(err);
                                    ctx.reply('Ошибка регистрации.');
                                } else {
                                    ctx.reply('Вы успешно зарегистрированы!', Markup.inlineKeyboard([
                                        Markup.button.callback('Объявления', 'ads'),
                                        Markup.button.callback('Разместить', 'add_ad')
                                    ]));
                                }
                            }
                        );
                    }
                }
            );

            delete userSessions[chatId];
        } else {
            ctx.reply('Пожалуйста, введите корректное ФИО.');
        }
    }
});

// Обработка инлайн-кнопок
bot.action('ads', (ctx) => {
    ctx.reply('Выберите действие:', Markup.inlineKeyboard([
        Markup.button.callback('Все', 'view_all'),
        Markup.button.callback('Фильтр', 'filter')
    ]));
});

// Отправка всех объявлений по 3
bot.action('view_all', (ctx) => {
    const chatId = ctx.chat.id;
    db.all('SELECT * FROM Properties', (err, rows) => {
        if (err) {
            console.error(err);
            ctx.reply('Ошибка получения данных.');
            return;
        }

        let index = 0;

        function sendNextBatch() {
            const batch = rows.slice(index, index + 3);

            batch.forEach((property) => {
                ctx.replyWithHTML(
                    `<b>Квартира</b>\nАдрес: ${property.address}\nМетро: ${property.metro}\nЦена: ${property.price} руб.\nКоличество комнат: ${property.rooms}\nОписание: ${property.description}`
                );
            });

            index += 3;

            if (index < rows.length) {
                ctx.reply('Нажмите "Ещё", чтобы увидеть больше.', Markup.inlineKeyboard([
                    Markup.button.callback('Ещё', 'more')
                ]));

                bot.action('more', sendNextBatch);
            }
        }

        sendNextBatch();
    });
});

// Обработка фильтра
bot.action('filter', (ctx) => {
    const chatId = ctx.chat.id;
    userSessions[chatId] = { step: 'filter_rooms' };
    ctx.reply('Введите количество комнат:');
});

bot.on('text', (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    if (!userSessions[chatId]) return;

    const session = userSessions[chatId];

    if (session.step === 'filter_rooms') {
        session.rooms = parseInt(text);
        session.step = 'filter_metro';
        ctx.reply('Введите ближайшее метро:');
    } else if (session.step === 'filter_metro') {
        session.metro = text;
        session.step = 'filter_budget_from';
        ctx.reply('Введите минимальный бюджет:');
    } else if (session.step === 'filter_budget_from') {
        session.budgetFrom = parseInt(text);
        session.step = 'filter_budget_to';
        ctx.reply('Введите максимальный бюджет:');
    } else if (session.step === 'filter_budget_to') {
        session.budgetTo = parseInt(text);

        // Выполнение фильтрации
        db.all(
            `SELECT * FROM Properties WHERE rooms = ? AND metro LIKE ? AND price BETWEEN ? AND ?`,
            [session.rooms, `%${session.metro}%`, session.budgetFrom, session.budgetTo],
            (err, rows) => {
                if (err) {
                    console.error(err);
                    ctx.reply('Ошибка фильтрации.');
                    return;
                }

                if (rows.length === 0) {
                    ctx.reply('Квартир по вашему запросу не найдено.');
                } else {
                    rows.forEach((property) => {
                        ctx.replyWithHTML(
                            `<b>Квартира</b>\nАдрес: ${property.address}\nМетро: ${property.metro}\nЦена: ${property.price} руб.\nКоличество комнат: ${property.rooms}\nОписание: ${property.description}`
                        );
                    });
                }
            }
        );

        delete userSessions[chatId];
    }
});

// Запуск бота
bot.launch();
console.log('Бот запущен!');