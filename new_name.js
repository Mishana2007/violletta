// 1. Импорты и инициализация
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const OpenAI = require('openai');
const ExcelJS = require('exceljs');
const fs = require('fs');
const schedule = require('node-schedule'); 
require('dotenv').config();

// 2. Константы и конфигурация
const token = process.env.TELEGRAM_TOKEN;
const admins = [1301142907, 225496853, 246813579];

const openai = new OpenAI({
    apiKey: process.env.API
});

const bot = new TelegramBot(token, { polling: true });

// 3. Структура тестов с разными форматами ответов
const tests = {
    test1: {
        questions: [
            'Сделав что-либо, Вы сомневаетесь, все ли сделано правильно, и не успокаиваетесь до тех пор, пока не убедитесь еще раз в этом.',
            'В детстве вы были таким же смелым, как другие Ваши сверстники.',
            'Часто ли у Вас резко меняется настроение от состояния безграничного ликования до отвращения к жизни, к себе?',
            'Являетесь ли вы обычно центром внимания в обществе, в компании?',
            'Бывает ли так, что вы беспричинно находитесь в таком ворчливом настроении, что с Вами лучше не разговаривать?',
            'Вы серьезный человек.',
            'Способны ли вы восхищаться, восторгаться чем-нибудь?',
            'Предприимчивы ли Вы?',
            'Вы быстро забываете, если Вас кто-то обидит.',
            'Мягкосердечны ли Вы?',
            'Опуская письмо в ящик, проверяете ли Вы, проводя рукой по щели ящика, что письмо упало в него?',
            'Стремитесь ли вы всегда считаться в числе лучших работников?',
            'Бывало ли Вам в детстве страшно во время грозы или при встрече с незнакомой собакой (а может быть, такое чувство бывает и теперь)?',
            'Вы стремитесь во всем и повсюду соблюдать порядок.',
            'Ваше настроение зависит от внешних обстоятельств.',
            'Любят ли вас ваши знакомые?',
            'Часто ли у Вас бывает чувство внутреннего беспокойства, ощущение возможной неприятности, беды?',
            'У вас часто бывает несколько подавленное настроение.',
            'Переживали ли Вы хотя бы раз истерику или нервный срыв?',
            'Трудно ли вам долго усидеть на месте?',
            'Если по отношению к Вам несправедливо поступили, Вы обычно считаете нужным энергично отстаивать свои интересы.',
            'Можете ли Вы зарезать курицу или овцу?',
            'Вас раздражает, если дома занавес или скатерть висят неровно, и вы сразу же стараетесь поправить их.',
            'Вы в детстве боялись оставаться в одиночестве дома.',
            'Часто ли у вас бывают беспричинные колебания настроения ?',
            'Вы стремитесь быть высококвалифицированным работником в своей профессии.',
            'Быстро ли Вы начинаете сердиться или впадать в гнев?',
            'Можете ли Вы быть абсолютно беззаботным?',
            'Бывает ли так, что ощущение полного счастья буквально пронизывает Вас?',
            'Как Вы думаете, получился бы из Вас ведущий в юмористическом концерте?',
            'Вы обычно высказываете свое мнение достаточно откровенно, прямо и недвусмысленно.',
            'Вам трудно переносить вид крови, он вызывает у Вас неприятные ощущения.',
            'Нравится ли Вам работа с большой личной ответственностью?',
            'Вы склонны выступать в защиту лиц, по отношению к которым допущена несправедливость.',
            'Было бы Вам страшно спускаться в темный подвал?',
            'Вы предпочитаете работу, в которой надо действовать быстро, но требования к качеству выполнения невысоки.',
            'Общительны ли Вы?',
            'В школе вы охотно декламировали стихи.',
            'Убегали ли Вы в детстве из дома?',
            'Кажется ли Вам жизнь трудной?',
            'Бывает ли так, что после конфликта, обиды Вы были до того расстроены, что идти на работу казалось просто невыносимым?',
            'Можно ли сказать, что при неудаче Вы не теряете чувства юмора?',
            'Если бы Вас кто-либо обидел, предприняли бы Вы первым шаги к примирению?',
            'Вы очень любите животных.',
            'Вы иногда возвращаетесь, чтобы убедиться, что оставили дом или рабочее место в порядке, и там ничего непредвиденного не случилось.',
            'Вас иногда преследует неясная мысль, что с Вами или Вашими близкими может случиться что-то страшное.',
            'Считаете ли Вы, что Ваше настроение очень изменчиво?',
            'Трудно ли Вам выступать перед большим количеством людей?',
            'Вы можете ударить обидчика, если он Вас оскорбит.',
            'У Вас очень велика потребность в общении с другими людьми.',
            'Вы относитесь к тем, кто при каких-либо разочарованиях впадает в глубокое отчаяние.',
            'Вам нравится работа, требующая энергичной организаторской деятельности.',
            'У Вас хватает настойчивости добиваться поставленной цели, несмотря на то, что на пути к ней приходится преодолевать много препятствий.',
            'Трагический фильм может взволновать Вас так, что на глазах выступают слезы.',
            'Часто ли вам бывает трудно уснуть из-за того, что проблемы прожитого или будущего дня все время крутятся в голове?',
            'В школе Вы подсказывали или давали списывать товарищам.',
            'Вам потребовалось бы большое напряжение воли, чтобы пройти ночью одному через кладбище.',
            'Тщательно ли Вы следите за тем, чтобы дома каждая вещь была всегда на своем месте?',
            'Бывает ли так, что Вы ложитесь вечером спать в хорошем настроении, а наутро встаете в подавленном, которое длится чуть ли не весь день?',
            'Легко ли Вы привыкаете к новым ситуациям?',
            'Бывают ли у Вас головные боли?',
            'Вы часто смеетесь.',
            'Вы можете быть приветливым даже с теми, кого Вы явно не цените и не уважаете.',
            'Вы подвижный человек.',
            'Вы очень переживаете из-за несправедливости.',
            'Вы настолько любите природу, что можете назвать ее своим другом.',
            'Уходя из дома или ложась спать, проверяете ли Вы, закрыт ли газ, погашен ли свет, заперты ли двери?',
            'Вы очень боязливы.',
            'Изменяется ли Ваше настроение при приеме алкоголя?',
            'В юности Вы охотно участвовали в художественной самодеятельности.',
            'Вы расцениваете жизнь несколько пессимистически, без ожидания радости.',
            'Часто ли Вас тянет путешествовать?',
            'Ваше настроение может изменяться так резко, что состояние радости вдруг сменяется угрюмостью и подавленностью.',
            'Легко ли Вас удается поднять настроение друзей в компании?',
            'Долго ли Вы переживаете обиду?',
            'Долго ли Вы переживаете горести других людей?',
            'Будучи школьником, Вы нередко переписывали страницу, если случайно ставили на ней кляксу.',
            'Вы относитесь к людям скорее с осторожностью и недоверием, чем доверчивостью.',
            'Часто ли Вы видите страшные сны?',
            'Бывает ли, что вы остерегаетесь того, что броситесь под колеса проходящего поезда или выпадете из окна, расположенного на высоком этаже?',
            'В веселой компании Вы обычно веселы.',
            'Способны ли Вы отвлечься от трудных проблем, требующих Вашего решения?',
            'Вы становитесь менее сдержанным и чувствуете себя свободнее под влиянием алкоголя.',
            'В беседе вы скупы на слова.',
            'Если бы Вам надо было играть на сцене, Вы смогли бы войти в роль настолько, чтобы забыть, что это только игра.'
        ],
        title: 'Тест №1',
        type: 'binary',
        options: [
            { text: 'Да', value: 'yes' },
            { text: 'Нет', value: 'no' }
        ]
    },
    test2: {
        questions: [
            'Люблю наблюдать за облаками и звездами.',
            'Часто напеваю себе потихоньку.',
            'Не признаю моду, которая неудобна.',
            'Люблю ходить в сауну.',
            'В автомашине цвет для меня имеет значение.',
            'Узнаю по шагам, кто вошел в помещение.',
            'Меня развлекает подражание диалектам.',
            'Внешнему виду придаю серьезное значение.',
            'Мне нравится принимать массаж.',
            'Когда есть время, люблю наблюдать за людьми.',
            'Плохо себя чувствую, когда не наслаждаюсь движением.',
            'Видя одежду в витрине, знаю, что мне будет хорошо в ней.',
            'Когда услышу старую мелодию, ко мне возвращается прошлое.',
            'Люблю читать во время еды.',
            'Люблю поговорить по телефону.',
            'У меня есть склонность к полноте.',
            'Предпочитаю слушать рассказ, который кто-то читает, чем читать самому.',
            'После плохого дня мой организм в напряжении.',
            'Охотно и много фотографирую.',
            'Долго помню, что мне сказали приятели или знакомые.',
            'Легко могу отдать деньги за цветы, потому что они украшают жизнь.',
            'Вечером люблю принять горячую ванну.',
            'Стараюсь записывать свои личные дела.',
            'Часто разговариваю с собой.',
            'После длительной езды на машине долго прихожу в себя.',
            'Тембр голоса многое мне говорит о человеке.',
            'Придаю значение манере одеваться, свойственной другим.',
            'Люблю потягиваться, расправлять конечности, разминаться.',
            'Слишком твердая или слишком мягкая постель для меня мука.',
            'Мне нелегко найти удобную обувь.',
            'Люблю смотреть теле- и видеофильмы.',
            'Даже спустя годы могу узнать лица, которые когда-либо видел.',
            'Люблю ходить под дождем, когда капли стучат по зонтику.',
            'Люблю слушать, когда говорят.',
            'Люблю заниматься подвижным спортом или выполнять какие-либо двигательные упражнения, иногда и потанцевать.',
            'Когда близко тикает будильник, не могу уснуть.',
            'У меня неплохая стереоаппаратура.',
            'Когда слушаю музыку, отбиваю такт ногой.',
            'На отдыхе не люблю осматривать памятники архитектуры.',
            'Не выношу беспорядок.',
            'Не люблю синтетических тканей.',
            'Считаю, что атмосфера в помещении зависит от освещения.',
            'Часто хожу на концерты.',
            'Пожатие руки много говорит мне о данной личности.',
            'Охотно посещаю галереи и выставки.',
            'Серьезная дискуссия – это интересно.',
            'Через прикосновение можно сказать значительно больше, чем словами.',
            'В шуме не могу сосредоточиться.'
        ],
        title: 'Тест №2',
        type: 'binary',
        options: [
            { text: 'Да', value: 'yes' },
            { text: 'Нет', value: 'no' }
        ]
    },
    test3: {
        questions: [
            'Часто ли вы чувствуете усталость?',
            'Беспокоит ли вас нарушение сна?',
            'Испытываете ли вы трудности с концентрацией внимания?'
        ],
        title: 'Тест №3',
        type: 'multiple',
        questions: [
            'Я испытываю напряжение, мне не по себе',
            'Я испытываю страх, кажется, что что-то ужасное может вот-вот случиться',
            'Беспокойные мысли крутятся у меня в голове',
            'Я легко могу присесть и расслабиться',
            'Я испытываю внутреннее напряжение или дрожь',
            'Я испытываю неусидчивость, мне постоянно нужно двигаться',
            'У меня бывает внезапное чувство паники',
            'То, что приносило мне большое удовольствие, и сейчас вызывает у меня такое же чувство',
            'Я способен рассмеяться и увидеть в том или ином событии смешное',
            'Я испытываю бодрость',
            'Мне кажется, что я стал все делать очень медленно',
            'Я не слежу за своей внешностью',
            'Я считаю, что мои дела (занятия, увлечения) могут принести мне чувство удовлетворения',
            'Я могу получить удовольствие от хорошей книги, радио- или телепрограммы'
        ],
        optionsByQuestion: {
            // ["Ответ 1", "Ответ 2", "Ответ 3", "Ответ 4"]
            0: [ // Вопрос 1
                { text: 'Совсем не испытываю', value: '0' },
                { text: 'Время от времени, иногда', value: '1' },
                { text: 'Часто', value: '2' },
                { text: 'Все время', value: '3' }
            ],
            1: [ // Вопрос 2
                { text: 'Совсем не испытываю', value: '0' },
                { text: 'Иногда, но это меня не беспокоит', value: '1' },
                { text: 'Да, это так, но страх не очень велик', value: '2' },
                { text: 'Определенно это так, и страх очень велик', value: '3' }
            ],
            2: [ // Вопрос 3
                { text: 'Только иногда', value: '0' },
                { text: 'Время от времени и не так часто', value: '1' },
                { text: 'Большую часть времени', value: '2' },
                { text: 'Постоянно', value: '3' }
            ],
            3: [ // Вопрос 4
                { text: 'Определенно, это так', value: '0' },
                { text: 'Наверно, это так', value: '1' },
                { text: 'Лишь изредка, это так', value: '2' },
                { text: 'Совсем не могу', value: '3' }
            ],
            4: [ // Вопрос 5
                { text: 'Совсем не испытываю', value: '0' },
                { text: 'Иногда', value: '1' },
                { text: 'Часто', value: '2' },
                { text: 'Очень часто', value: '3' }
            ],
            5: [ // Вопрос 6
                { text: 'Совсем не испытываю', value: '0' },
                { text: 'Лишь в некоторой степени', value: '1' },
                { text: 'Наверно, это так', value: '2' },
                { text: 'Определенно, это так', value: '3' }
            ],
            6: [ // Вопрос 7
                { text: 'Совсем не бывает', value: '0' },
                { text: 'Не так уж часто', value: '1' },
                { text: 'Довольно часто', value: '2' },
                { text: 'Очень часто', value: '3' }
            ],
            7: [ // Вопрос 8
                { text: 'Определенно, это так', value: '0' },
                { text: 'Наверное, это так', value: '1' },
                { text: 'Лишь в очень малой степени', value: '2' },
                { text: 'Это совсем не так', value: '3' }
            ],
            8: [ // Вопрос 9
                { text: 'Определенно, это так', value: '0' },
                { text: 'Наверное, это так', value: '1' },
                { text: 'Лишь в очень малой степени', value: '2' },
                { text: 'Совсем не способен', value: '3' }
            ],
            9: [ // Вопрос 10
                { text: 'Практически все время', value: '0' },
                { text: 'Иногда', value: '1' },
                { text: 'Очень редко', value: '2' },
                { text: 'Совсем не испытываю', value: '3' }
            ],
            10: [ // Вопрос 11
                { text: 'Совсем нет', value: '0' },
                { text: 'Иногда', value: '1' },
                { text: 'Часто', value: '2' },
                { text: 'Практически все время', value: '3' }
            ],
            11: [ // Вопрос 12
                { text: 'Я слежу за собой так же', value: '0' },
                { text: 'Может быть, стал меньше уделять времени', value: '1' },
                { text: 'Я не уделяю этому столько времени', value: '2' },
                { text: 'Определенно, это так', value: '3' }
            ],
            12: [ // Вопрос 13
                { text: 'Точно так же, как обычно', value: '0' },
                { text: 'Да, но не в той степени', value: '1' },
                { text: 'Значительно меньше', value: '2' },
                { text: 'Совсем так не считаю', value: '3' }
            ],
            13: [ // Вопрос 14
                { text: 'Часто', value: '0' },
                { text: 'Иногда', value: '1' },
                { text: 'Редко', value: '2' },
                { text: 'Очень редко', value: '3' }
            ]
        },
        getOptionsForQuestion(questionIndex) {
            return this.optionsByQuestion[questionIndex] || this.defaultOptions;
        }
    },
    test4: {
        questions: [
            'Головные боли',
            'Нервозность или внутренняя дрожь',
            'Повторяющиеся неприятные неотвязные мысли',
            'Слабость или головокружение',
            'Потеря сексуального влечения или удовольствия',
            'Чувство недовольства другими',
            'Ощущение, что кто-то другой может управлять вашими мыслями',
            'Ощущение, что почти во всех ваших неприятностях виноваты другие',
            'Проблемы с памятью',
            'Ваша небрежность или неряшливость',
            'Легко возникающая досада или раздражение',
            'Боли в сердце или грудной клетке',
            'Чувство страха в открытых местах или на улице',
            'Упадок сил или заторможенность',
            'Мысли о том, чтобы покончить с собой',
            'То, что вы слышите голоса, которых не слышат другие',
            'Дрожь',
            'Чувство, что большинству людей нельзя доверять',
            'Плохой аппетит',
            'Слезливость',
            'Застенчивость или скованность в общении с лицами другого пола',
            'Ощущение, что вы в западне или пойманы',
            'Неожиданный и беспричинный страх',
            'Вспышки гнева, которые вы не смогли сдержать',
            'Боязнь выйти из дома одному',
            'Чувство, что вы сами во многом виноваты',
            'Боли в пояснице',
            'Ощущение, что кто-то вам мешает сделать что-либо',
            'Чувство одиночества',
            'Подавленное настроение, «хандра»',
            'Чрезмерное беспокойство по разным поводам',
            'Отсутствие интереса к чему бы то ни было',
            'Чувство страха',
            'То, что ваши чувства легко задеть',
            'Ощущение, что другие проникают в ваши мысли',
            'Ощущение, что другие не понимают вас или не сочувствуют вам',
            'Ощущение, что люди не дружелюбны или вы им не нравитесь',
            'Необходимость делать все очень медленно, чтобы не допустить ошибки',
            'Сильное или учащенное сердцебиение',
            'Тошнота или расстройство желудка',
            'Ощущение, что вы хуже других',
            'Боли в мышцах',
            'Ощущение, что другие наблюдают за вами или говорят о вас',
            'То, что вам трудно заснуть',
            'Потребность проверять и перепроверять то, что вы делаете',
            'Трудности в принятии решения',
            'Боязнь ездить в метро, автобусах или поездах',
            'Затрудненное дыхание',
            'Приступы жара или озноба',
            'Необходимость избегать некоторых мест или действий, так как они вас пугают'
        ],
        title: 'Тест №4',
        options: [
            { text: 'Совсем нет', value: '0' },
            { text: 'Немного', value: '1' },
            { text: 'Умеренно', value: '2' },
            { text: 'Сильно', value: '3' },
            { text: 'Очень сильно', value: '4' }
        ],
        getOptionsForQuestion() {
            return this.options; // Возвращаем одинаковые варианты ответов для всех вопросов
        }
    }
};

