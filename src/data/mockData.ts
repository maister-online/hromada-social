import {
  CnapService,
  InfrastructureNode,
  CommunityProblem,
  CommunityPetition,
  BusinessListing,
  RokytaPost,
  RokytaStory,
  RokytaGroup,
  RokytaEvent,
  RokytaFriend,
  NotificationItem,
  WeatherData,
  SocialInquiry,
  TourismSpot
} from '../types';

export const CNAP_SERVICES: CnapService[] = [
  {
    id: 'residence-certificate',
    code: '100-EXTRACT-RESIDENCE',
    category: 'certificates',
    title: 'Витяг з реєстру територіальної громади (Довідка про прописку)',
    description: 'Офіційний документ про реєстрацію місця проживання особи на території Рокитнівської громади із QR-кодом.',
    requiredDocuments: [
      'Паспорт громадянина України або ID-картка',
      'Заява встановленого зразка (формується у ЦНАП)'
    ],
    processingDays: 1,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ реєстрації місця проживання ЦНАП'
  },
  {
    id: 'passport-id',
    code: '101-PASSPORT',
    category: 'passport',
    title: 'Оформлення та видача паспорта громадянина України (ID-картка)',
    description: 'Оформлення вперше у 14 років, заміна у зв\'язку зі зміною прізвища, втратою або пошкодженням.',
    requiredDocuments: [
      'Паспорт громадянина України або свідоцтво про народження',
      'Витяг з реєстру територіальної громади про прописку',
      'Квитанція про сплату адміністративного збору'
    ],
    processingDays: 20,
    feeUah: 550,
    onlineBookingAvailable: true,
    department: 'Відділ паспортних послуг ЦНАП'
  },
  {
    id: 'passport-foreign',
    code: '102-PASSPORT-INT',
    category: 'passport',
    title: 'Оформлення паспорта для виїзду за кордон',
    description: 'Закордонний біометричний паспорт з електронним носієм для дорослих та дітей.',
    requiredDocuments: [
      'Паспорт громадянина України / ID-картка',
      'Попередній закордонний паспорт (за наявності)',
      'Квитанція про сплату адмінзбору'
    ],
    processingDays: 20,
    feeUah: 958,
    onlineBookingAvailable: true,
    department: 'Відділ паспортних послуг ЦНАП'
  },
  {
    id: 'photo-25-45',
    code: '103-PASSPORT-PHOTO',
    category: 'passport',
    title: 'Вклеювання фотокартки до паспорта громадянина (25 та 45 років)',
    description: 'Вклеювання нового фото у паспорт-книжечку по досягненню 25 або 45-річного віку.',
    requiredDocuments: [
      'Паспорт громадянина України (книжечка)',
      'Дві фотокартки розміром 3,5 х 4,5 см'
    ],
    processingDays: 5,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ паспортних послуг ЦНАП'
  },
  {
    id: 'family-composition',
    code: '104-CERT-FAMILY',
    category: 'certificates',
    title: 'Довідка про склад сім\'ї та зареєстрованих у житловому приміщенні осіб',
    description: 'Довідка для подання в органи соцзахисту, нотаріусу, газопостачальним та комунальним службам.',
    requiredDocuments: [
      'Документ на право власності на житло або право користування',
      'Паспорти та свідоцтва про народження всіх зареєстрованих осіб'
    ],
    processingDays: 1,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ реєстрації та ведення обліку ЦНАП'
  },
  {
    id: 'vpo-status',
    code: '301-SOCIAL-VPO',
    category: 'social',
    title: 'Оформлення довідки ВПО та допомоги на проживання',
    description: 'Надання статусу внутрішньо переміщеної особи та призначення щомісячної грошової допомоги.',
    requiredDocuments: [
      'Заява про взяття на облік ВПО',
      'Паспорт та ідентифікаційний код (РНОКПП)',
      'Реквізити банківської картки (IBAN)'
    ],
    processingDays: 3,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Управління соціального захисту населення'
  },
  {
    id: 'e-malyatko',
    code: '302-E-MALYATKO',
    category: 'social',
    title: 'Комплексна послуга "єМалятко" при народженні дитини',
    description: 'Одночасне оформлення свідоцтва про народження, грошової допомоги, реєстрації прописки та ідентифікаційного коду малюка.',
    requiredDocuments: [
      'Медичний висновок про народження (електронний колірний номер)',
      'Паспорти та РНОКПП обох батьків',
      'Свідоцтво про шлюб (за наявності)'
    ],
    processingDays: 1,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ ДРАЦС та комплексних соціальних послуг'
  },
  {
    id: 'subsidies-apply',
    code: '303-SUBSIDY',
    category: 'social',
    title: 'Оформлення житлової субсидії та пільг на комунальні послуги',
    description: 'Призначення державної субсидії на оплату житлово-комунальних послуг, придбання скрапленого газу та пічного палива.',
    requiredDocuments: [
      'Заява про призначення та надання житлової субсидії',
      'Декларація про доходи і витрати осіб'
    ],
    processingDays: 10,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Управління соціального захисту населення'
  },
  {
    id: 'veteran-support',
    code: '401-VETERAN',
    category: 'veterans',
    title: 'Комплексна послуга "Я-Ветеран" та підтримка Захисників',
    description: 'Оформлення пільг на комунальні послуги, грошових виплат, медичного оздоровлення та санаторного лікування.',
    requiredDocuments: [
      'Посвідчення УБД / особи з інвалідністю внаслідок війни',
      'Паспорт та ідентифікаційний код',
      'Довідка про участь у заходах із оборони України'
    ],
    processingDays: 5,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Центр підтримки ветеранів "Я-Ветеран"'
  },
  {
    id: 'cadastre-extract',
    code: '501-LAND-CADASTRE',
    category: 'land',
    title: 'Витяг з Державного земельного кадастру (ДЗК) про земельну ділянку',
    description: 'Надання офіційного витягу з ДЗК з кадастровим номером, межами та цільовим призначенням ділянки.',
    requiredDocuments: [
      'Заява про надання витягу з ДЗК',
      'Документ, що посвідчує особу',
      'Квитанція про сплату адміністративного збору'
    ],
    processingDays: 1,
    feeUah: 140,
    onlineBookingAvailable: true,
    department: 'Відділ земельних відносин та кадастру ЦНАП'
  },
  {
    id: 'land-project-approve',
    code: '502-LAND-PROJECT',
    category: 'land',
    title: 'Затвердження проекту землеустрою щодо відведення земельної ділянки',
    description: 'Рішення селищної ради про затвердження проекту землеустрою та передачу ділянки у власність або оренду.',
    requiredDocuments: [
      'Заява до селищного голови',
      'Розроблений та погоджений проект землеустрою',
      'Витяг з ДЗК про ділянку'
    ],
    processingDays: 14,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ земельних відносин та комунальної власності'
  },
  {
    id: 'fop-register',
    code: '601-BIZ-FOP',
    category: 'business',
    title: 'Державна реєстрація фізичної особи-підприємця (ФОП)',
    description: 'Відкриття ФОП для ведення бізнесу з внесенням даних до ЄДР та передачею даних у податкову інспекцію.',
    requiredDocuments: [
      'Заява про державну реєстрацію ФОП (Форма 1)',
      'Паспорт громадянина України та РНОКПП'
    ],
    processingDays: 1,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ державної реєстрації суб\'єктів господарювання'
  },
  {
    id: 'property-register-extract',
    code: '701-PROPERTY-EXTRACT',
    category: 'property',
    title: 'Витяг з Державного реєстру речових прав на нерухоме майно (ДРРП)',
    description: 'Отримання інформаційної довідки чи витягу про власника, обтяження або арешти на житловий будинок чи квартиру.',
    requiredDocuments: [
      'Заява про надання витягу',
      'Паспорт та ідентифікаційний код заявника',
      'Квитанція про сплату адмінзбору'
    ],
    processingDays: 1,
    feeUah: 80,
    onlineBookingAvailable: true,
    department: 'Відділ державної реєстрації речових прав на нерухоме майно'
  },
  {
    id: 'building-passport',
    code: '702-BUILDING-PASSPORT',
    category: 'construction',
    title: 'Видача будівельного паспорта забудови земельної ділянки',
    description: 'Видача будівельного паспорта для будівництва індивідуального житлового будинку до 500 кв.м у громаді.',
    requiredDocuments: [
      'Заява на видачу будівельного паспорта',
      'Засвідчена копія документа про право власності на ділянку',
      'Ескізні наміри забудови'
    ],
    processingDays: 10,
    feeUah: 0,
    onlineBookingAvailable: true,
    department: 'Відділ містобудування та архітектури'
  }
];

