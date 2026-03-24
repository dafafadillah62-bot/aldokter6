/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  User, 
  Search, 
  Home, 
  Stethoscope, 
  BookOpen, 
  ChevronRight, 
  Star, 
  Send,
  Activity,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Toaster, toast } from 'sonner';
import { DOCTORS, ARTICLES, type Doctor, type Article } from './constants';

// --- Types ---
type Page = 'home' | 'chat' | 'doctors' | 'articles' | 'profile';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- Mock Data ---
const HEALTH_DATA = [
  { day: 'Mon', steps: 4500, sleep: 7.2 },
  { day: 'Tue', steps: 5200, sleep: 6.8 },
  { day: 'Wed', steps: 6100, sleep: 7.5 },
  { day: 'Thu', steps: 4800, sleep: 7.0 },
  { day: 'Fri', steps: 7500, sleep: 6.5 },
  { day: 'Sat', steps: 8200, sleep: 8.2 },
  { day: 'Sun', steps: 5900, sleep: 7.8 },
];

// --- Components ---

const Header = ({ title }: { title: string }) => (
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-md mx-auto w-full">
    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    <div className="flex items-center gap-4">
      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
        <Search size={20} />
      </button>
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
        JD
      </div>
    </div>
  </header>
);

const Navigation = ({ currentPage, setPage }: { currentPage: Page, setPage: (p: Page) => void }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'chat', icon: MessageCircle, label: 'Chat AI' },
    { id: 'doctors', icon: Stethoscope, label: 'Dokter' },
    { id: 'articles', icon: BookOpen, label: 'Artikel' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20 max-w-md mx-auto w-full shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id as Page)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentPage === item.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const HomeView = ({ setPage }: { setPage: (p: Page) => void }) => (
  <div className="p-6 space-y-8 pb-24">
    {/* Welcome Section */}
    <section>
      <h2 className="text-2xl font-bold text-gray-900">Halo, John!</h2>
      <p className="text-gray-500">Bagaimana perasaan Anda hari ini?</p>
    </section>

    {/* Quick Stats */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Activity size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Langkah</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">5.900</div>
        <div className="text-[10px] text-blue-500 font-medium">75% dari target harian</div>
      </div>
      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
        <div className="flex items-center gap-2 text-rose-600 mb-2">
          <Heart size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Detak Jantung</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">72 bpm</div>
        <div className="text-[10px] text-rose-500 font-medium">Rentang normal</div>
      </div>
    </div>

    {/* Symptom Checker CTA */}
    <section className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Cek gejala Anda</h3>
          <p className="text-blue-100 text-xs leading-relaxed max-w-[200px]">
            Asisten kesehatan AI kami dapat membantu Anda memahami apa yang Anda rasakan.
          </p>
          <button 
            onClick={() => setPage('chat')}
            className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all"
          >
            Mulai Cek
          </button>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
          <Stethoscope size={32} />
        </div>
      </div>
    </section>

    {/* Activity Chart */}
    <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Aktivitas Mingguan</h3>
        <select className="text-xs font-medium text-gray-500 bg-gray-50 border-none rounded-lg px-2 py-1">
          <option>Langkah</option>
          <option>Tidur</option>
        </select>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HEALTH_DATA}>
            <defs>
              <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="steps" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSteps)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* Recommended Doctors */}
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Dokter Teratas</h3>
        <button className="text-xs font-semibold text-blue-600 flex items-center gap-1">
          Lihat Semua <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {DOCTORS.map((doc) => (
          <div key={doc.id} className="min-w-[160px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <img 
              src={doc.image} 
              alt={doc.name} 
              className="w-12 h-12 rounded-full mb-3 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="font-semibold text-sm text-gray-900 truncate">{doc.name}</div>
            <div className="text-[10px] text-gray-500 mb-2">{doc.specialty}</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
              <Star size={10} fill="currentColor" />
              {doc.rating}
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Halo! Saya asisten kesehatan AI Anda. Saya dapat membantu Anda memeriksa gejala atau memberikan informasi kesehatan. \n\n**Penafian:** Saya adalah AI, bukan dokter. Jika Anda mengalami keadaan darurat medis, harap segera hubungi layanan darurat setempat.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{ text: input }]
          }
        ],
        config: {
          systemInstruction: "Anda adalah asisten kesehatan yang membantu dan profesional. Berikan informasi kesehatan dan pemeriksaan gejala yang akurat. SELALU sertakan penafian medis yang jelas bahwa Anda adalah AI dan bukan dokter. Bersikaplah empati dan ringkas. Gunakan markdown untuk pemformatan.",
        }
      });

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Maaf, saya tidak dapat memproses permintaan tersebut.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Saya sedang kesulitan terhubung saat ini. Silakan coba lagi nanti.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              "Cek gejala saya",
              "Tips diet sehat",
              "Cara tidur lebih nyenyak?",
              "Obat flu umum"
            ].map((q) => (
              <button 
                key={q}
                onClick={() => { setInput(q); }}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-semibold text-gray-600 text-left hover:border-blue-200 hover:bg-blue-50 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              <div className="prose prose-sm prose-invert max-w-none">
                <Markdown>{msg.text}</Markdown>
              </div>
              <div className={`text-[9px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
              />
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
              />
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Jelaskan gejala Anda..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:bg-gray-400 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorsView = () => {
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Silakan pilih tanggal dan waktu');
      return;
    }
    
    toast.success(`Janji temu dikonfirmasi dengan ${selectedDoc?.name} pada ${selectedDate} pukul ${selectedTime}!`);
    setIsBooking(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari dokter, spesialisasi..."
          className="w-full bg-gray-50 border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['Semua', 'Umum', 'Anak', 'Gigi', 'Kulit', 'Jantung'].map((cat) => (
          <button key={cat} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap">
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {DOCTORS.map((doc) => (
          <div key={doc.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <img 
              src={doc.image} 
              alt={doc.name} 
              className="w-20 h-20 rounded-2xl object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-900 truncate">{doc.name}</h4>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star size={12} fill="currentColor" />
                  {doc.rating}
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">{doc.specialty} • {doc.experience}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">Rp {doc.price.toLocaleString()}</span>
                <button 
                  onClick={() => { setSelectedDoc(doc); setIsBooking(true); }}
                  className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider active:scale-95 transition-all"
                >
                  Pesan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBooking && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBooking(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={selectedDoc.image} 
                  alt={selectedDoc.name} 
                  className="w-16 h-16 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedDoc.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDoc.specialty}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tentang Dokter</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedDoc.description}
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pilih Tanggal</h4>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {['24 Mar', '25 Mar', '26 Mar', '27 Mar'].map((d) => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedDate(d)}
                        className={`min-w-[80px] p-3 border rounded-2xl text-center transition-all ${
                          selectedDate === d 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'bg-gray-50 border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <div className={`text-xs font-bold ${selectedDate === d ? 'text-blue-600' : 'text-gray-900'}`}>{d}</div>
                        <div className="text-[10px] text-gray-400">Tersedia</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pilih Waktu</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['09:00', '10:30', '14:00', '15:30', '17:00', '19:30'].map((t) => (
                      <button 
                        key={t} 
                        onClick={() => setSelectedTime(t)}
                        className={`p-3 border rounded-2xl text-xs font-bold transition-all ${
                          selectedTime === t 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'bg-gray-50 border-gray-100 text-gray-900 hover:border-blue-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleConfirmBooking}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                  Konfirmasi Pesanan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArticlesView = () => (
  <div className="p-6 space-y-8 pb-24">
    <div className="grid grid-cols-1 gap-6">
      {ARTICLES.map((article) => (
        <div key={article.id} className="group cursor-pointer">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-4">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {article.category}
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {article.summary}
          </p>
          <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {article.readTime}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              Mar 24, 2026
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProfileView = () => (
  <div className="p-6 space-y-8 pb-24">
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl mb-4 border-4 border-white shadow-lg">
        JD
      </div>
      <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
      <p className="text-sm text-gray-500">john.doe@example.com</p>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center">
        <div className="text-lg font-bold text-gray-900">180</div>
        <div className="text-[10px] text-gray-400 font-medium uppercase">Tinggi</div>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center">
        <div className="text-lg font-bold text-gray-900">75</div>
        <div className="text-[10px] text-gray-400 font-medium uppercase">Berat</div>
      </div>
      <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center">
        <div className="text-lg font-bold text-gray-900">O+</div>
        <div className="text-[10px] text-gray-400 font-medium uppercase">Darah</div>
      </div>
    </div>

    <div className="space-y-2">
      {[
        { icon: Activity, label: 'Catatan Kesehatan', color: 'text-blue-500' },
        { icon: Calendar, label: 'Janji Temu', color: 'text-rose-500' },
        { icon: Heart, label: 'Favorit', color: 'text-amber-500' },
        { icon: AlertCircle, label: 'Kontak Darurat', color: 'text-red-500' },
      ].map((item) => (
        <button key={item.label} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <item.icon size={20} className={item.color} />
            <span className="text-sm font-semibold text-gray-700">{item.label}</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      ))}
    </div>

    <button className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors">
      Keluar
    </button>
  </div>
);

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const getTitle = () => {
    switch (page) {
      case 'home': return 'AloDoc AI';
      case 'chat': return 'Asisten Kesehatan';
      case 'doctors': return 'Cari Dokter';
      case 'articles': return 'Artikel Kesehatan';
      case 'profile': return 'Profil Saya';
      default: return 'AloDoc AI';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-700 flex flex-col items-center">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl shadow-gray-200/50 flex flex-col relative">
        <Header title={getTitle()} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {page === 'home' && <HomeView setPage={setPage} />}
              {page === 'chat' && <ChatView />}
              {page === 'doctors' && <DoctorsView />}
              {page === 'articles' && <ArticlesView />}
              {page === 'profile' && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>

        <Navigation currentPage={page} setPage={setPage} />
      </div>
    </div>
  );
}
