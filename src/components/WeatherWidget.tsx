import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ChevronDown,
  X,
  Compass,
  Trees,
  Waves,
  Eye,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SettlementWeather {
  name: string;
  temp: number;
  feelsLike: number;
  condition: string;
  iconType: 'sun' | 'cloud-sun' | 'rain';
  humidity: number;
  wind: string;
  pressure: number;
  uvIndex: number;
  waterTemp: number;
  airQuality: string;
  forecast: {
    day: string;
    tempDay: number;
    tempNight: number;
    condition: string;
    iconType: 'sun' | 'cloud-sun' | 'rain';
  }[];
  hourly: {
    time: string;
    temp: number;
    iconType: 'sun' | 'cloud-sun' | 'rain';
    pop: number; // probability of precipitation %
  }[];
}

const SETTLEMENTS_DATA: Record<string, SettlementWeather> = {
  'Рокитне': {
    name: 'смт Рокитне',
    temp: 23,
    feelsLike: 24,
    condition: 'Сонячно з легкими хмарами',
    iconType: 'cloud-sun',
    humidity: 58,
    wind: '3.4 м/с (Пн-Зх)',
    pressure: 752,
    uvIndex: 5,
    waterTemp: 21,
    airQuality: 'Відмінне (AQI 22)',
    hourly: [
      { time: '09:00', temp: 19, iconType: 'sun', pop: 0 },
      { time: '12:00', temp: 23, iconType: 'cloud-sun', pop: 10 },
      { time: '15:00', temp: 25, iconType: 'cloud-sun', pop: 15 },
      { time: '18:00', temp: 22, iconType: 'sun', pop: 5 },
      { time: '21:00', temp: 17, iconType: 'sun', pop: 0 },
    ],
    forecast: [
      { day: 'Сьогодні', tempDay: 25, tempNight: 14, condition: 'Малохмарно, сонячно', iconType: 'cloud-sun' },
      { day: 'Завтра', tempDay: 26, tempNight: 15, condition: 'Ясно, приємний бриз', iconType: 'sun' },
      { day: 'Післязавтра', tempDay: 22, tempNight: 13, condition: 'Короткочасний теплий дощ', iconType: 'rain' },
    ]
  },
  'Томашгород': {
    name: 'с-ще Томашгород',
    temp: 22,
    feelsLike: 22,
    condition: 'Ясно, свіже соснове повітря',
    iconType: 'sun',
    humidity: 62,
    wind: '2.8 м/с (Західний)',
    pressure: 753,
    uvIndex: 6,
    waterTemp: 20,
    airQuality: 'Ідеальне (AQI 18)',
    hourly: [
      { time: '09:00', temp: 18, iconType: 'sun', pop: 0 },
      { time: '12:00', temp: 22, iconType: 'sun', pop: 0 },
      { time: '15:00', temp: 24, iconType: 'sun', pop: 5 },
      { time: '18:00', temp: 21, iconType: 'sun', pop: 0 },
      { time: '21:00', temp: 16, iconType: 'sun', pop: 0 },
    ],
    forecast: [
      { day: 'Сьогодні', tempDay: 24, tempNight: 13, condition: 'Сонячно', iconType: 'sun' },
      { day: 'Завтра', tempDay: 25, tempNight: 14, condition: 'Ясно', iconType: 'sun' },
      { day: 'Післязавтра', tempDay: 23, tempNight: 12, condition: 'Мінлива хмарність', iconType: 'cloud-sun' },
    ]
  },
  'Кисоричі': {
    name: 'с. Кисоричі',
    temp: 23,
    feelsLike: 23,
    condition: 'Тепло, малохмарно',
    iconType: 'cloud-sun',
    humidity: 60,
    wind: '3.1 м/с (Північний)',
    pressure: 752,
    uvIndex: 5,
    waterTemp: 21,
    airQuality: 'Чисте (AQI 24)',
    hourly: [
      { time: '09:00', temp: 19, iconType: 'cloud-sun', pop: 0 },
      { time: '12:00', temp: 23, iconType: 'cloud-sun', pop: 10 },
      { time: '15:00', temp: 25, iconType: 'cloud-sun', pop: 10 },
      { time: '18:00', temp: 22, iconType: 'sun', pop: 0 },
      { time: '21:00', temp: 16, iconType: 'sun', pop: 0 },
    ],
    forecast: [
      { day: 'Сьогодні', tempDay: 25, tempNight: 14, condition: 'Малохмарно', iconType: 'cloud-sun' },
      { day: 'Завтра', tempDay: 26, tempNight: 15, condition: 'Сонячно', iconType: 'sun' },
      { day: 'Післязавтра', tempDay: 21, tempNight: 13, condition: 'Невеликий дощик', iconType: 'rain' },
    ]
  },
  'Біловіж': {
    name: 'с. Біловіж (Заповідні ліси)',
    temp: 21,
    feelsLike: 21,
    condition: 'Мінлива хмарність, тінь гаїв',
    iconType: 'cloud-sun',
    humidity: 68,
    wind: '2.5 м/с (Пн-Сх)',
    pressure: 754,
    uvIndex: 4,
    waterTemp: 19,
    airQuality: 'Курортна якість (AQI 15)',
    hourly: [
      { time: '09:00', temp: 17, iconType: 'cloud-sun', pop: 5 },
      { time: '12:00', temp: 21, iconType: 'cloud-sun', pop: 10 },
      { time: '15:00', temp: 23, iconType: 'cloud-sun', pop: 20 },
      { time: '18:00', temp: 20, iconType: 'sun', pop: 5 },
      { time: '21:00', temp: 15, iconType: 'sun', pop: 0 },
    ],
    forecast: [
      { day: 'Сьогодні', tempDay: 23, tempNight: 12, condition: 'Мінлива хмарність', iconType: 'cloud-sun' },
      { day: 'Завтра', tempDay: 24, tempNight: 13, condition: 'Тепло, біля лісових озер', iconType: 'sun' },
      { day: 'Післязавтра', tempDay: 20, tempNight: 11, condition: 'Хмарно, дощ', iconType: 'rain' },
    ]
  }
};