export const INITIAL_CNAP_SERVICES = CNAP_SERVICES;

export const INFRASTRUCTURE_NODES: InfrastructureNode[] = [
  {
    id: 'cnap-main',
    name: 'Головний ЦНАП Рокитнівської селищної ради',
    title: 'Головний ЦНАП Рокитнівської селищної ради',
    type: 'cnap',
    category: 'cnap',
    address: 'вул. Незалежності, 13',
    settlement: 'смт Рокитне',
    coordinates: { lat: 51.2825, lng: 27.2091 },
    phone: '(03635) 2-15-42',
    hours: 'Пн-Чт: 08:00 - 17:15, Пт: 08:00 - 16:00',
    headName: 'Крупенко Олена Василівна',
    description: 'Сучасний центр надання адміністративних послуг із сервісом "Я-Ветеран", електронною чергою та паспортними станціями.',
    servicesAvailable: ['Паспорти', 'Реєстрація', 'Земля', 'Соціальні допомоги', 'Ветерани'],
    isPointOfInvincibility: true
  },
  {
    id: 'council-main',
    name: 'Рокитнівська селищна рада',
    title: 'Рокитнівська селищна рада',
    type: 'cnap',
    category: 'cnap',
    address: 'вул. Незалежності, 15',
    settlement: 'смт Рокитне',
    coordinates: { lat: 51.2829, lng: 27.2088 },
    phone: '(03635) 2-12-30',
    hours: 'Пн-Пт: 08:00 - 17:00',
    headName: 'Таргонський Григорій Миколайович (Селищний голова)',
    description: 'Адміністративний центр Рокитнівської громади.',
    isPointOfInvincibility: true
  },
  {
    id: 'starosta-blazhove',
    name: 'Блажовський старостинський округ',
    title: 'Блажовський старостинський округ',
    type: 'starosta',
    category: 'starosta',
    address: 'вул. Центральна, 42',
    settlement: 'с. Блажове',
    coordinates: { lat: 51.3540, lng: 27.2840 },
    phone: '(03635) 6-12-21',
    hours: 'Пн-Пт: 08:00 - 17:00',
    headName: 'Староста: Боловець Сергій Анатолійович',
    description: 'Обслуговує с. Блажове, с. Залав\'я, с. Більськ.'
  },
  {
    id: 'hospital-main',
    name: 'КНП "Рокитнівська багатопрофільна лікарня"',
    title: 'КНП "Рокитнівська багатопрофільна лікарня"',
    type: 'medical',
    category: 'medicine',
    address: 'вул. 1 Травня, 48',
    settlement: 'смт Рокитне',
    coordinates: { lat: 51.2880, lng: 27.2150 },
    phone: '(03635) 2-14-65',
    hours: 'Цілодобово',
    description: 'Багатопрофільна лікарня інтенсивного лікування з хірургічним та реанімаційним відділеннями.',
    isPointOfInvincibility: true
  },
  {
    id: 'shelter-culture',
    name: 'Укриття & Пункт Незламності (Будинок Культури)',
    title: 'Укриття & Пункт Незламності (Будинок Культури)',
    type: 'shelter',
    category: 'shelter',
    address: 'вул. Незалежності, 22',
    settlement: 'смт Рокитне',
    coordinates: { lat: 51.2832, lng: 27.2105 },
    phone: '(03635) 2-15-42',
    hours: 'Цілодобово під час тривоги',
    description: 'Захисне укриття із заживленням від генератора, інтернетом Starlink та запасом питної води.',
    isPointOfInvincibility: true
  }
];

