import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Sparkles, Calendar, Scissors, Package, 
  HelpCircle, Clock, MapPin, Phone, User, ChevronRight 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/utils/cn';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🛡️ Initialize Gemini 1.5 Flash
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export function PremiumSmartWidget() {
  const { 
    salonProfile, services, packages, staff, faqs, bookings, loading 
  } = useBookingStore();
  const { language } = useStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'booking' | 'faqs'>('chat');
  const [chat, setChat] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🎨 Branding
  const brandColor = salonProfile?.brand_color || '#6366f1';
  const assistantName = "Sarah"; // Your Salon's Virtual Stylist

  useEffect(() => {
    if (salonProfile && chat.length === 0) {
      setChat([{ 
        role: 'bot', 
        text: `Hi Gorgeous! ✨ I'm ${assistantName}, your personal assistant at ${salonProfile.name}. How can I make your day more beautiful?` 
      }]);
    }
  }, [salonProfile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // 🧠 AI Agent Logic (Context Injection)
  const askAI = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemContext = `
        You are ${assistantName}, the luxury concierge for ${salonProfile?.name}.
        SERVICES: ${services.map(s => `${s.name} ($${s.price})`).join(', ')}
        PACKAGES: ${packages.map(p => p.name).join(', ')}
        FAQs: ${faqs.map(f => `Q: ${f.question} A: ${f.answer}`).join(' ')}
        
        STRICT RULES:
        1. Only answer about ${salonProfile?.name}. 
        2. If you don't know the answer, say: "I'm not sure about that, but please leave your name and number and our team will get back to you immediately!"
        3. If they want to book, tell them: "Click the 'Book Now' button right below this chat to see our real-time calendar."
        4. Be glamorous, professional, and friendly.
      `;

      const result = await model.generateContent([systemContext, userMsg]);
      const response = await result.response;
      setChat(prev => [...prev, { role: 'bot', text: response.text() }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', text: "I'm currently busy styling! Please leave your number and I'll call you back soon." }]);
    }
  };

  if (!salonProfile) return null;

  return (
    <div className={cn("fixed bottom-8 right-8 z-[1000]", language === 'ar' && "rtl")}>
      
      {/* 💅 THE AVATAR (Girl Face + Book Now Text) */}
      <div className="relative group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-gray-100 animate-bounce">
            <span className="text-[10px] font-black text-indigo-600 uppercase whitespace-nowrap">Book Now ✨</span>
          </div>
        )}
        <div className={cn(
          "h-20 w-20 rounded-full border-4 border-white shadow-2xl overflow-hidden transition-all duration-500 hover:scale-110 ring-4",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )} style={{ ringColor: brandColor }}>
          <img 
            src="https://resource2.heygen.ai/photo_generation/5850472520224fb39a1f4b622168b54f/e068c584-11a6-450a-a09f-257a67067c75.jpg" 
            alt="Assistant" 
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* 🏰 THE PREMIUM WINDOW */}
      {isOpen && (
        <div className="w-[400px] h-[650px] max-h-[85vh] bg-white rounded-[3rem] shadow-[-20px_20px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
          
          {/* Header Area */}
          <div className="relative p-8 text-white" style={{ backgroundColor: brandColor }}>
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X size={20}/>
            </button>
            <div className="flex gap-4 items-center">
              <div className="h-16 w-16 rounded-3xl border-2 border-white/50 overflow-hidden shadow-lg">
                <img src="https://resource2.heygen.ai/photo_generation/5850472520224fb39a1f4b622168b54f/e068c584-11a6-450a-a09f-257a67067c75.jpg" className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tighter">{salonProfile.name}</h3>
                <p className="text-xs font-bold opacity-80 flex items-center gap-1">
                  <Sparkles size={12}/> {assistantName} - Your Luxury Guide
                </p>
              </div>
            </div>
            
            {/* Quick Actions Bar */}
            <div className="flex gap-2 mt-8">
              {['chat', 'faqs'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveView(tab as any)}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeView === tab ? "bg-white text-gray-900" : "bg-white/20 text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
            {activeView === 'chat' && (
              <div className="space-y-4">
                {chat.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-[1.5rem] text-sm font-medium shadow-sm",
                      msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white text-gray-800"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {activeView === 'faqs' && (
              <div className="space-y-3">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-4 bg-white rounded-2xl border-2 border-gray-50 shadow-sm">
                    <p className="font-black text-gray-900 text-xs uppercase mb-2">Q: {faq.question}</p>
                    <p className="text-sm text-gray-500 font-medium">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-6 bg-white border-t border-gray-100">
            {activeView === 'chat' ? (
              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAI()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': brandColor } as any}
                />
                <button onClick={askAI} className="p-3 rounded-2xl text-white shadow-xl" style={{ backgroundColor: brandColor }}>
                  <Send size={20} />
                </button>
              </div>
            ) : null}
            
            <button 
              onClick={() => setActiveView('booking')}
              className="w-full mt-4 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-transform hover:scale-[1.02]"
            >
              <Calendar size={16}/> Book My Transformation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}