export const WeatherWidget: React.FC = () => {
  const [selectedSettlement, setSelectedSettlement] = useState<string>('Рокитне');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const currentWeather = SETTLEMENTS_DATA[selectedSettlement] || SETTLEMENTS_DATA['Рокитне'];

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const renderWeatherIcon = (type: 'sun' | 'cloud-sun' | 'rain', className = 'w-4 h-4') => {
    switch (type) {
      case 'sun':
        return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
      case 'rain':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'cloud-sun':
      default:
        return <CloudSun className={`${className} text-amber-300`} />;
    }
  };

  return (
    <>
      {/* Top Header Quick Weather Pill Widget */}
      <div className="relative inline-flex items-center">
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 px-3 py-1 rounded-xl text-xs cursor-pointer transition-all shadow-md group select-none"
          title="Натисніть для детального прогнозу погоди та екологічного моніторингу Рокитного"
        >
          {/* Animated Weather Icon */}
          <div className="p-1 rounded-lg bg-cyan-950/60 border border-cyan-500/20 group-hover:scale-110 transition-transform">
            {renderWeatherIcon(currentWeather.iconType, 'w-4 h-4')}
          </div>

          {/* Temperature & Settlement */}
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-cyan-300 text-sm tracking-tight">
              +{currentWeather.temp}°C
            </span>

            <div className="hidden md:flex flex-col text-left text-[11px] leading-tight">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                {currentWeather.name.split(' ')[1] || currentWeather.name}
                <ChevronDown className="w-3 h-3 text-cyan-400 opacity-70 group-hover:opacity-100" />
              </span>
              <span className="text-slate-400 text-[10px] truncate max-w-[120px]">
                {currentWeather.condition}
              </span>
            </div>
          </div>

          {/* Quick Humidity & Water badge on large desktop */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-sky-300" title="Відносна вологість">
              <Droplets className="w-3 h-3 text-sky-400" /> {currentWeather.humidity}%
            </span>
            <span className="flex items-center gap-1 text-emerald-300" title="Температура води у водоймах">
              <Waves className="w-3 h-3 text-emerald-400" /> +{currentWeather.waterTemp}°C
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Weather & Microclimate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden text-slate-100">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30">
                  {renderWeatherIcon(currentWeather.iconType, 'w-6 h-6')}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      Погода та Екомоніторинг
                    </h3>
                    <button
                      onClick={handleRefresh}
                      className={`p-1 rounded-lg text-slate-400 hover:text-cyan-300 transition-all ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
                      title="Оновити дані"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Settlement Dropdown Selector */}
                  <div className="relative mt-0.5">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-cyan-500/30"
                    >
                      <span>{currentWeather.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-56 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          Оберіть населений пункт
                        </div>
                        {Object.keys(SETTLEMENTS_DATA).map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedSettlement(key);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                              selectedSettlement === key
                                ? 'bg-cyan-900/50 text-cyan-200'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{SETTLEMENTS_DATA[key].name}</span>
                            <span className="font-bold text-cyan-400">+{SETTLEMENTS_DATA[key].temp}°C</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Current Weather Highlights */}
            <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Temp Big Card */}
              <div className="bg-gradient-to-br from-slate-950/80 to-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                    <span>+{currentWeather.temp}°C</span>
                    <span className="text-xs font-normal text-slate-400">
                      відчувається як +{currentWeather.feelsLike}°C
                    </span>
                  </div>
                  <div className="text-xs font-medium text-cyan-300 mt-1">
                    {currentWeather.condition}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Повітря: {currentWeather.airQuality}</span>
                  </div>
                </div>

                <div className="p-3 rounded-full bg-cyan-950/40 border border-cyan-500/30">
                  {renderWeatherIcon(currentWeather.iconType, 'w-10 h-10')}
                </div>
              </div>

              {/* Environmental Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-center">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" /> Вологість
                  </span>
                  <span className="font-bold text-slate-200 mt-0.5 text-sm">{currentWeather.humidity}%</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-center">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" /> Вітер
                  </span>
                  <span className="font-bold text-slate-200 mt-0.5 text-sm">{currentWeather.wind}</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-center">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Waves className="w-3.5 h-3.5 text-emerald-400" /> Водойми
                  </span>
                  <span className="font-bold text-emerald-300 mt-0.5 text-sm">+{currentWeather.waterTemp}°C</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-center">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Тиск / UV
                  </span>
                  <span className="font-bold text-slate-200 mt-0.5 text-sm">{currentWeather.pressure} мм / UV {currentWeather.uvIndex}</span>
                </div>
              </div>
            </div>

            {/* Hourly Forecast Row */}
            <div className="mb-5 relative z-10">
              <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Погодинно на сьогодні
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {currentWeather.hourly.map((h, i) => (
                  <div key={i} className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">{h.time}</span>
                    <div className="my-1 flex justify-center">
                      {renderWeatherIcon(h.iconType, 'w-4 h-4')}
                    </div>
                    <span className="text-xs font-bold text-white block">+{h.temp}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Day Forecast */}
            <div className="space-y-2 relative z-10">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Прогноз на 3 дні
              </h4>
              <div className="space-y-1.5">
                {currentWeather.forecast.map((f, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 w-1/3">
                      {renderWeatherIcon(f.iconType, 'w-4 h-4')}
                      <span className="font-semibold text-slate-200">{f.day}</span>
                    </div>

                    <span className="text-slate-400 text-center text-[11px] flex-1 truncate px-2">
                      {f.condition}
                    </span>

                    <div className="font-bold text-right w-1/4">
                      <span className="text-cyan-300">+{f.tempDay}°</span>
                      <span className="text-slate-500 font-normal ml-1.5">+{f.tempNight}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ecological Tourism Tip Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/20 relative z-10">
              <Trees className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Еко-поліс Рокитно:</strong> сприятлива погода для відпочинку на лісових озерах громади та піших прогулянок сосновим бором.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