export const INITIAL_INFRASTRUCTURE_NODES = INFRASTRUCTURE_NODES;

// --- COMMUNITY PROBLEMS MOCK DATA ---

export const INITIAL_COMMUNITY_PROBLEMS: CommunityProblem[] = [
  {
    id: 'prob-101',
    title: 'Яма на проїжджій частині вулиці Центральної',
    description: 'Глибока вибоїна поблизу повороту до дитячого садка "Казка". Загрожує пошкодженням підвіски автомобілів та створила аварійну ситуацію для пішоходів.',
    category: 'дороди',
    settlement: 'смт Рокитне',
    address: 'вул. Центральна, 84',
    coordinates: { lat: 51.2815, lng: 27.2050 },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    authorName: 'Андрій Ковальчук',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '06.08.2026, 14:20',
    status: 'in_progress',
    statusProgress: 65,
    assignedDepartment: 'КП "Рокитне-Комунпослуга"',
    upvotesCount: 84,
    userVoted: true,
    commentsCount: 12,
    updatesHistory: [
      { date: '06.08.2026', status: 'Нове', note: 'Заявку прийнято системою AI та передано диспетчеру' },
      { date: '07.08.2026', status: 'Прийнято', note: 'Спеціаліст Комунпослуги оглянув ділянку, включено у план ямкового ремонту' },
      { date: '08.08.2026', status: 'В роботі', note: 'Завезено асфальтну суміш, залучено дорожню бригаду' }
    ]
  },
  {
    id: 'prob-102',
    title: 'Пошкоджено вуличний ліхтар біля зупинки с. Блажове',
    description: 'Після нічної бурі не працює вуличний ліхтар на сонячній батареї біля зупинки громадського транспорту.',
    category: 'освітлення',
    settlement: 'с. Блажове',
    address: 'вул. Шкільна, зупинка',
    coordinates: { lat: 51.3542, lng: 27.2845 },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    authorName: 'Олена Семенюк',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: '07.08.2026, 18:45',
    status: 'accepted',
    statusProgress: 35,
    assignedDepartment: 'Енергетичний сектор селищної ради',
    upvotesCount: 42,
    userVoted: false,
    commentsCount: 5,
    updatesHistory: [
      { date: '07.08.2026', status: 'Нове', note: 'Звернення зареєстровано' },
      { date: '08.08.2026', status: 'Прийнято', note: 'Направлено бригаду електриків для заміни інвертора' }
    ]
  }
];

