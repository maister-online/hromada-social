import {
  Trees,
  Apple,
  Car,
  Home,
  Wrench,
  Tractor,
  Briefcase,
  Smartphone,
  Dog,
  ShoppingBag,
  LucideIcon
} from 'lucide-react';
import { BusinessListing } from '../types';

export interface MarketplaceSubcategory {
  id: string;
  label: string;
}

export interface MarketplaceCategoryDef {
  id: string;
  label: string;
  icon: LucideIcon;
  subcategories: MarketplaceSubcategory[];
}

export const CATEGORIES_WITH_SUBCATEGORIES: MarketplaceCategoryDef[] = [
  {
    id: 'all',
    label: 'Усі категорії',
    icon: ShoppingBag,
    subcategories: []
  },
  {
    id: 'будматеріали',
    label: 'Деревина & Будматеріали',
    icon: Trees,
    subcategories: [
      { id: 'sub_lumber', label: '🪵 Дрова, брус & пиломатеріали' },
      { id: 'sub_roofing', label: '🏠 Покрівля, шифер & метал' },
      { id: 'sub_concrete', label: '🧱 Цегла, блоки & бетон' },
      { id: 'sub_tools', label: '🛠️ Інструменти & суміші' }
    ]
  },
  {
    id: 'фермерство',
    label: 'Фермерські продукти Полісся',
    icon: Apple,
    subcategories: [
      { id: 'sub_honey', label: '🍯 Мед & пасіка' },
      { id: 'sub_wild_berries', label: '🫐 Гриби, чорниця & журавлина' },
      { id: 'sub_dairy_meat', label: '🧀 Домашнє м\'ясо, сир & молоко' },
      { id: 'sub_vegetables', label: '🥔 Овочі, фрукти & розсада' },
      { id: 'sub_grain', label: '🌾 Зерно, сіно & комбікорм' }
    ]
  },
  {
    id: 'auto',
    label: 'Автомобілі & Транспорт',
    icon: Car,
    subcategories: [
      { id: 'sub_cars', label: '🚗 Легкові автомобілі' },
      { id: 'sub_trucks', label: '🚚 Вантажівки & буси' },
      { id: 'sub_parts', label: '🔧 Автозапчастини & шини' },
      { id: 'sub_moto', label: '🏍️ Мотоцикли & скутери' },
      { id: 'sub_trailers', label: '🚜 Причепи & спецтехніка' }
    ]
  },
  {
    id: 'realty',
    label: 'Нерухомість Рокитнівщини',
    icon: Home,
    subcategories: [
      { id: 'sub_rent', label: '🔑 Оренда житла (квартири, будинки)' },
      { id: 'sub_houses', label: '🏡 Продаж будинків & дач' },
      { id: 'sub_flats', label: '🏢 Продаж квартир' },
      { id: 'sub_commercial', label: '🏪 Комерційна нерухомість' },
      { id: 'sub_land_plots', label: '🌱 Земельні ділянки' }
    ]
  },
  {
    id: 'services',
    label: 'Послуги & Майстри',
    icon: Wrench,
    subcategories: [
      { id: 'sub_construction', label: '🏗️ Будівництво & ремонт' },
      { id: 'sub_cargo', label: '🚛 Вантажні перевезення' },
      { id: 'sub_auto_repair', label: '⚙️ СТО & автоелектрик' },
      { id: 'sub_tech_repair', label: '🧰 Ремонт побутової техніки' },
      { id: 'sub_domestic', label: '💡 Електрик, сантехнік, майстри' }
    ]
  },
  {
    id: 'agro',
    label: 'Сільгосптехніка & Агро',
    icon: Tractor,
    subcategories: [
      { id: 'sub_tractors', label: '🚜 Трактори & мотоблоки' },
      { id: 'sub_implements', label: '⚙️ Плуги, косарки & фрези' },
      { id: 'sub_harvesters', label: '🌾 Комбайни & заготовка сіна' },
      { id: 'sub_agro_parts', label: '🔩 Запчастини до агротехніки' }
    ]
  },
  {
    id: 'jobs',
    label: 'Робота & Вакансії',
    icon: Briefcase,
    subcategories: [
      { id: 'sub_job_drivers', label: '🚛 Водії & вантажники' },
      { id: 'sub_job_wood', label: '🪵 Деревообробка & пилорами' },
      { id: 'sub_job_builders', label: '🧱 Будівельники & майстри' },
      { id: 'sub_job_trade', label: '🛒 Продавці & сфера послуг' },
      { id: 'sub_job_seasonal', label: '🍓 Сезонні роботи & збір врожаю' }
    ]
  },
  {
    id: 'electronics',
    label: 'Електроніка & Техніка',
    icon: Smartphone,
    subcategories: [
      { id: 'sub_phones', label: '📱 Смартфони & телефони' },
      { id: 'sub_laptops', label: '💻 Ноутбуки & ПК' },
      { id: 'sub_home_appliances', label: '📺 Побутова техніка' },
      { id: 'sub_power', label: '⚡ Генератори & інвертори' }
    ]
  },
  {
    id: 'animals',
    label: 'Тварини & Зоотовари',
    icon: Dog,
    subcategories: [
      { id: 'sub_poultry', label: '🐓 Домашня птиця & кролі' },
      { id: 'sub_livestock', label: '🐄 Корови, коні & поросята' },
      { id: 'sub_pets', label: '🐕 Собаки & коти' },
      { id: 'sub_feed', label: '🌾 Корми, комбікорм & сіно' }
    ]
  }
];

