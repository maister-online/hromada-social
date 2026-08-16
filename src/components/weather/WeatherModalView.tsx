import React, { useState } from 'react';
import { INITIAL_WEATHER_DATA } from '../../data/mockData';
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Gauge,
  Compass,
  Globe,
  Layers,
  Sparkles,
  MapPin,
  Eye
} from 'lucide-react';

export const WeatherModalView: React.FC = () => {
  const weather = INITIAL_WEATHER_DATA;
  const [activeTab, setActiveTab] = useState<'weather' | 'satellite'>('weather');
  const [mapLayer, setMapLayer] = useState<'clouds' | 'precip' | 'temp'>('clouds');

  return (
    <div className="space-y-4 text-slate-100">
      {/* Top Layer Switcher */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'weather'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Погода & Клімат</span>
          </button>
          <button
            onClick={() => setActiveTab('satellite')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'satellite'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Супутниковий Моніторинг</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono pr-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{weather.city}</span>
        </div>
      </div>

      {activeTab === 'weather' ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Main Temp Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-950 border border-cyan-500/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="text-xs uppercase font-mono tracking-wider text-cyan-400">
                Поточні метеодані Рокитного
              </div>
              <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                <span>+{weather.temp}°C</span>
                <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />
              </div>
              <p className="text-xs text-slate-300 font-medium">{weather.condition}</p>
              <div className="text-[11px] text-slate-400 font-mono">
                Відчувається як: +{weather.feelsLike}°C • Індекс УФ: {weather.uvIndex}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Вологість</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">{weather.humidity}%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Wind className="w-3.5 h-3.5 text-teal-400" />
                  <span>Вітер</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">{weather.windSpeedMs} м/с</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Gauge className="w-3.5 h-3.5 text-purple-400" />
                  <span>Тиск</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">{weather.pressureMmHg} мм</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Якість повітря</span>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">Відмінно</div>
              </div>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Погодинний прогноз
            </div>
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-1">
              {weather.hourlyForecast.map((hf, i) => (
                <div
                  key={i}
                  className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1 shrink-0 w-20"
                >
                  <div className="text-[10px] text-slate-400 font-mono">{hf.time}</div>
                  <div className="text-sm font-bold text-cyan-300 font-mono">+{hf.temp}°</div>
                  <div className="text-[9px] text-slate-400 truncate">{hf.condition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-day Forecast */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-2">
              Прогноз на тиждень
            </div>
            {weather.dailyForecast.map((df, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
              >
                <span className="font-bold text-slate-200 w-24">{df.day}</span>
                <span className="text-slate-400 text-[11px] flex-1 truncate">{df.condition}</span>
                <span className="font-mono text-cyan-300 font-bold">
                  +{df.high}° / <span className="text-slate-500">+{df.low}°</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Satellite Data View */
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-purple-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Шари супутникового знімку</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMapLayer('clouds')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  mapLayer === 'clouds' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Хмарність
              </button>
              <button
                onClick={() => setMapLayer('precip')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  mapLayer === 'precip' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Опади
              </button>
              <button
                onClick={() => setMapLayer('temp')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  mapLayer === 'temp' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400'
                }`}
              >
                Температура
              </button>
            </div>
          </div>

          {/* Interactive Satellite Canvas Simulator */}
          <div className="relative h-72 rounded-2xl border border-purple-500/30 overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Background Satellite Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-950/40 to-slate-950 opacity-90" />
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

            {/* Orbit sweep line animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-star-pulse" />

            <div className="relative z-10 text-center space-y-2 p-4">
              <Globe className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <div className="text-sm font-black text-white font-mono">
                ОРБІТАЛЬНИЙ МОНІТОРИНГ • САРНЕНСЬКИЙ / РОКИТНІВСЬКИЙ РАЙОН
              </div>
              <div className="text-xs text-slate-300 font-mono">
                Координати: 51.2825° N, 27.2091° E • Супутник Sentinel-2 / Landsat
              </div>
              <div className="text-[10px] text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40 inline-block font-mono">
                СТАТУС: АКТИВНЕ СУПУТНИКОВЕ СКАНУВАННЯ
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