// --- COMMUNITY PETITIONS MOCK DATA ---

export const INITIAL_COMMUNITY_PETITIONS: CommunityPetition[] = [
  {
    id: 'pet-201',
    title: 'Облаштування сучасного спортивного майданчика WorkOut у смт Томашгород',
    description: 'Просимо виділити фінансування з місцевого бюджету громади на встановлення вуличних турніків, тренажерів та гумового безпечного покриття на території біля будинку культури смт Томашгород.',
    category: 'Молодь та Спорт',
    authorName: 'Максим Мельник',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdDate: '15.07.2026',
    endDate: '15.10.2026',
    signaturesCount: 782,
    signaturesGoal: 1000,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
    userSigned: true,
    commentsCount: 34
  }
];

// --- BUSINESS MARKETPLACE MOCK DATA ---

export const INITIAL_BUSINESS_LISTINGS: BusinessListing[] = [
  {
    id: 'biz-301',
    title: 'Продам пиломатеріали обрізні (сосна) від виробника',
    priceUah: 6500,
    category: 'будматеріали',
    sellerName: 'ПП "Полісся Дерево"',
    sellerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 330-44-55',
    settlement: 'смт Рокитне',
    location: 'смт Рокитне',
    address: 'вул. Промислова, 8',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'],
    description: 'Якісний брус, дошка обрізна, рейка від місцевого деревообробного підприємства. Доставка по території всієї Рокитнівської громади.',
    dateAdded: 'Сьогодні о 10:15',
    viewsCount: 240,
    favoritesCount: 18,
    isFavorite: false,
    isVerifiedSeller: true,
    isVerifiedBusiness: true,
    companyName: 'ПП Полісся Дерево',
    specs: { 'Порода': 'Сосна', 'Вологість': '18%', 'Доставка': 'Так' }
  },
  {
    id: 'biz-302',
    title: 'Продам Volkswagen Passat B8 2.0 TDI (2018 р.)',
    priceUah: 540000,
    category: 'auto',
    sellerName: 'Олександр Дмитрук',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 123-45-67',
    settlement: 'смт Рокитне',
    location: 'смт Рокитне',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'],
    description: 'Ідеальний стан, обслуговувався вчасно. Пробіг 185 тис. км. Комплектація Highline.',
    dateAdded: 'Сьогодні',
    viewsCount: 120,
    favoritesCount: 14,
    isVerifiedSeller: true,
    specs: { 'Рік': '2018', 'Пробіг': '185,000 км', 'Двигун': '2.0 Дизель' }
  }
];