export const OLX_ROKYTNE_ARCHIVE_LISTINGS: BusinessListing[] = [
  {
    id: 'olx-rok-101',
    title: 'Продам дубові та соснові дрова колоті з доставкою по Рокитному',
    priceUah: 1850,
    category: 'будматеріали',
    subcategory: 'sub_lumber',
    sellerName: 'Василь Мельник (OLX)',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 412-88-99',
    settlement: 'смт Рокитне',
    location: 'смт Рокитне, Рівненська область',
    imageUrl: 'https://images.unsplash.com/photo-1520114878144-6123749968dd?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1520114878144-6123749968dd?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з архіву OLX Рокитне. Продаж сухого дрова колотого (дуб, граб, сосна) самоскидом ГАЗ-53. Безкоштовна доставка у межах селища та найближчих сіл.',
    dateAdded: 'Архів OLX (14 жовтня 2025)',
    viewsCount: 840,
    favoritesCount: 92,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'used',
    specs: {
      'Джерело': 'OLX Рокитне',
      'Порода': 'Дуб / Сосна',
      'Об\'єм': '1 складометр',
      'Доставка': 'ГАЗ-53 самоскид'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-88129034',
    olxStatus: 'archived',
    olxOriginalDate: '14.10.2025'
  },
  {
    id: 'olx-rok-102',
    title: 'Продам будинок 95 кв.м із земельною ділянкою 15 соток у смт Рокитне',
    priceUah: 720000,
    category: 'realty',
    subcategory: 'sub_houses',
    sellerName: 'Олена Петрівна (OLX Непосередник)',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(098) 765-43-21',
    settlement: 'смт Рокитне',
    location: 'смт Рокитне, вул. Залізнична',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з OLX Рокитне. Добротний дерев\'яний обкладений цеглою будинок, є газ, вода, літня кухня, погріб, гараж та господарські будівлі. Поруч школа та зупинка.',
    dateAdded: 'Архів OLX (02 листопада 2025)',
    viewsCount: 1420,
    favoritesCount: 115,
    isFavorite: true,
    isVerifiedSeller: true,
    condition: 'used',
    specs: {
      'Джерело': 'OLX Рокитне',
      'Площа': '95 м²',
      'Ділянка': '15 соток',
      'Комунікації': 'Газ, Електрика, Скважина'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-74109823',
    olxStatus: 'sold',
    olxOriginalDate: '02.11.2025'
  },
  {
    id: 'olx-rok-103',
    title: 'Мед натуральний поліський (липа, акація, соняшник) з власної пасіки с. Кисоричі',
    priceUah: 420,
    category: 'фермерство',
    subcategory: 'sub_honey',
    sellerName: 'Пасічник Тарас (OLX)',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(096) 888-22-11',
    settlement: 'село Кисоричі',
    location: 'с. Кисоричі, Рокитнівська ТГ',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з OLX. Свіжий качаний мед у 3-літрових бутлях. Повністю натуральний без домішок. Безкоштовна доставка до центру смт Рокитне по п\'ятницях.',
    dateAdded: 'Активне на OLX (18 січня 2026)',
    viewsCount: 560,
    favoritesCount: 64,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'craft',
    specs: {
      'Джерело': 'OLX Рокитне',
      'Фасовка': '3 літри',
      'Урожай': '2025/2026',
      'Пасіка': 'с. Кисоричі'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-90311284',
    olxStatus: 'active',
    olxOriginalDate: '18.01.2026'
  },
  {
    id: 'olx-rok-104',
    title: 'Трактор Т-25 з фрезою та плугом у хорошому робочому стані',
    priceUah: 165000,
    category: 'agro',
    subcategory: 'sub_tractors',
    sellerName: 'Микола Іванович (OLX)',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 500-11-22',
    settlement: 'селище Томашгород',
    location: 'смт Томашгород',
    imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з архіву OLX. Надійний домашній трактор Владимирець Т-25. Нова гума, проведено ТО. Документи в порядку.',
    dateAdded: 'Архів OLX (20 грудня 2025)',
    viewsCount: 1100,
    favoritesCount: 88,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'used',
    specs: {
      'Джерело': 'OLX Томашгород',
      'Марка': 'Т-25 Владимирець',
      'Комплект': 'Плуг 2-корпусний, почвофреза',
      'Документи': 'Українська реєстрація'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-65489012',
    olxStatus: 'archived',
    olxOriginalDate: '20.12.2025'
  },
  {
    id: 'olx-rok-105',
    title: 'Продам свіжозаморожену лісову чорницю та журавлину з боліт Рокитнівщини',
    priceUah: 140,
    category: 'фермерство',
    subcategory: 'sub_wild_berries',
    sellerName: 'Ганна Степанівна (OLX)',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(098) 112-33-44',
    settlement: 'село Сновидовичі',
    location: 'с. Сновидовичі',
    imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з OLX Рокитне. Екологічно чиста ягода, зібрана в лісах біля Сновидовичів та Остків. Ціна вказана за 1 кг. Фасовка в ящики по 5 та 10 кг.',
    dateAdded: 'Архів OLX (05 вересня 2025)',
    viewsCount: 780,
    favoritesCount: 54,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'craft',
    specs: {
      'Джерело': 'OLX Сновидовичі',
      'Ягода': 'Чорниця / Журавлина',
      'Фасовка': '5 кг / 10 кг'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-55129045',
    olxStatus: 'archived',
    olxOriginalDate: '05.09.2025'
  },
  {
    id: 'olx-rok-106',
    title: 'Послуги екскаватора-навантажувача JCB та манипулятора у смт Рокитне',
    priceUah: 950,
    category: 'services',
    subcategory: 'sub_cargo',
    sellerName: 'ФОП Бричка В.М. (OLX)',
    sellerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 990-00-11',
    settlement: 'смт Рокитне',
    location: 'смт Рокитне та увесь район',
    imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з OLX Послуги. Копання траншей, котлованів, планування ділянок, завантаження пиломатеріалів та будівельного сміття.',
    dateAdded: 'Активне на OLX (01 лютого 2026)',
    viewsCount: 1350,
    favoritesCount: 140,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'used',
    specs: {
      'Джерело': 'OLX Рокитне Послуги',
      'Оплата': 'За годину / зміну',
      'Техніка': 'JCB 3CX + Маніпулятор 10т'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-44091238',
    olxStatus: 'active',
    olxOriginalDate: '01.02.2026'
  },
  {
    id: 'olx-rok-107',
    title: 'Продам бензиновий генератор 3.5 кВт (новий у упаковці)',
    priceUah: 12500,
    category: 'electronics',
    subcategory: 'sub_power',
    sellerName: 'Дмитро (OLX Рокитне)',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(096) 333-44-55',
    settlement: 'смт Рокитне',
    location: 'смт Рокитне, центр',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'],
    description: 'Оголошення з OLX. Однофазний генератор 3.5 кВт із мідною обмоткою та AVR. Ідеально підходить для приватного будинку.',
    dateAdded: 'Активне на OLX (05 лютого 2026)',
    viewsCount: 490,
    favoritesCount: 38,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'new',
    specs: {
      'Джерело': 'OLX Електроніка',
      'Потужність': '3.5 кВт',
      'Паливо': 'Бензин A-95',
      'Стан': 'Новий'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-33290192',
    olxStatus: 'active',
    olxOriginalDate: '05.02.2026'
  },
  {
    id: 'olx-rok-108',
    title: 'Поросята домашні білої степової породи (6 тижнів) с. Залав\'я',
    priceUah: 2200,
    category: 'animals',
    subcategory: 'sub_livestock',
    sellerName: 'Павло Ковальчук (OLX)',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    sellerPhone: '(097) 777-88-99',
    settlement: 'село Залав\'я',
    location: 'с. Залав\'я, Рокитнівська ТГ',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80'],
    description: 'Продаж здорових поросят від власних свиноматок. Прощеплені за віком, їдять сухий та мокрий корм.',
    dateAdded: 'Активне на OLX (08 лютого 2026)',
    viewsCount: 620,
    favoritesCount: 49,
    isFavorite: false,
    isVerifiedSeller: true,
    condition: 'craft',
    specs: {
      'Джерело': 'OLX Тварини',
      'Порода': 'Велика біла',
      'Вік': '6 тижнів',
      'Щеплення': 'Проведені'
    },
    isOlxArchive: true,
    olxId: 'OLX-UA-22019283',
    olxStatus: 'active',
    olxOriginalDate: '08.02.2026'
  }
];
