export interface BudgetExpenseCategory {
  id: string;
  name: string;
  amountMln: number; // in Million UAH
  percent: number;
  color: string;
  description: string;
  subItems: { title: string; amountThousandUah: number; status: 'виконано' | 'у процесі' | 'заплановано' }[];
}

export interface BudgetRevenueSource {
  source: string;
  plan2025: number;
  fact2025: number;
  plan2026: number;
}

export interface MonthlyBudgetTrend {
  month: string;
  revenue: number; // Million UAH
  expenses: number;
  surplus: number;
}

export interface DistrictBudgetDistribution {
  district: string;
  education: number; // Mln UAH
  infrastructure: number;
  social: number;
  culture: number;
}

export const BUDGET_EXPENSES_DATA: BudgetExpenseCategory[] = [
  {
    id: 'exp-edu',
    name: 'Освіта & Дошкілля',
    amountMln: 162.4,
    percent: 48.2,
    color: '#06b6d4', // cyan-500
    description: 'Фінансування 18 ліцеїв, гімназій, дитячих садків та позашкільних закладах Рокитнівщини',
    subItems: [
      { title: 'Заробітна плата вчителів та вихователів', amountThousandUah: 118200, status: 'виконано' },
      { title: 'Капітальний ремонт укриття Рокитнівського ліцею №1', amountThousandUah: 8500, status: 'у процесі' },
      { title: 'Закупівля 2 нових шкільних автобусів (єПідтримка)', amountThousandUah: 6800, status: 'виконано' },
      { title: 'Харчування дітей пільгових категорій та ВПО', amountThousandUah: 12400, status: 'виконано' },
      { title: 'Модернізація харчоблоків у садочках', amountThousandUah: 16500, status: 'заплановано' }
    ]
  },
  {
    id: 'exp-health-social',
    name: 'Охорона здоров\'я & Соцзахист',
    amountMln: 52.8,
    percent: 15.6,
    color: '#10b981', // emerald-500
    description: 'Підтримка Рокитнівської багатопрофільної лікарні, первинної медико-санітарної допомоги та пільг',
    subItems: [
      { title: 'Закупівля обладнання для реабілітаційного відділення ЦРЛ', amountThousandUah: 14200, status: 'у процесі' },
      { title: 'Адресна допомога військовослужбовцям та ветеранам', amountThousandUah: 18500, status: 'виконано' },
      { title: 'Забезпечення медикаментами за програмою "Доступні ліки"', amountThousandUah: 9600, status: 'виконано' },
      { title: 'Функціонування Центру надання соціальних послуг', amountThousandUah: 10500, status: 'виконано' }
    ]
  },
  {
    id: 'exp-infrastructure',
    name: 'ЖКГ, Дороги & Благоустрій',
    amountMln: 47.5,
    percent: 14.1,
    color: '#f59e0b', // amber-500
    description: 'Утримання комунальних автодоріг, вуличне освітлення, благоустрій та водопостачання',
    subItems: [
      { title: 'Поточний та ямковий ремонт доріг смт Рокитне та сіл', amountThousandUah: 19800, status: 'у процесі' },
      { title: 'Енергоефективне вуличне LED-освітлення у старостатах', amountThousandUah: 8400, status: 'виконано' },
      { title: 'Реконструкція водопроводів смт Томашгород', amountThousandUah: 11200, status: 'заплановано' },
      { title: 'Благоустрій паркових зон та вивіз побутових відходів', amountThousandUah: 8100, status: 'виконано' }
    ]
  },
  {
    id: 'exp-admin',
    name: 'Державне управління & ЦНАП',
    amountMln: 32.1,
    percent: 9.5,
    color: '#8b5cf6', // purple-500
    description: 'Забезпечення діяльності селищної ради, старостатів, цифрової трансформації та ЦНАП',
    subItems: [
      { title: 'Оплата праці працівників апарату та старостатів', amountThousandUah: 23500, status: 'виконано' },
      { title: 'Цифровізація ЦНАП, сервери та захист персональних даних', amountThousandUah: 3800, status: 'виконано' },
      { title: 'Утримання адмінбудівель у 14 старостатах', amountThousandUah: 4800, status: 'виконано' }
    ]
  },
  {
    id: 'exp-culture-sport',
    name: 'Культура, Молодь & Спорт',
    amountMln: 22.6,
    percent: 6.7,
    color: '#ec4899', // pink-500
    description: 'Будинки культури, публічні бібліотеки, дитяча музична школа та футбольний клуб "Полісся"',
    subItems: [
      { title: 'Утримання Публічної бібліотеки та філій у селах', amountThousandUah: 7200, status: 'виконано' },
      { title: 'Ремонт Будинку культури с. Кисоричі', amountThousandUah: 5400, status: 'у процесі' },
      { title: 'Підтримка дитячо-юнацьких спортивних секцій', amountThousandUah: 6100, status: 'виконано' },
      { title: 'Проведення патріотичних та культурно-мистецьких заходів', amountThousandUah: 3900, status: 'виконано' }
    ]
  },
  {
    id: 'exp-defense-safety',
    name: 'Безпека, Оборона & Резерв',
    amountMln: 19.8,
    percent: 5.9,
    color: '#ef4444', // red-500
    description: 'Субвенції силам оборони, добровольчим формуванням, цивільний захист та резервний фонд',
    subItems: [
      { title: 'Субвенція військовим частинам ЗСУ та ТрО Рокитнівщини', amountThousandUah: 12500, status: 'виконано' },
      { title: 'Поповнення Резервного фонду громади для НС', amountThousandUah: 4500, status: 'виконано' },
      { title: 'Засоби сповіщення та системи цивільного захисту', amountThousandUah: 2800, status: 'виконано' }
    ]
  }
];