// --- SOCIAL FEED POSTS MOCK DATA ---

export const INITIAL_SOCIAL_POSTS: RokytaPost[] = [
  {
    id: 'post-501',
    author: 'Григорій Таргонський',
    authorName: 'Григорій Таргонський',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Селищний голова Рокитнівської громади',
    isOfficialAccount: true,
    isVerified: true,
    settlement: 'смт Рокитне',
    timestamp: '15 хвилин тому',
    createdAt: '15 хвилин тому',
    privacy: 'public',
    category: 'news',
    title: '🚀 Запуск оновленої AI-платформи Рокитнівської територіальної громади!',
    content: 'Раді презентувати нашим жителям єдину цифрову систему громади з голосом Рокитне-Бот AI, інтерактивною картою проблем, сервісами ЦНАПу, маркетплейсом для бізнесу та онлайн-петиціями. Звертайтеся до нашого AI-помічника 24/7!',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'],
    reactions: { like: 142, love: 89, wow: 34, bravo: 56, helpful: 45 },
    likesCount: 142,
    userLiked: true,
    userReaction: 'love',
    commentsCount: 28,
    sharesCount: 19,
    comments: [
      {
        id: 'c501',
        author: 'Валентина Коваль',
        authorName: 'Валентина Коваль',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        text: 'Чудова новина! Дуже зручно, що тепер можна перевірити статус звернення прямо в телефоні.',
        timestamp: '10 хвилин тому',
        createdAt: '10 хвилин тому',
        likesCount: 12,
        isLiked: true
      }
    ]
  }
];

export const COMMUNITY_POSTS = INITIAL_SOCIAL_POSTS;

export const INITIAL_STORIES: RokytaStory[] = [
  {
    id: 's-1',
    title: 'День Прапора у Рокитному',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    authorName: 'Селищна рада',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Офіційно',
    isVerified: true
  },
  {
    id: 's-2',
    title: 'Ярмарок у с. Блажове',
    mediaUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    authorName: 'Блажовський округ',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    authorRole: 'Староста'
  }
];

export const INITIAL_SOCIAL_REQUESTS: SocialInquiry[] = [
  {
    id: 'req-1',
    trackingNumber: '№393-2026-8812',
    trackingCode: '№393-2026-8812',
    category: 'vpo',
    title: 'Отримання довідки про взяття на облік ВПО',
    subject: 'Заява про надання довідки ВПО та грошової допомоги',
    fullName: 'Олександр Дмитрук',
    applicantName: 'Олександр Дмитрук',
    phone: '+380 97 123 4567',
    applicantPhone: '+380 97 123 4567',
    address: 'смт Рокитне, вул. Незалежності, 12',
    details: 'Подаю клопотання щодо отримання державної щомісячної допомоги на проживання ВПО.',
    description: 'Подаю клопотання щодо отримання державної щомісячної допомоги на проживання ВПО.',
    status: 'registered',
    aiResponse: 'Запит автоматично перевірено та скеровано у відділ соцзахисту.',
    suggestedDocuments: ['Паспорт', 'ІПН', 'Реквізити IBAN'],
    createdDate: '01.08.2026',
    createdAt: '01.08.2026',
    department: 'Відділ соціального захисту',
    responseDueDate: 'До 15.08.2026'
  }
];

