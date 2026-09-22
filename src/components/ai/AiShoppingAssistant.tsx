import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Bot,
  User,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { Button } from '../common/DesignSystem';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  productCards?: Product[];
}

export const AiShoppingAssistant: React.FC = () => {
  const {
    isAiWidgetOpen,
    setIsAiWidgetOpen,
    isAiFeatureEnabled,
    products,
    orders,
    navigateToProduct,
    navigateToOrderDetails,
    showToast,
  } = useStore();

  const { addToCart } = useCart();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Hello! I am Cartwise Studio AI. How can I assist your acoustic or desk setup today? I can help you find products under a budget, compare items, or check your active shipment status.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiWidgetOpen) {
      scrollToBottom();
    }
  }, [messages, isAiWidgetOpen]);

  if (!isAiWidgetOpen) return null;

  // Process and respond to user messages with domain intelligence
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Natural Language Intent Engine
    setTimeout(() => {
      const lower = query.toLowerCase();
      let replyText = '';
      let matchedProducts: Product[] = [];

      if (lower.includes('compare') || lower.includes('versus') || lower.includes('vs')) {
        replyText =
          'Here is an acoustic and ergonomics comparison between our top studio references: Aura One ANC features 40mm beryllium drivers with active cancellation, while K75 Mechanical brings gasket-mounted custom tactile switches.';
        matchedProducts = products.filter(
          (p) => p.id === 'prod-aura-one' || p.id === 'prod-k75-keyboard'
        );
      } else if (lower.includes('under $200') || lower.includes('under 200') || lower.includes('budget')) {
        matchedProducts = products.filter((p) => p.basePrice <= 200).slice(0, 3);
        replyText = `Found ${matchedProducts.length} precision tools under $200, including solid wood desk accessories and calibrated monitors:`;
      } else if (lower.includes('order') || lower.includes('status') || lower.includes('tracking')) {
        const latestOrder = orders.find((o) => o.customer.id === user?.id) || orders[0];
        if (latestOrder) {
          replyText = `Your latest order ${latestOrder.orderNumber} is currently ${latestOrder.orderStatus || latestOrder.status}. Carrier tracking: ${latestOrder.trackingNumber || 'Pending'}. Estimated arrival: ${latestOrder.estimatedDelivery}.`;
        } else {
          replyText = 'You have no historical orders placed yet. Once you place an order, I can track live carrier milestones!';
        }
      } else if (lower.includes('gift') || lower.includes('developer') || lower.includes('programmer')) {
        replyText =
          'For software engineers and desk creators, we recommend our solid walnut desk shelf for ergonomic posture, paired with a custom hot-swap gasket keyboard:';
        matchedProducts = products.filter(
          (p) => p.id === 'prod-desk-shelf' || p.id === 'prod-k75-keyboard'
        );
      } else if (lower.includes('headphone') || lower.includes('audio') || lower.includes('sound')) {
        matchedProducts = products.filter((p) => p.category === 'audio');
        replyText = 'Here are our flagship studio acoustic monitors and personal audio units:';
      } else {
        matchedProducts = products.slice(0, 2);
        replyText = `I found these curated essentials matching "${query}":`;
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productCards: matchedProducts.length > 0 ? matchedProducts : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAdd = (product: Product) => {
    const firstVariant =
      product.variants.find((v) => v.isAvailable && v.stock > 0) || product.variants[0];
    const res = addToCart(product, firstVariant, 1);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you discover gear today?',
        timestamp: 'Just now',
      },
    ]);
  };

  const SUGGESTED_PROMPTS = [
    'Find items under $200',
    'Compare two products',
    'Check order status',
    'Recommend gifts for developers',
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-96 max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col h-[520px] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-heading">Cartwise Studio AI</h3>
            <p className="text-[10px] text-slate-400">Shopping Assistant &middot; Ready</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Clear chat history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAiWidgetOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl p-3 shadow-xs space-y-2 ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>

              {/* Embedded Product Cards in Chat Response */}
              {m.productCards && m.productCards.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {m.productCards.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div
                        onClick={() => {
                          navigateToProduct(p.id);
                          setIsAiWidgetOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div className="truncate">
                          <p className="text-[11px] font-bold text-slate-900 truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ${p.basePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickAdd(p)}
                        className="p-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg transition-colors shrink-0 cursor-pointer"
                        title="Quick add to cart"
                      >
                        <ShoppingBag className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`block text-[9px] ${
                  m.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 items-center text-slate-400 text-xs">
            <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="animate-pulse">Assistant is analyzing catalog...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-100 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask for recommendations, specs, or orders..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <Button type="submit" variant="primary" size="sm" icon={Send} disabled={!inputQuery.trim()}>
          {''}
        </Button>
      </form>
    </div>
  );
};
