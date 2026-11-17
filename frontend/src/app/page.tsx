"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Plus,
  Bot,
  User,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Sparkles,
  Check,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; snippet: string }[];
  timestamp: string;
}

const AVAILABLE_MODELS = [
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    label: "Gemini อัตโนมัติ",
    tag: "เร็ว & แม่นยำ",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    label: "Gemini 1.5 Pro",
    tag: "วิเคราะห์เชิงลึก",
  },
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2 (Local)",
    label: "Llama 3.2 (Ollama)",
    tag: "รันในเครื่อง",
  },
  {
    id: "qwen-2.5-7b",
    name: "Qwen 2.5 (Local)",
    label: "Qwen 2.5 (Ollama)",
    tag: "รันในเครื่อง",
  },
];

export default function ChatPlatform() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text.trim(),
          model: selectedModel.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || data.response || "No response received.",
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Fallback demo response while backend is starting
      setTimeout(() => {
        const mockResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `ระบบกำลังรันในโหมดเชื่อมต่อ [${selectedModel.name}]\n\nคำถามของคุณ: "${text}"\n\n*(หมายเหตุ: เมื่อคุณเปิดรัน FastAPI Backend ระบบจะสตรีมคำตอบที่ค้นจาก Vector DB และโมเดล ${selectedModel.name} แบบ Real-time)*`,
          sources: [
            {
              title: "GPU_Market_Prices_2026.pdf",
              snippet:
                "RTX 4070 Ti Super 16GB รองรับ CUDA Cores 8448 เหมาะสำหรับทั้งงาน AI Training และเล่นเกม 4K",
            },
            {
              title: "CPU_TDP_Cooling_Guide.docx",
              snippet:
                "Intel Core i7-14700K มี 20 Cores (8P + 12E) แนะนำชุดน้ำปิด 360mm เพื่อการระบายความร้อนที่เสถียร",
            },
          ],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, mockResponse]);
        setIsLoading(false);
      }, 600);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputQuery("");
  };

  const isInitialState = messages.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafc] bg-[radial-gradient(ellipse_80%_65%_at_50%_48%,rgba(238,242,255,0.7),rgba(250,250,252,0.9)_60%,rgba(250,250,252,1)_85%)] text-neutral-800">
      {/* Top Subtle Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            SpecRAG <span className="text-xs font-normal text-neutral-400">AI</span>
          </span>
        </div>

        {!isInitialState && (
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-full transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>แชตใหม่</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto px-4">
        {isInitialState ? (
          /* Initial Centered Landing View (Minimalist White Tone) */
          <div className="flex-1 flex flex-col items-center justify-center -mt-8 py-8 w-full">
            {/* Centered Heading */}
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900 text-center mb-8">
              เราจะเริ่มจากตรงไหนก่อนดี
            </h1>

            {/* Centered Search Box */}
            <div className="w-full max-w-2xl bg-white border border-neutral-200/90 rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-neutral-300 focus-within:border-neutral-400 focus-within:shadow-[0_12px_36px_rgb(0,0,0,0.07)] transition-all">
              {/* Textarea & Plus button */}
              <div className="flex items-start gap-2 px-2 pt-1">
                <button
                  type="button"
                  title="แนบเอกสารหรือไฟล์ RAG"
                  className="p-1.5 mt-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="ถาม Gemini หรือค้นหาสเปกคอมพิวเตอร์..."
                  className="w-full resize-none bg-transparent text-sm sm:text-base text-neutral-900 placeholder-neutral-400 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Bottom Control Bar */}
              <div className="flex items-center justify-between pt-2 px-2 mt-1 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>RAG Knowledge Base Active</span>
                </div>

                {/* Right controls: Model Selector (แทนคำว่า Shift+Enter) & Send button */}
                <div className="flex items-center gap-2">
                  {/* Model Selector Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() =>
                        setIsModelDropdownOpen(!isModelDropdownOpen)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200/70 rounded-full transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{selectedModel.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-2 w-60 bg-white border border-neutral-200 rounded-2xl shadow-xl p-1.5 z-50">
                        <div className="px-3 py-1.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                          เลือก AI Model สำหรับ RAG
                        </div>
                        {AVAILABLE_MODELS.map((model) => {
                          const isSelected = model.id === selectedModel.id;
                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(model);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-neutral-100 font-medium text-neutral-900"
                                  : "hover:bg-neutral-50 text-neutral-600"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-neutral-900">
                                  {model.name}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {model.tag}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-neutral-900" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!inputQuery.trim() || isLoading}
                    className={`p-2 rounded-full transition-all ${
                      inputQuery.trim() && !isLoading
                        ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm cursor-pointer"
                        : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Thread View */
          <div className="flex-1 py-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-neutral-900 text-white rounded-tr-xs shadow-2xs"
                      : "bg-white border border-neutral-200/80 text-neutral-800 shadow-xs rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Sources / Citations from RAG Vector DB */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                        <span>แหล่งข้อมูลที่ค้นพบจาก Vector Database</span>
                      </div>
                      <div className="grid gap-1.5">
                        {msg.sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-200/70 text-xs text-neutral-700"
                          >
                            <span className="font-medium text-neutral-900 block mb-0.5">
                              {src.title}
                            </span>
                            <span className="text-[11px] text-neutral-500 line-clamp-2">
                              {src.snippet}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] mt-1.5 text-right text-neutral-400">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-neutral-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse delay-200"></span>
                  <span className="text-xs text-neutral-500 ml-1">
                    กำลังค้นหาใน Vector DB และประมวลผลคำตอบ...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Bottom Input Field in Chat Mode */}
        {!isInitialState && (
          <div className="sticky bottom-4 w-full pt-2 pb-2 bg-gradient-to-t from-[#fafafc] via-[#fafafc]/90 to-transparent">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-2.5 shadow-md focus-within:border-neutral-400 transition-all">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="แนบไฟล์"
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <textarea
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={`ถาม ${selectedModel.label} เกี่ยวกับสเปกคอมพิวเตอร์...`}
                  className="w-full resize-none bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden px-1 py-1 max-h-32"
                />

                {/* Model Selector in bottom input */}
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsModelDropdownOpen(!isModelDropdownOpen)
                    }
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200/70 rounded-full transition-all cursor-pointer"
                  >
                    <span>{selectedModel.label}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl p-1.5 z-50">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left rounded-lg text-xs transition-colors cursor-pointer ${
                            model.id === selectedModel.id
                              ? "bg-neutral-100 font-medium text-neutral-900"
                              : "hover:bg-neutral-50 text-neutral-600"
                          }`}
                        >
                          <span>{model.name}</span>
                          {model.id === selectedModel.id && (
                            <Check className="w-3 h-3 text-neutral-900" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputQuery.trim() || isLoading}
                  className={`p-2 rounded-full shrink-0 transition-all ${
                    inputQuery.trim() && !isLoading
                      ? "bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer"
                      : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
