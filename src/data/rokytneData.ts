export interface RokytneSettlement {
  id: string;
  name: string;
  type: 'селище' | 'село';
  districtId: string;
  districtName: string;
  population: number;
  postalCode: string;
  coordinates: { lat: number; lng: number };
}

export interface StarostynskyiDistrictOfficial {
  id: string;
  name: string;
  officialNumber?: string;
  centerVillage: string;
  settlements: string[];
  starostaName: string;
  starostaPhone: string;
  officeAddress: string;
  workingHours: string;
  populationTotal: number;
  openProblemsCount: number;
}

// Official 25 settlements of Rokytne Territorial Community
export const ROKYTNE_SETTLEMENTS: RokytneSettlement[] = [
  { id: 's-rokytne-town', name: 'селище Рокитне', type: 'селище', districtId: 'dist-rokytne', districtName: 'Рокитнівський', population: 6700, postalCode: '34200', coordinates: { lat: 51.2825, lng: 27.2091 } },
  { id: 's-rokytne-village', name: 'село Рокитне', type: 'село', districtId: 'dist-rokytne', districtName: 'Рокитнівський', population: 1540, postalCode: '34201', coordinates: { lat: 51.2710, lng: 27.2250 } },
  { id: 's-tomashhorod-town', name: 'селище Томашгород', type: 'селище', districtId: 'dist-tomashhorod-1', districtName: 'Томашгородський №1', population: 2450, postalCode: '34240', coordinates: { lat: 51.3210, lng: 27.0650 } },
  { id: 's-tomashhorod-village', name: 'село Томашгород', type: 'село', districtId: 'dist-tomashhorod-2', districtName: 'Томашгородський №2', population: 1580, postalCode: '34241', coordinates: { lat: 51.3100, lng: 27.0800 } },
  { id: 's-yelne', name: 'село Єльне', type: 'село', districtId: 'dist-tomashhorod-2', districtName: 'Томашгородський №2', population: 780, postalCode: '34242', coordinates: { lat: 51.3500, lng: 27.0100 } },
  { id: 's-blazhove', name: 'село Блажове', type: 'село', districtId: 'dist-blazhove', districtName: 'Блажівський', population: 1420, postalCode: '34220', coordinates: { lat: 51.3850, lng: 27.2500 } },
  { id: 's-bilsk', name: 'село Більськ', type: 'село', districtId: 'dist-blazhove', districtName: 'Блажівський', population: 610, postalCode: '34221', coordinates: { lat: 51.4100, lng: 27.2900 } },
  { id: 's-zalavia', name: 'село Залав\'я', type: 'село', districtId: 'dist-blazhove', districtName: 'Блажівський', population: 890, postalCode: '34222', coordinates: { lat: 51.3600, lng: 27.2300 } },
  { id: 's-borove', name: 'село Борове', type: 'село', districtId: 'dist-borove', districtName: 'Борівський', population: 1820, postalCode: '34225', coordinates: { lat: 51.2200, lng: 27.3500 } },
  { id: 's-netreba', name: 'село Нетреба', type: 'село', districtId: 'dist-borove', districtName: 'Борівський', population: 580, postalCode: '34226', coordinates: { lat: 51.2000, lng: 27.3800 } },
  { id: 's-buda', name: 'село Буда', type: 'село', districtId: 'dist-masevychi', districtName: 'Масевицький', population: 490, postalCode: '34231', coordinates: { lat: 51.2300, lng: 27.1500 } },
  { id: 's-budky-snovydovytski', name: 'село Будки-Сновидовицькі', type: 'село', districtId: 'dist-snovydovychi', districtName: 'Сновидовицький', population: 310, postalCode: '34251', coordinates: { lat: 51.3100, lng: 27.3800 } },
  { id: 's-bilovizh', name: 'село Біловіж', type: 'село', districtId: 'dist-bilovizh', districtName: 'Біловізький', population: 1020, postalCode: '34210', coordinates: { lat: 51.4300, lng: 27.4200 } },
  { id: 's-dert', name: 'село Дерть', type: 'село', districtId: 'dist-kysorychi', districtName: 'Кисорицький', population: 740, postalCode: '34261', coordinates: { lat: 51.1800, lng: 27.2800 } },
  { id: 's-karpylivka', name: 'село Карпилівка', type: 'село', districtId: 'dist-karpylivka', districtName: 'Карпилівський', population: 2680, postalCode: '34230', coordinates: { lat: 51.1500, lng: 27.1200 } },
  { id: 's-kysorychi', name: 'село Кисоричі', type: 'село', districtId: 'dist-kysorychi', districtName: 'Кисорицький', population: 2490, postalCode: '34260', coordinates: { lat: 51.1950, lng: 27.2600 } },
  { id: 's-kupel', name: 'село Купель', type: 'село', districtId: 'dist-bilovizh', districtName: 'Біловізький', population: 420, postalCode: '34211', coordinates: { lat: 51.4500, lng: 27.4500 } },
  { id: 's-lisove', name: 'село Лісове', type: 'село', districtId: 'dist-rokytne', districtName: 'Рокитнівський', population: 380, postalCode: '34202', coordinates: { lat: 51.2900, lng: 27.1800 } },
  { id: 's-masevychi', name: 'село Масевичі', type: 'село', districtId: 'dist-masevychi', districtName: 'Масевицький', population: 2490, postalCode: '34232', coordinates: { lat: 51.2450, lng: 27.1400 } },
  { id: 's-mushni', name: 'село Мушні', type: 'село', districtId: 'dist-bilovizh', districtName: 'Біловізький', population: 310, postalCode: '34212', coordinates: { lat: 51.4600, lng: 27.4800 } },
  { id: 's-oleksandrivka', name: 'село Олександрівка', type: 'село', districtId: 'dist-kysorychi', districtName: 'Кисорицький', population: 480, postalCode: '34262', coordinates: { lat: 51.1700, lng: 27.3000 } },
  { id: 's-osnytsk', name: 'село Осницьк', type: 'село', districtId: 'dist-rokytne', districtName: 'Рокитнівський', population: 640, postalCode: '34203', coordinates: { lat: 51.2600, lng: 27.2500 } },
  { id: 's-ostky', name: 'село Остки', type: 'село', districtId: 'dist-snovydovychi', districtName: 'Сновидовицький', population: 1180, postalCode: '34252', coordinates: { lat: 51.2900, lng: 27.4200 } },
  { id: 's-snovydovychi', name: 'село Сновидовичі', type: 'село', districtId: 'dist-snovydovychi', districtName: 'Сновидовицький', population: 1840, postalCode: '34250', coordinates: { lat: 51.3250, lng: 27.3600 } },
  { id: 's-staryky', name: 'село Старики', type: 'село', districtId: 'dist-rokytne', districtName: 'Рокитнівський', population: 310, postalCode: '34204', coordinates: { lat: 51.3000, lng: 27.2300 } }
];