export const FREQUENT_QUERIES = [
  { id: 'q1', query: 'Які документи потрібні для оформлення закордонного паспорта у ЦНАП?', title: 'Паспортні послуги ЦНАП', prompt: 'Які документи потрібні для оформлення закордонного паспорта у ЦНАП?', icon: 'FileText' },
  { id: 'q2', query: 'Як подати скаргу або звернення про яму на дорозі?', title: 'Повідомити про проблему', prompt: 'Як подати скаргу або звернення про яму на дорозі?', icon: 'AlertTriangle' },
  { id: 'q3', query: 'Де знаходиться найближче укриття з генератором?', title: 'Карта укриттів Рокитного', prompt: 'Де знаходиться найближче укриття з генератором?', icon: 'MapPin' },
  { id: 'q4', query: 'Графік прийому селищного голови Рокитного?', title: 'Прийом селищного голови', prompt: 'Графік прийому селищного голови Рокитного?', icon: 'HelpCircle' }
];

export const TOURISM_SPOTS: TourismSpot[] = [
  {
    id: 'tour-1',
    title: 'Озеро Залавське & Сосновий Бор',
    category: 'nature_lake',
    description: 'Мальовниче озеро льодовикового походження поблизу с. Залав\'я з рекреаційними зонами.',
    location: 'с. Залав\'я, Рокитнівська громада',
    features: ['Пляж', 'Альтанки', 'Риболовля', 'Кемпінг'],
    rating: 4.9,
    reviewsCount: 88,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    bestSeason: 'Травень - Вересень',
    amenities: ['Парковка', 'Мангали']
  }
];

export const COMMUNITY_EVENTS: RokytaEvent[] = [
  {
    id: 'ev-1',
    title: 'Благодійний Поліський Ярмарок на підтримку ЗСУ',
    date: '15 Серпня 2026',
    time: '11:00',
    location: 'Центральна площа смт Рокитне',
    organizer: 'Рокитнівська селищна рада',
    organizerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    category: 'Ярмарок',
    goingCount: 340,
    interestedCount: 520,
    description: 'Виставка-продаж поліських смаколиків, крафтових виробів та майстер-класи.'
  }
];

// --- NOTIFICATIONS MOCK DATA ---

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'problem',
    title: 'Статус проблеми оновлено',
    description: 'Ваше звернення щодо вибоїни на вул. Центральна переведено у статус "В роботі".',
    timestamp: '10 хв тому',
    isRead: false
  },
  {
    id: 'notif-2',
    category: 'ai',
    title: 'AI Аналітика громади',
    description: 'Згенеровано тижневий звіт з популярних питань мешканців ЦНАПу.',
    timestamp: '1 годину тому',
    isRead: false
  },
  {
    id: 'notif-3',
    category: 'petition',
    title: 'Новий підпис петиції',
    description: 'Петиція про спортивний майданчик у Томашгороді досягла 780 підписів.',
    timestamp: '3 години тому',
    isRead: true
  }
];

// --- WEATHER MOCK DATA ---

export const INITIAL_WEATHER_DATA: WeatherData = {
  city: 'смт Рокитне',
  temp: 24,
  feelsLike: 25,
  condition: 'Сонячно з мінливою хмарністю',
  icon: 'Sun',
  humidity: 58,
  windSpeedMs: 3.8,
  pressureMmHg: 756,
  uvIndex: 4,
  airQuality: 'Відмінно (AQI 18)',
  hourlyForecast: [
    { time: '09:00', temp: 21, condition: 'Сонячно' },
    { time: '12:00', temp: 24, condition: 'Хмарно' },
    { time: '15:00', temp: 26, condition: 'Сонячно' },
    { time: '18:00', temp: 23, condition: 'Легкий вітер' },
    { time: '21:00', temp: 19, condition: 'Ясно' }
  ],
  dailyForecast: [
    { day: 'Сьогодні', high: 26, low: 16, condition: 'Сонячно' },
    { day: 'Завтра', high: 25, low: 15, condition: 'Мінлива хмарність' },
    { day: 'Неділя', high: 22, low: 14, condition: 'Короткочасний дощ' },
    { day: 'Понеділок', high: 24, low: 15, condition: 'Ясно' },
    { day: 'Вівторок', high: 27, low: 17, condition: 'Сонячно' }
  ]
};