export const BUDGET_REVENUE_SOURCES: BudgetRevenueSource[] = [
  { source: 'ПДФО (Податок з доходів)', plan2025: 185.0, fact2025: 192.4, plan2026: 210.0 },
  { source: 'Єдиний податок (ФОП/Агро)', plan2025: 42.0, fact2025: 45.8, plan2026: 52.0 },
  { source: 'Плата за землю & Лісовий збір', plan2025: 38.5, fact2025: 41.2, plan2026: 46.5 },
  { source: 'Акцизний податок (паливо/пальце)', plan2025: 22.0, fact2025: 24.1, plan2026: 26.0 },
  { source: 'Субвенції з держбюджету', plan2025: 55.0, fact2025: 55.0, plan2026: 58.0 },
  { source: 'Адмінпослуги ЦНАП & Майно', plan2025: 12.0, fact2025: 13.8, plan2026: 15.5 }
];

export const MONTHLY_BUDGET_TRENDS: MonthlyBudgetTrend[] = [
  { month: 'Січ', revenue: 26.4, expenses: 22.1, surplus: 4.3 },
  { month: 'Лют', revenue: 27.8, expenses: 24.5, surplus: 3.3 },
  { month: 'Бер', revenue: 31.2, expenses: 28.0, surplus: 3.2 },
  { month: 'Квіт', revenue: 29.5, expenses: 27.2, surplus: 2.3 },
  { month: 'Трав', revenue: 32.0, expenses: 29.8, surplus: 2.2 },
  { month: 'Черв', revenue: 35.8, expenses: 31.0, surplus: 4.8 },
  { month: 'Лип', revenue: 33.4, expenses: 30.5, surplus: 2.9 },
  { month: 'Серп', revenue: 34.1, expenses: 31.2, surplus: 2.9 },
  { month: 'Верес', revenue: 31.9, expenses: 29.4, surplus: 2.5 },
  { month: 'Жовт', revenue: 30.8, expenses: 28.9, surplus: 1.9 },
  { month: 'Листоп', revenue: 29.1, expenses: 27.8, surplus: 1.3 },
  { month: 'Груд', revenue: 38.5, expenses: 36.4, surplus: 2.1 }
];

export const DISTRICT_BUDGET_DISTRIBUTION: DistrictBudgetDistribution[] = [
  { district: 'смт Рокитне', education: 64.2, infrastructure: 21.5, social: 22.8, culture: 9.4 },
  { district: 'с. Кисоричі', education: 22.4, infrastructure: 6.8, social: 7.1, culture: 3.2 },
  { district: 'смт Томашгород', education: 28.1, infrastructure: 8.9, social: 8.2, culture: 3.8 },
  { district: 'с. Сновидовичі', education: 18.2, infrastructure: 4.2, social: 5.0, culture: 2.1 },
  { district: 'с. Блажове', education: 14.5, infrastructure: 3.1, social: 4.2, culture: 1.8 },
  { district: 'с. Вежиця', education: 15.0, infrastructure: 3.0, social: 5.5, culture: 2.3 }
];