// 4. Инициализация базы данных
const db = new sqlite3.Database('./survey.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных SQLite успешно.');
        initializeDatabase();
    }
});

// 5. Создание структуры базы данных
function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER UNIQUE,
            username TEXT,
            full_name TEXT,
            age INTEGER,
            gender TEXT,
            taking_meds TEXT,
            meds_details TEXT,
            pregnant TEXT,
            stage TEXT,
            current_test TEXT,
            test1_answers TEXT,
            test2_answers TEXT,
            test3_answers TEXT,
            test4_answers TEXT,
            message_id INTEGER
        )
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Ошибка при создании таблицы:', err);
        } else {
            console.log('Таблица responses успешно создана или уже существует.');
        }
    });
}

// Вспомогательная функция для проверки администратора
function isAdmin(chatId) {
    return admins.includes(chatId);
}

// Функция проверки существующего пользователя
async function checkExistingUser(chatId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM responses WHERE chat_id = ?', [chatId], (err, row) => {
            if (err) {
                console.error('Ошибка при проверке пользователя:', err);
                reject(err);
                return;
            }
            resolve(!!row); // Преобразуем в boolean: true если пользователь существует, false если нет
        });
    });
}

// Функция очистки данных пользователя
async function clearUserData(chatId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM responses WHERE chat_id = ?', [chatId], (err) => {
            if (err) {
                console.error('Ошибка при очистке данных пользователя:', err);
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// Функция сохранения данных пользователя
async function saveResponse(chatId, data) {
    return new Promise((resolve, reject) => {
        const {
            username,
            full_name,
            age,
            gender,
            taking_meds,
            meds_details,
            pregnant,
            stage,
            current_test,
            message_id,
            test1_answers,
            test2_answers,
            test3_answers,
            test4_answers
        } = data;

        // Сначала проверяем, существует ли запись
        db.get('SELECT * FROM responses WHERE chat_id = ?', [chatId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row) {
                // Обновляем существующую запись
                const updateQuery = `
                    UPDATE responses SET
                        username = COALESCE(?, username),
                        full_name = COALESCE(?, full_name),
                        age = COALESCE(?, age),
                        gender = COALESCE(?, gender),
                        taking_meds = COALESCE(?, taking_meds),
                        meds_details = COALESCE(?, meds_details),
                        pregnant = COALESCE(?, pregnant),
                        stage = COALESCE(?, stage),
                        current_test = COALESCE(?, current_test),
                        message_id = COALESCE(?, message_id),
                        test1_answers = COALESCE(?, test1_answers),
                        test2_answers = COALESCE(?, test2_answers),
                        test3_answers = COALESCE(?, test3_answers),
                        test4_answers = COALESCE(?, test4_answers)
                    WHERE chat_id = ?
                `;

                db.run(updateQuery, [
                    username,
                    full_name,
                    age,
                    gender,
                    taking_meds,
                    meds_details,
                    pregnant,
                    stage,
                    current_test,
                    message_id,
                    test1_answers,
                    test2_answers,
                    test3_answers,
                    test4_answers,
                    chatId
                ], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else {
                // Создаем новую запись
                const insertQuery = `
                    INSERT INTO responses (
                        chat_id,
                        username,
                        full_name,
                        age,
                        gender,
                        taking_meds,
                        meds_details,
                        pregnant,
                        stage,
                        current_test,
                        message_id,
                        test1_answers,
                        test2_answers,
                        test3_answers,
                        test4_answers
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(insertQuery, [
                    chatId,
                    username,
                    full_name,
                    age,
                    gender,
                    taking_meds,
                    meds_details,
                    pregnant,
                    stage,
                    current_test,
                    message_id,
                    test1_answers,
                    test2_answers,
                    test3_answers,
                    test4_answers
                ], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            }
        });
    });
}

// 6. Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Проверяем, есть ли уже запись для этого пользователя
    const existingUser = await checkExistingUser(chatId);
    if (existingUser) {
        await clearUserData(chatId);
    }

    let keyboard = [
        [{ text: 'Начать', callback_data: 'start_test' }]
    ];

    // Добавляем кнопку "База" только для администраторов
    if (isAdmin(chatId)) {
        keyboard.push([{ text: 'База', callback_data: 'export_database' }]);
    }

    const message = await bot.sendMessage(chatId, 
        `Приветствую вас! Я ваш персональный помощник в борьбе с тревогой, стрессом и напряжением.

С моей помощью вы сможете пройти профессиональные тесты, чтобы лучше понять свое эмоциональное состояние, а также получить индивидуально подобранные техники релаксации. Вот, что я могу сделать для вас:
• Справиться с тревогой, стрессом и напряжением.
• Облегчить симптомы синдрома раздраженного кишечника (СРК).
• Улучшить ваше общее самочувствие и вернуть чувство внутреннего спокойствия.

Что вы получите?
• Рекомендации, основанные на ваших результатах.
• Простые и проверенные способы расслабления, которые легко включить в свою жизнь.
• Возможность чувствовать себя лучше каждый день.
Готовы попробовать? Давайте начнем прямо сейчас!`, {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });

    await saveResponse(chatId, { 
        message_id: message.message_id,
        current_test: 'start',
        stage: 'start'
    });
});

// 7. Обработчик команды /baza
bot.onText(/\/baza/, async (msg) => {
    const chatId = msg.chat.id;
    if (isAdmin(chatId)) {
        await exportDatabase(chatId);
    } else {
        await bot.sendMessage(chatId, 'У вас нет прав для выполнения этой команды.');
    }
});

// 8. Основной обработчик callback_query для кнопок
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    try {
        // Удаляем предыдущее сообщение с кнопками
        const prevMessageId = await getLastMessageId(chatId);
        if (prevMessageId) {
            await bot.deleteMessage(chatId, prevMessageId).catch(() => {});
        }

        if (data === 'export_database') {
            if (isAdmin(chatId)) {
                await exportDatabase(chatId);
                return;
            }
        }

        if (data === 'start_test') {
            const message = await bot.sendMessage(chatId, 'Давайте познакомимся, напишите ваше ФИО (Фамилия Имя Отчество).');
            await saveResponse(chatId, { 
                stage: 'full_name', 
                username: query.from.username,
                message_id: message.message_id 
            });
        } else if (data === 'male' || data === 'female') {
            const message = await bot.sendMessage(chatId, 'Принимаете сейчас препараты?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Да', callback_data: 'meds_yes' }],
                        [{ text: 'Нет', callback_data: 'meds_no' }]
                    ]
                }
            });
            await saveResponse(chatId, { 
                gender: data, 
                stage: 'taking_meds',
                message_id: message.message_id 
            });
        } else if (data === 'meds_yes') {
            const message = await bot.sendMessage(chatId, 'Какие препараты?');
            await saveResponse(chatId, { 
                taking_meds: 'yes',
                stage: 'meds_details',
                message_id: message.message_id 
            });
        } else if (data === 'meds_no') {
            await saveResponse(chatId, { taking_meds: 'no' });
            const userGender = await getUserGender(chatId);
            if (userGender === 'female') {
                const message = await bot.sendMessage(chatId, 'Вы беременны?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Да', callback_data: 'pregnant_yes' }],
                            [{ text: 'Нет', callback_data: 'pregnant_no' }]
                        ]
                    }
                });
                await saveResponse(chatId, { 
                    stage: 'pregnant',
                    message_id: message.message_id 
                });
            } else {
                await startNextTest(chatId, 'test1');
            }
        } else if (data === 'pregnant_yes' || data === 'pregnant_no') {
            await saveResponse(chatId, { pregnant: data === 'pregnant_yes' ? 'yes' : 'no' });
            await startNextTest(chatId, 'test1');
        } else if (data.startsWith('start_test_')) {
            const testNum = data.split('_')[2];
            await askTestQuestion(chatId, `test${testNum}`, 0);
        } else if (data.startsWith('answer_')) {
            // Новый формат: answer_testNumber_questionIndex_value
            const [_, testNumber, questionIndex, value] = data.split('_');
            await handleTestAnswer(chatId, testNumber, parseInt(questionIndex), value);
        }
    } catch (error) {
        console.error('Ошибка в обработке callback_query:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте снова /start');
    }
});

// 9. Функция для создания клавиатуры с вариантами ответов

function createAnswerKeyboard(testNumber, questionIndex) {
    const test = tests[testNumber];
    
    if (test.type === 'binary') {
        return {
            inline_keyboard: test.options.map(option => [
                {
                    text: option.text,
                    callback_data: `answer_${testNumber}_${questionIndex}_${option.value}`
                }
            ])
        };
    } else {
        // Для тестов с множественным выбором используем специфичные для вопроса варианты
        const options = test.getOptionsForQuestion(questionIndex);
        return {
            inline_keyboard: options.map(option => [
                {
                    text: option.text,
                    callback_data: `answer_${testNumber}_${questionIndex}_${option.value}`
                }
            ])
        };
    }
}

// 10. Функция для начала следующего теста
async function startNextTest(chatId, testNumber) {
    try {
        if (!tests[testNumber]) {
            throw new Error(`Тест ${testNumber} не найден`);
        }

        const test = tests[testNumber];
        const messageText = testNumber === 'test1' 
            ? `Отлично! Давайте начнем первый тест.\n\n${test.title}`
            : `Спасибо за прохождение предыдущего теста! Давайте продолжим.\n\n${test.title}`;

        const message = await bot.sendMessage(chatId, messageText, {
            reply_markup: {
                inline_keyboard: [
                    [{ 
                        text: testNumber === 'test1' ? 'Начать тестирование' : 'Начать следующий тест', 
                        callback_data: `start_test_${testNumber.slice(-1)}` 
                    }]
                ]
            }
        });

        await saveResponse(chatId, { 
            current_test: testNumber,
            message_id: message.message_id,
            [`${testNumber}_answers`]: '[]'
        });

    } catch (error) {
        console.error('Ошибка при запуске теста:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте снова /start');
    }
}

// 11. Функция задания вопроса теста
async function askTestQuestion(chatId, testNumber, questionIndex) {
    const test = tests[testNumber];
    const question = test.questions[questionIndex];
    
    const message = await bot.sendMessage(
        chatId,
        `Вопрос ${questionIndex + 1}/${test.questions.length}:\n${question}`,
        {
            reply_markup: createAnswerKeyboard(testNumber, questionIndex)
        }
    );
    
    await saveResponse(chatId, { 
        message_id: message.message_id,
        current_test: testNumber
    });
}

// 12. Функция обработки ответа на вопрос теста
async function handleTestAnswer(chatId, testNumber, questionIndex, value) {
    try {
        const test = tests[testNumber];
        const answers = await getTestAnswers(chatId, testNumber);
        answers[questionIndex] = value;
        await saveTestAnswers(chatId, testNumber, answers);

        if (questionIndex + 1 < test.questions.length) {
            // Задаем следующий вопрос
            await askTestQuestion(chatId, testNumber, questionIndex + 1);
        } else {
            bot.sendMessage(chatId, "⏳ Выполняется обработка, пожалуйста, подождите...");
            // Анализируем результаты текущего теста
            await analyzeAndSendResults(chatId, answers, testNumber);

            // Проверяем, есть ли следующий тест
            const nextTestNumber = parseInt(testNumber.slice(-1)) + 1;
            if (nextTestNumber <= 4) {
                const message = await bot.sendMessage(
                    chatId,
                    'Хотите пройти следующий тест?',
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Продолжить', callback_data: `start_test_${nextTestNumber}` }]
                            ]
                        }
                    }
                );
                await saveResponse(chatId, { message_id: message.message_id });
            } else {
                // Пользователь завершил все тесты
                const allAnswers = await getAllTestAnswers(chatId); // Получаем ответы на все тесты
                await analyzeAllTestsAndSendResults(chatId, allAnswers); // Анализируем все тесты
                await bot.sendMessage(chatId, 'Поздравляем! Вы прошли все тесты. Спасибо за участие!');

                // Запускаем планирование вопроса о самочувствии через 2 дня
                const followUpDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // Через 2 дня
                // const followUpDate = new Date(Date.now() + 1 * 60 * 1000);

                schedule.scheduleJob(followUpDate, async () => {
                    await sendFollowUpMessage(chatId);
                });
            }
        }
    } catch (error) {
        console.error('Ошибка при обработке ответа:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте снова /start');
    }
}

// Функция для отправки вопроса о самочувствии
async function sendFollowUpMessage(chatId) {
    try {
        const message = await bot.sendMessage(
            chatId,
            `Приветствую!
Как вы сегодня? Уделить себе хотя бы 10–20 минут в день для расслабления — это маленький шаг к большому внутреннему спокойствию. Давайте вместе сделаем этот день немного легче и гармоничнее. Приступим? 💙
            `,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Сейчас не готов(а)", callback_data: "relaxation_yes" },
                            { text: "Да, давайте!", callback_data: "relaxation_no" }
                        ]
                    ]
                }
            }
        );

    } catch (error) {
        console.error('Ошибка при отправке вопроса о самочувствии:', error);
    }
}

// Обработка ответов на вопрос о самочувствии
bot.on('callback_query', async (callbackQuery) => {
    const { data, message } = callbackQuery;
    const chatId = message.chat.id;

    if (data === "relaxation_yes") {
        await bot.sendMessage(
            chatId,
            "Хорошо, когда вы будете готовы, давайте вместе сделаем упражнение. Найдите момент, чтобы уделить время своему спокойствию — это всегда важно."
        );
        const followUpDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // Через 2 дня
        // const followUpDate = new Date(Date.now() + 1 * 60 * 1000);

        schedule.scheduleJob(followUpDate, async () => {
            await sendFollowUpMessage(chatId);
        });
    } else if (data === "relaxation_no") {
        await bot.sendMessage(
            chatId,
             `Техники релаксации
Вот три техники релаксации, которые могут быть полезны для пользователя:

1. Глубокое дыхание: Практика глубокого дыхания помогает снизить уровень стресса и улучшить общее самочувствие. Рекомендуется вдыхать медленно через нос на 4 счета, задерживать дыхание на 4 счета, затем выдыхать через рот на 4 счета. Повторять 5-10 раз.

2. Прогрессивная мышечная релаксация: Эта техника включает поочередное напряжение и расслабление различных групп мышц. Начните с ног и постепенно поднимайтесь к голове. Это помогает снять физическое напряжение и улучшить общее состояние.

3. Медитация или визуализация: Найдите тихое место, закройте глаза и сосредоточьтесь на своем дыхании или представьте спокойное и приятное место. Это может помочь снять напряжение и уменьшить тревожность.`
        );
    }
});

async function analyzeAllTestsAndSendResults(chatId) {
    try {
        // Извлекаем данные пользователя и ответы из базы данных
        const userProfile = await getUserProfile(chatId);
        const userData = await new Promise((resolve, reject) => {
            db.get(
                'SELECT test1_answers, test2_answers, test3_answers, test4_answers FROM responses WHERE chat_id = ?',
                [chatId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        if (!userData) {
            throw new Error('Пользователь не найден в базе данных.');
        }

        // Подготовка контекста анализа
        let context = `Анализ всех результатов тестов\n\n`;
        context += `Профиль пользователя:\n`;
        context += `Возраст: ${userProfile.age}\n`;
        context += `Пол: ${userProfile.gender === 'male' ? 'мужской' : 'женский'}\n`;
        context += `Принимает медикаменты: ${userProfile.taking_meds === 'yes' ? 'да' : 'нет'}\n`;
        context += `Предложи 1 наиболее подходящие технику релаксации из представленных техник релаксации, тебе нужно выбрать одну и отправить ее так, как она и написана

        '1. Цветное дыхание
        Спокойствие может ассоциироваться с самыми разными цветами и оттенками. Этот факт еще раз показывает важность индивидуального подхода
        в использовании любых предлагаемых на тренинге или в специальной литературе техник. После рекомендую принять расслабленную позу и сконцентрироваться на дыхании. Когда дыхание стало спокойным и ровным, предлагаю следующую инструкцию: «Представьте, что с каждым вдохом в вас вливается энергия спокойствия, окрашенная в тот цвет, с которым у вас это состояние ассоциировалось». Такое дыхание продолжается в течение 1-2 минут
        Далее ответьте себе, с чем из цветов ассоциируются беспокойство, тревога. Предлагается представить, как после «цветного» вдоха следует выдох, окрашенный в цвет беспокойства и тревоги
        После инструкции можно вторым сообщением задать вопрос «Вы чувствуете себя лучше? Если нет, то предлагаем попробовать другую технику»'
         
        '2. Диафрагмальное дыхание
        Лягте на спину или сядьте на стул со спинкой Положите одну или обе руки себе на живот. Медленно и глубоко вдохните через нос. Живот должен подняться, но верхняя часть груди должна оставаться неподвижной и расслабленно.Медленно выдохните через сложенные в трубочку губы (будто задуваете свечи). Вместе с выдохом медленно и аккуратно подтягивайте живот к позвоночник.Повторите 5 раз'
        
        '3. «Техника якорения»
        Выберите какую-либо ситуацию, в которой вы хотели бы себя чувствовать более уверенно или спокойно или действовать более эффективно. Составьте для себя формулу самовнушения. Сядьте поудобнее, расслабьтесь, дышите нижним или полным дыханием. На каждом выдохе произносите про себя свою фразу самовнушения. Дышите таким образом 3-5 минут
        Затем, нарисуйте фломастерами на листе бумаги (формат А4) свое состояние на данный момент
        Часто рисуют виды природы или морские пейзажи, это могут быть также какие-то социальные ситуации. На рисунке найдите предмет или выбрите какое-то место, являющееся основным источником спокойствия или уверенности в успешном разрешении ситуации
        На втором рисунке изобразите крупно, во весь лист, выбранный участником символ спокойствия'

        '4. Релаксация по Джекобсону
        Страх, гнев, тревога, паника и беспокойство сопровождаются мышечным напряжением, и если его убрать, то можно повлиять на эмоциональное состояние, то есть добиться успокоения. Упражнения состоят из последовательного напряжения и расслабления разных групп мышц, что приводит к общему успокоению.
        Напряжение длится 7 секунд, расслабление — 30–40 секунд, при этом, расслабляясь, нужно постараться сконцентрироваться на ощущениях, которые возникают в тех частях тела, с которыми вы работаете. Это может быть ощущение тепла, легкости, тяжести, покалывания
         Каждый раз после расслабления к рабочей группе мышц добавляется новая группа. Упражнение желательно выполнять сидя.
        Сожмите изо всех сил кулаки, держа их на уровне груди. Почувствуйте напряжение в кистях
        Расслабьтесь. Какие у вас ощущения в мышцах? Постарайтесь воздержаться от любых движений 30-40 секунд.Сожмите кулаки, согните руки в лучезапястных суставах. Почувствуйте напряжение в предплечьях
        Расслабьтесь. Какие у вас ощущения в мышцах? Постарайтесь воздержаться от любых движений 30-40 секунд.Сожмите кулаки, согните руки в лучезапястных суставах и в локтях, напрягите бицепсы
        Расслабьтесь. Какие у вас ощущения в мышцах? Постарайтесь воздержаться от любых движений 30-40 секунд.Сожмите кулаки, согните руки в лучезапястных суставах и
        в локтях, напрягите бицепсы, сведите лопатки и опустите их вниз. Почувствуйте напряжение в верхних мышцах спины
        Расслабьтесь. Какие у вас ощущения
        в мышцах? Постарайтесь воздержаться от любых движений 30-40 секунд. Вытяните ноги перед собой, сведите носки, а пятки расставьте, при этом пальцы ног согните, чтобы они смотрели в пол. Согните голеностопный сустав, чтобы носок тянулся к вам, и теперь оторвите выпрямленные в коленном суставе ноги. Почувствуйте напряжение в мышцах голеней и бедер.
                  Расслабьтесь. Какие у вас ощущения в мышцах? Постарайтесь воздержаться от любых движений 30-40 секунд
        Для того чтобы ваш организм расслабился, чтобы вы испытали спокойствие, а тревожные мысли ушли на второй план, повторите эти упражнения 4–5 раз'\n`;
        if (userProfile.taking_meds === 'yes') {
            context += `Препараты: ${userProfile.meds_details}\n`;
        }
        if (userProfile.gender === 'female') {
            context += `Беременность: ${userProfile.pregnant === 'yes' ? 'да' : 'нет'}\n`;
        }
        context += `\nРезультаты тестов:\n`;

        // Анализ каждого теста
        const testColumns = ['test1_answers', 'test2_answers', 'test3_answers', 'test4_answers'];
        for (const [index, column] of testColumns.entries()) {
            const testAnswers = userData[column] ? JSON.parse(userData[column]) : null;
            const testKey = `test_${index + 1}`;
            const test = tests[testKey];

            if (!test || !testAnswers) {
                context += `⚠️ Тест ${index + 1} отсутствует или не пройден.\n\n`;
                continue;
            }

            context += `\nТест ${index + 1}: ${test.title}\n`;
            test.questions.forEach((question, qIndex) => {
                context += `Вопрос: ${question}\n`;

                // Получение вариантов для текущего вопроса
                const questionOptions = test.type === 'binary'
                    ? test.options
                    : test.getOptionsForQuestion
                        ? test.getOptionsForQuestion(qIndex)
                        : test.options;

                if (!questionOptions || questionOptions.length === 0) {
                    // context += `Ответ: Не указано (ошибка в конфигурации теста)\n\n`;
                    return;
                }

                if (test.type === 'binary') {
                    // context += `Ответ: ${testAnswers[qIndex] === 'yes' ? 'Да' : 'Нет'}\n\n`;
                } else {
                    const option = questionOptions.find(opt => String(opt.value) === String(testAnswers[qIndex]));
                    // context += `Ответ: ${option ? option.text : 'Не указано'}\n\n`;
                }
            });

            // Специфические указания для теста
            context += getTestSpecificInstructions(testKey);
        }

        // Отправка контекста в GPT для анализа
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: context }],
            temperature: 0.7,
            max_tokens: 2000
        });

        const analysis = completion.choices[0].message.content;
        // Отправка анализа пользователю
        await bot.sendMessage(
            chatId,
            `📊 Полный анализ всех тестов:\n\n${analysis}`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Ошибка при анализе всех тестов:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при анализе всех тестов. Пожалуйста, попробуйте позже.');
    }
}

async function getAllTestAnswers(chatId) {
    try {
        const userData = await new Promise((resolve, reject) => {
            db.get(
                'SELECT test1_answers, test2_answers, test3_answers, test4_answers FROM responses WHERE chat_id = ?',
                [chatId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        const allAnswers = {};
        const testAnswerColumns = ['test1_answers', 'test2_answers', 'test3_answers', 'test4_answers'];

        testAnswerColumns.forEach((column, index) => {
            if (userData[column]) {
                allAnswers[`test_${index + 1}`] = JSON.parse(userData[column]);
            }
        });

        return allAnswers;
    } catch (error) {
        console.error("Ошибка извлечения данных из базы:", error);
        throw new Error("Не удалось получить ответы.");
    }
}

// 13. Функция для получения ответов на тест
async function getTestAnswers(chatId, testNumber) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT ${testNumber}_answers FROM responses WHERE chat_id = ?`, [chatId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                resolve(row && row[`${testNumber}_answers`] ? 
                    JSON.parse(row[`${testNumber}_answers`]) : []);
            } catch (error) {
                console.error('Ошибка парсинга ответов:', error);
                resolve([]);
            }
        });
    });
}

// 14. Функция сохранения ответов теста
async function saveTestAnswers(chatId, testNumber, answers) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE responses SET ${testNumber}_answers = ? WHERE chat_id = ?`,
            [JSON.stringify(answers), chatId],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

// 15. Функция анализа и отправки результатов
async function analyzeAndSendResults(chatId, answers, testNumber) {
    try {
        
        const userProfile = await getUserProfile(chatId);
        const test = tests[testNumber];
        
        if (!test) {
            throw new Error(`Тест с номером ${testNumber} не найден.`);
        }

        // Подготовка контекста для анализа
        let context = `Анализ результатов ${test.title}\n\n`;
        context += `Профиль пользователя:\n`;
        context += `Возраст: ${userProfile.age}\n`;
        context += `Пол: ${userProfile.gender === 'male' ? 'мужской' : 'женский'}\n`;
        context += `Принимает медикаменты: ${userProfile.taking_meds === 'yes' ? 'да' : 'нет'}\n`;
        if (userProfile.taking_meds === 'yes') {
            context += `Препараты: ${userProfile.meds_details}\n`;
        }
        if (userProfile.gender === 'female') {
            context += `Беременность: ${userProfile.pregnant === 'yes' ? 'да' : 'нет'}\n`;
        }

        context += `\nОтветы на вопросы:\n`;

        test.questions.forEach((question, index) => {
            context += `Вопрос: ${question}\n`;

            // Получение вариантов для текущего вопроса
            const questionOptions = test.type === 'binary'
                ? test.options
                : test.getOptionsForQuestion 
                    ? test.getOptionsForQuestion(index) 
                    : test.options;

            if (!questionOptions || questionOptions.length === 0) {
                context += `Ответ: Не указано (ошибка в конфигурации теста)\n\n`;
                return;
            }

            if (test.type === 'binary') {
                context += `Ответ: ${answers[index] === 'yes' ? 'Да' : 'Нет'}\n\n`;
            } else {
                // Приведение типов для сравнения
                const option = questionOptions.find(opt => String(opt.value) === String(answers[index]));
                context += `Ответ: ${option ? option.text : 'Не указано'}\n\n`;
            }
        });

        // Специфические указания для разных тестов
        context += getTestSpecificInstructions(testNumber);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: context }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const analysis = completion.choices[0].message.content;
        
        await bot.sendMessage(chatId, 
            `📊 Результаты ${test.title}\n\n${analysis}`, 
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Ошибка при анализе результатов:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при анализе результатов. Пожалуйста, попробуйте позже.');
    }
}

// 16. Функция получения специфических инструкций для каждого теста
function getTestSpecificInstructions(testNumber) {
    let instructions = `На основе этих данных:\n`;
    instructions += `1. Оцени психоэмоциональное состояние пользователя\n`;
    // instructions += `2. Предложи 3 наиболее подходящие техники релаксации\n`;
    // instructions += `2. Дай индивидуальные рекомендации по улучшению состояния\n`;

    switch(testNumber) {
        case 'test1':
            // instructions += `3. Обрати особое внимание на общий уровень тревожности\n`;
            break;
        case 'test2':
            instructions += `Выдай канал восприятия 
            Ключ к тесту аудиал, визуал, кинестетик.
            • Визуальный канал восприятия: 1, 5, 8, 10, 12, 14, 19, 21, 23, 27, 31, 32, 39, 40, 42, 45.
            • Аудиальный канал восприятия: 2, 6, 7, 13, 15, 17, 20, 24, 26, 33, 34, 36, 37, 43, 46, 48.
            • Кинестетический канал восприятия: 3, 4, 9, 11, 16, 18, 22, 25, 28, 29, 30, 35, 38, 41, 44, 47.
            • Уровни перцептивной модальности (ведущего типа восприятия) :
            • 13 и более – высокий;
            • 8-12 – средний;
            • 7 и менее – низкий.\n`;
            break;
        case 'test3':
            // instructions += `3. Проанализируй физическое состояние и качество сна\n`;
            break;
        case 'test4':
            // instructions += `3. Оцени способность к самоорганизации\n`;
            break;
    }

    return instructions;
}

// 17. Функция для форматирования ответа в текст
function formatAnswerText(test, value) {
    if (test.type === 'binary') {
        return value === 'yes' ? 'Да' : 'Нет';
    } else {
        const option = test.options.find(opt => opt.value === value);
        return option ? option.text : 'Не указано';
    }
}
// 18. Обработчик текстовых сообщений
bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const text = msg.text;
    
    try {
        const userStage = await getUserStage(chatId);
        const prevMessageId = await getLastMessageId(chatId);

        if (prevMessageId) {
            await bot.deleteMessage(chatId, prevMessageId).catch(() => {});
        }

        switch (userStage) {
            case 'full_name':
                if (isValidFullName(text)) {
                    const message = await bot.sendMessage(chatId, 'Сколько вам лет?');
                    await saveResponse(chatId, { 
                        full_name: text, 
                        stage: 'age',
                        message_id: message.message_id 
                    });
                } else {
                    const message = await bot.sendMessage(chatId, 
                        'Пожалуйста, укажите корректное ФИО (например, Иванов Иван Иванович).');
                    await saveResponse(chatId, { message_id: message.message_id });
                }
                break;

            case 'age':
                const age = parseInt(text, 10);
                if (isValidAge(age)) {
                    const message = await bot.sendMessage(chatId, 'Укажите ваш пол.', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: 'Мужчина', callback_data: 'male' },
                                    { text: 'Женщина', callback_data: 'female' }
                                ]
                            ]
                        }
                    });
                    await saveResponse(chatId, { 
                        age, 
                        stage: 'gender',
                        message_id: message.message_id 
                    });
                } else {
                    const message = await bot.sendMessage(chatId, 
                        'Пожалуйста, укажите корректный возраст (1-120 лет).');
                    await saveResponse(chatId, { message_id: message.message_id });
                }
                break;

            case 'meds_details':
                const userGender = await getUserGender(chatId);
                await saveResponse(chatId, { meds_details: text });

                if (userGender === 'female') {
                    const message = await bot.sendMessage(chatId, 'Вы беременны?', {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: 'Да', callback_data: 'pregnant_yes' },
                                    { text: 'Нет', callback_data: 'pregnant_no' }
                                ]
                            ]
                        }
                    });
                    await saveResponse(chatId, { 
                        stage: 'pregnant',
                        message_id: message.message_id 
                    });
                } else {
                    await startNextTest(chatId, 'test1');
                }
                break;
        }
    } catch (error) {
        console.error('Ошибка в обработке сообщения:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте снова /start');
    }
});

