import React, { useState } from 'react';
import { INITIAL_SOCIAL_REQUESTS } from '../../data/mockData';
import { SocialRequest } from '../../types';
import { useUser } from '../../context/UserContext';
import { useWindowContext } from '../../context/WindowContext';
import {
  FileText,
  Plus,
  Building2,
  Clock,
  CheckCircle2,
  Paperclip,
  Send,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Download
} from 'lucide-react';

export const SocialInquiriesTab: React.FC = () => {
  const [appeals, setAppeals] = useState<SocialRequest[]>(INITIAL_SOCIAL_REQUESTS);
  const { user, addNotification } = useUser();
  const { openWindow } = useWindowContext();

  const [department, setDepartment] = useState('Селищний голова');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'critical'>('normal');

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !text.trim()) return;

    const newAppeal: SocialRequest = {
      id: `app-${Date.now()}`,
      trackingCode: `№393-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Офіційне звернення громадян',
      department,
      subject,
      description: text,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('uk-UA'),
      applicantName: user.name,
      applicantPhone: user.phone,
      responseDueDate: 'Через 15 днів (згідно ЗУ №393/96-ВР)'
    };

    setAppeals(prev => [newAppeal, ...prev]);
    setSubject('');
    setText('');

    addNotification({
      category: 'cnap',
      title: 'Звернення зареєстровано',
      description: `Ваше офіційне звернення ${newAppeal.trackingCode} прийнято канцелярією.`,
      timestamp: 'Щойно'
    });

    alert(`Офіційне звернення успішно подано! Присвоєно реєстраційний номер: ${newAppeal.trackingCode}`);
  };

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-cyan-950/80 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Офіційний електронний документообіг</span>
          </div>
          <h2 className="text-xl font-black text-white">Електронні Звернення Громадян</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Подавайте офіційні звернення, скарги та пропозиції відповідно до ЗУ "Про звернення громадян". Кожне звернення реєструється з унікальним кодом.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Appeal Creation Form */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-xl">
          <div className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Подати нове офіційне звернення</span>
          </div>

          <form onSubmit={handleSubmitAppeal} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Отримувач / Відділ *</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-sky-500 font-medium"
              >
                <option value="Селищний голова">Селищний голова Рокитного</option>
                <option value="Відділ ЖКГ та благоустрою">Відділ ЖКГ, транспорту та благоустрою</option>
                <option value="Землевпорядний сектор">Землевпорядний та кадастровий сектор</option>
                <option value="Центр надання соцпослуг">Відділ соціального захисту населення</option>
                <option value="Відділ архітектури">Відділ містобудування та архітектури</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Тема звернення *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Короткий зміст вашого запиту чи скарги..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Пріоритет обробки</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`py-1.5 rounded-xl text-[11px] font-bold border ${
                    priority === 'normal' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Звичайний
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`py-1.5 rounded-xl text-[11px] font-bold border ${
                    priority === 'urgent' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Терміновий
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('critical')}
                  className={`py-1.5 rounded-xl text-[11px] font-bold border ${
                    priority === 'critical' ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Критичний
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Текст звернення *</label>
              <textarea
                required
                rows={5}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Викладіть детальні факти, обставини та конкретні прохання..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-sky-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Додати PDF/Документи</span>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1"
              >
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                <span>Прикріпити</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Зареєструвати Офіційне Звернення</span>
            </button>
          </form>
        </div>

        {/* Existing Appeals List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-bold text-sm text-white flex items-center justify-between">
            <span>Зареєстровані звернення у системі ({appeals.length})</span>
            <span className="text-xs font-mono text-cyan-400">ЗУ №393/96-ВР</span>
          </div>

          <div className="space-y-3">
            {appeals.map(appeal => (
              <div
                key={appeal.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                      {appeal.trackingCode}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{appeal.subject}</h4>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    appeal.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : appeal.status === 'in_progress'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    {appeal.status === 'resolved' ? '🟢 Розглянуто' : appeal.status === 'in_progress' ? '🟣 В роботі' : '🟠 Зареєстровано'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {appeal.description}
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Відділ: <strong className="text-white">{appeal.department}</strong></span>
                  <span>Термін відповіді: {appeal.responseDueDate}</span>
                </div>

                {appeal.officialResponse && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Офіційна відповідь виконався:</span>
                      </span>
                      <button className="text-[10px] text-cyan-300 font-mono underline flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>Завантажити PDF</span>
                      </button>
                    </div>
                    <p className="text-slate-300">{appeal.officialResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