// Official 10 Starostynskyi Districts according to Resolution #1370
export const OFFICIAL_STAROSTYNSKYI_DISTRICTS: StarostynskyiDistrictOfficial[] = [
  {
    id: 'dist-bilovizh',
    name: 'Біловізький старостинський округ',
    centerVillage: 'с. Біловіж',
    settlements: ['с. Біловіж', 'с. Купель', 'с. Мушні'],
    starostaName: 'Кравченя Володимир Миколайович',
    starostaPhone: '+380 (97) 112-23-34',
    officeAddress: 'вул. Незалежності, 18, с. Біловіж',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 1750,
    openProblemsCount: 2
  },
  {
    id: 'dist-blazhove',
    name: 'Блажівський старостинський округ',
    centerVillage: 'с. Блажове',
    settlements: ['с. Блажове', 'с. Більськ', 'с. Залав\'я'],
    starostaName: 'Трофимчук Петро Миколайович',
    starostaPhone: '+380 (97) 345-21-01',
    officeAddress: 'вул. Центральна, 45, с. Блажове',
    workingHours: 'Пн-Пт: 08:00 - 17:00 (Прийом: Вт, Чт)',
    populationTotal: 2920,
    openProblemsCount: 3
  },
  {
    id: 'dist-borove',
    name: 'Борівський старостинський округ',
    centerVillage: 'с. Борове',
    settlements: ['с. Борове', 'с. Нетреба'],
    starostaName: 'Павлушенко Михайло Іванович',
    starostaPhone: '+380 (98) 554-32-11',
    officeAddress: 'вул. Шевченка, 12, с. Борове',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 2400,
    openProblemsCount: 1
  },
  {
    id: 'dist-karpylivka',
    name: 'Карпилівський старостинський округ',
    centerVillage: 'с. Карпилівка',
    settlements: ['с. Карпилівка'],
    starostaName: 'Бричка Олександр Сергійович',
    starostaPhone: '+380 (96) 778-90-12',
    officeAddress: 'вул. Шкільна, 1, с. Карпилівка',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 2680,
    openProblemsCount: 4
  },
  {
    id: 'dist-kysorychi',
    name: 'Кисорицький старостинський округ',
    centerVillage: 'с. Кисоричі',
    settlements: ['с. Кисоричі', 'с. Дерть', 'с. Олександрівка'],
    starostaName: 'Ковальчук Олена Іванівна',
    starostaPhone: '+380 (96) 112-33-44',
    officeAddress: 'вул. Лесі Українки, 10, с. Кисоричі',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 3710,
    openProblemsCount: 3
  },
  {
    id: 'dist-masevychi',
    name: 'Масевицький старостинський округ',
    centerVillage: 'с. Масевичі',
    settlements: ['с. Масевичі', 'с. Буда'],
    starostaName: 'Смик Анатолій Васильович',
    starostaPhone: '+380 (97) 889-00-11',
    officeAddress: 'вул. Лесі Українки, 4, с. Масевичі',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 2980,
    openProblemsCount: 2
  },
  {
    id: 'dist-rokytne',
    name: 'Рокитнівський старостинський округ',
    centerVillage: 'с. Рокитне',
    settlements: ['с. Рокитне', 'с. Лісове', 'с. Осницьк', 'с. Старики'],
    starostaName: 'Охрімчук Ігор Анатолійович',
    starostaPhone: '+380 (97) 223-44-55',
    officeAddress: 'вул. Гагаріна, 5, с. Рокитне',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 2870,
    openProblemsCount: 3
  },
  {
    id: 'dist-snovydovychi',
    name: 'Сновидовицький старостинський округ',
    centerVillage: 'с. Сновидовичі',
    settlements: ['с. Сновидовичі', 'с. Будки-Сновидовицькі', 'с. Остки'],
    starostaName: 'Боровець Сергій Васильович',
    starostaPhone: '+380 (98) 234-56-78',
    officeAddress: 'вул. Шкільна, 2, с. Сновидовичі',
    workingHours: 'Пн-Пт: 08:30 - 16:30',
    populationTotal: 3330,
    openProblemsCount: 2
  },
  {
    id: 'dist-tomashhorod-1',
    name: 'Томашгородський старостинський округ №1',
    centerVillage: 'смт Томашгород',
    settlements: ['селище Томашгород'],
    starostaName: 'Ковальова Ганна Володимирівна',
    starostaPhone: '+380 (97) 890-12-34',
    officeAddress: 'вул. Залізнична, 12, смт Томашгород',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 2450,
    openProblemsCount: 3
  },
  {
    id: 'dist-tomashhorod-2',
    name: 'Томашгородський старостинський округ №2',
    centerVillage: 'с. Томашгород',
    settlements: ['село Томашгород', 'село Єльне'],
    starostaName: 'Кушнір Юрій Миколайович',
    starostaPhone: '+380 (97) 654-32-10',
    officeAddress: 'вул. Центральна, 1, с. Томашгород',
    workingHours: 'Пн-Пт: 08:00 - 17:00',
    populationTotal: 2360,
    openProblemsCount: 2
  }
];
