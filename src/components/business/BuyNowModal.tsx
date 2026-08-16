import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Truck,
  CreditCard,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { BusinessListing } from '../../types';
import { ROKYTNE_SETTLEMENTS } from '../../data/rokytneData';

interface BuyNowModalProps {
  item: BusinessListing | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const BuyNowModal: React.FC<BuyNowModalProps> = ({
  item,
  onClose,
  onSuccess
}) => {
  const [buyerName, setBuyerName] = useState('Олександр Дмитрук');
  const [buyerPhone, setBuyerPhone] = useState('+380 (97) 123-4567');
  const [selectedSettlement, setSelectedSettlement] = useState('селище Рокитне');
  const [deliveryAddress, setDeliveryAddress] = useState('вул. Незалежності, 15');
  const [deliveryType, setDeliveryType] = useState<'self' | 'courier' | 'postal'>('courier');
  const [paymentType, setPaymentType] = useState<'cash' | 'cod' | 'fop'>('cod');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const formattedPrice = new Intl.NumberFormat('uk-UA').format(item.priceUah * quantity);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `ORD-ROK-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsSubmitting(false);
      onSuccess(orderId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[140] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 relative text-slate-100 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold uppercase">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Швидке Оформлення Замовлення</span>
          </div>
          <h2 className="text-xl font-black text-white">Швидка покупка в громаді</h2>
        </div>

        {/* Selected Item Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'}
            alt={item.title}
            className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
            <div className="text-xs text-slate-400 font-mono">Продавець: {item.companyName || item.sellerName}</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {formattedPrice} ₴
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-slate-400 hover:text-white px-1 text-sm font-bold"
            >
              -
            </button>
            <span className="text-xs font-bold font-mono text-white">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="text-slate-400 hover:text-white px-1 text-sm font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
          {/* Buyer Info */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-slate-400 uppercase text-[10px]">
              Контактні дані покупця
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="ПІБ покупця"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  placeholder="Номер телефону"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-slate-400 uppercase text-[10px]">
              Спосіб доставки по Рокитнівщині
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('courier')}
                className={`p-2.5 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                  deliveryType === 'courier' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Кур'єр по громаді
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('self')}
                className={`p-2.5 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                  deliveryType === 'self' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Самовивіз
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('postal')}
                className={`p-2.5 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                  deliveryType === 'postal' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Нова / Укрпошта
              </button>
            </div>

            {deliveryType !== 'self' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <select
                  value={selectedSettlement}
                  onChange={e => setSelectedSettlement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {ROKYTNE_SETTLEMENTS.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Вулиця, номер будинку / відділення"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-slate-400 uppercase text-[10px]">
              Спосіб оплати
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('cod')}
                className={`p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                  paymentType === 'cod' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Накладений платіж
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('cash')}
                className={`p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                  paymentType === 'cash' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Готівка при отриманні
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('fop')}
                className={`p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                  paymentType === 'fop' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Безготівковий (ФОП)
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isSubmitting ? 'Оформлення замовлення...' : `Підтвердити замовлення (${formattedPrice} ₴)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
