const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('real_estate_bot.db');

// Создание таблиц
db.serialize(() => {
    // Таблица пользователей
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            full_name TEXT NOT NULL,
            registration_date DATE NOT NULL
        )
    `);

    // Таблица недвижимости
    db.run(`
        CREATE TABLE IF NOT EXISTS Properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rooms INTEGER NOT NULL,
            price REAL NOT NULL,
            address TEXT NOT NULL,
            metro TEXT NOT NULL,
            description TEXT NOT NULL
        )
    `);

    // Таблица фильтров
    db.run(`
        CREATE TABLE IF NOT EXISTS Filters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            rooms INTEGER,
            min_budget REAL,
            max_budget REAL,
            metro TEXT,
            FOREIGN KEY(user_id) REFERENCES Users(id)
        )
    `);
});

// Добавление тестовых данных
db.serialize(() => {
    // Удаляем существующие записи, чтобы избежать дубликатов при каждом запуске
    db.run(`DELETE FROM Properties`);

    const properties = [
        [2, 3000000, 'ул. Ленина, 1', 'Петроградская', 'Уютная квартира с современным ремонтом.'],
        [3, 4500000, 'ул. Советская, 5', 'Московская', 'Квартира в центре города, рядом с парком.'],
        [1, 2000000, 'ул. Гагарина, 10', 'Адмиралтейская', 'Студия в новом жилом комплексе.'],
        [4, 7000000, 'ул. Победы, 15', 'Ломоносовская', 'Просторная квартира для большой семьи.'],
        [2, 3200000, 'ул. Пушкина, 22', 'Парнас', 'Уютная квартира с видом на реку.'],
        [1, 2500000, 'ул. Чехова, 18', 'Звенигородская', 'Небольшая студия рядом с метро.'],
        [3, 5200000, 'ул. Садовая, 3', 'Чернышевская', 'Квартира с панорамным видом на город.'],
        [2, 4200000, 'ул. Московская, 45', 'Парк Победы', 'Светлая квартира в современном доме.'],
        [4, 8900000, 'ул. Коллонтай, 8', 'Проспект Большевиков', 'Элитная квартира с дизайнерским ремонтом.'],
        [3, 4800000, 'ул. Ломоносова, 12', 'Горьковская', 'Просторная квартира для семьи.'],
        [1, 2100000, 'ул. Лужская, 7', 'Дыбенко', 'Бюджетная студия для студентов.'],
        [2, 3500000, 'ул. Невский проспект, 24', 'Невский проспект', 'Квартира в шаговой доступности от метро.'],
        [3, 5500000, 'ул. Казанская, 14', 'Казанская', 'Квартира с балконом и видом на канал.'],
        [1, 2300000, 'ул. Летняя, 9', 'Парнас', 'Уютная студия с новой мебелью.'],
        [2, 3900000, 'ул. Одоевского, 19', 'Василеостровская', 'Квартира с удобной планировкой.']
    ];

    const stmt = db.prepare(`
        INSERT INTO Properties (rooms, price, address, metro, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    properties.forEach((property) => stmt.run(property));
    stmt.finalize();
});

module.exports = db;