// 19. Функция экспорта базы данных
async function exportDatabase(chatId) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Определяем столбцы
        worksheet.columns = [
            { header: 'Chat ID', key: 'chat_id' },
            { header: 'Username', key: 'username' },
            { header: 'ФИО', key: 'full_name' },
            { header: 'Возраст', key: 'age' },
            { header: 'Пол', key: 'gender' },
            { header: 'Принимает препараты', key: 'taking_meds' },
            { header: 'Препараты', key: 'meds_details' },
            { header: 'Беременность', key: 'pregnant' },
            { header: 'Тест 1', key: 'test1_answers' },
            { header: 'Тест 2', key: 'test2_answers' },
            { header: 'Тест 3', key: 'test3_answers' },
            { header: 'Тест 4', key: 'test4_answers' }
        ];

        // Получаем данные пользователей
        const users = await getAllUsers();

        // Форматируем и добавляем данные
        users.forEach(user => {
            const formattedUser = {
                chat_id: user.chat_id,
                username: user.username,
                full_name: user.full_name,
                age: user.age,
                gender: user.gender === 'male' ? 'Мужской' : 'Женский',
                taking_meds: user.taking_meds === 'yes' ? 'Да' : 'Нет',
                meds_details: user.meds_details || 'Нет данных',
                pregnant: user.pregnant === 'yes' ? 'Да' : user.pregnant === 'no' ? 'Нет' : 'Нет данных',
                test1_answers: formatTestAnswersForExport('test1', user.test1_answers),
                test2_answers: formatTestAnswersForExport('test2', user.test2_answers),
                test3_answers: formatTestAnswersForExport('test3', user.test3_answers),
                test4_answers: formatTestAnswersForExport('test4', user.test4_answers)
            };
            worksheet.addRow(formattedUser);
        });

        // Сохраняем файл
        const fileName = `user_database_${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(fileName);

        // Отправляем файл
        await bot.sendDocument(chatId, fileName);

        // Удаляем временный файл
        fs.unlinkSync(fileName);

        await bot.sendMessage(chatId, 'База данных успешно экспортирована.');

    } catch (error) {
        console.error('Ошибка при экспорте базы данных:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при экспорте базы данных.');
    }
}

// 20. Вспомогательные функции
function isValidFullName(name) {
    return /^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$/.test(name);
}

function isValidAge(age) {
    return !isNaN(age) && age >= 1 && age <= 120;
}

async function getUserProfile(chatId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM responses WHERE chat_id = ?', [chatId], (err, row) => {
            if (err) reject(err);
            resolve(row || {});
        });
    });
}

async function getUserStage(chatId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT stage FROM responses WHERE chat_id = ?', [chatId], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.stage : null);
        });
    });
}

async function getUserGender(chatId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT gender FROM responses WHERE chat_id = ?', [chatId], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.gender : null);
        });
    });
}

async function getLastMessageId(chatId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT message_id FROM responses WHERE chat_id = ?', [chatId], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.message_id : null);
        });
    });
}

async function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM responses', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function formatTestAnswersForExport(testNumber, answersJson) {
    try {
        const answers = JSON.parse(answersJson || '[]');
        const test = tests[testNumber];
        if (!test || !answers.length) return 'Нет данных';

        return answers.map((answer, index) => {
            const question = test.questions[index];
            const formattedAnswer = test.type === 'binary' ? 
                (answer === 'yes' ? 'Да' : 'Нет') :
                test.options.find(opt => opt.value === answer)?.text || 'Нет ответа';
            return `${index + 1}) ${question}: ${formattedAnswer}`;
        }).join('\n');
    } catch (error) {
        console.error('Ошибка форматирования ответов:', error);
        return 'Ошибка форматирования';
    }
}

// 21. Обработка ошибок
process.on('uncaughtException', (error) => {
    console.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Необработанное отклонение промиса:', error);
});
