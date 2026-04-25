"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Check,
  CheckCheck,
  MessageSquareText,
  SendHorizontal,
  MoreVertical,
} from "lucide-react";

import { useDemoApp } from "@/components/demo-app-provider";

export default function DietitianMessagesPage() {
  const {
    state,
    featuredClient,
    allMessages,
    sendDietitianMessage,
    markMessageAsRead,
    sendReminder,
    isSeeded
  } = useDemoApp();

  const [selectedClientId, setSelectedClientId] = useState(featuredClient?.id || "");
  const [draft, setDraft] = useState("");

  const selectedClient = useMemo(() => 
    state.clients.find((c) => c.id === selectedClientId) ?? featuredClient ?? { name: "..." },
    [state.clients, selectedClientId, featuredClient]
  );

  // Filter messages for the selected client
  const clientMessages = allMessages.filter(m => m.clientId === selectedClientId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [clientMessages]);

  if (!isSeeded) {
    return (
      <div className="flex items-center justify-center h-full animate-pulse">
        <div className="text-[var(--muted)] font-bold uppercase tracking-widest text-sm">Mesajlar Yükleniyor...</div>
      </div>
    );
  }

  if (state.clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="w-16 h-16 bg-[rgba(47,44,40,0.05)] rounded-full flex items-center justify-center text-[var(--muted)] mb-4">
           <MessageSquareText size={32} />
        </div>
        <h2 className="text-xl font-bold text-[var(--ink)] mb-2">Henüz Danışan Yok</h2>
        <p className="text-sm text-[var(--muted)] max-w-xs">Kliniğe yeni danışanlar katıldığında burada mesajlaşmaya başlayabilirsin.</p>
      </div>
    );
  }

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await sendDietitianMessage({ body: trimmed, scope: "client", clientId: selectedClientId });
    setDraft("");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -m-6 sm:-m-10 lg:-m-12 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Client List */}
        <div className="w-[380px] border-r border-[rgba(47,44,40,0.1)] bg-white flex flex-col">
          <div className="p-5 border-b border-[rgba(47,44,40,0.06)] bg-[rgba(223,240,228,0.05)]">
            <h1 className="text-xl font-bold text-[var(--ink)]">Mesajlar</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {state.clients.map((client) => {
              const isSelected = client.id === selectedClientId;
              
              // Get actual last message for this client
              const clientMsgs = allMessages.filter(m => m.clientId === client.id);
              const lastMsg = clientMsgs.length > 0 ? clientMsgs[clientMsgs.length - 1] : null;
              const isUnread = clientMsgs.some(m => m.sender === "client" && m.status !== "read");
              
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition border-b border-[rgba(47,44,40,0.03)] ${
                    isSelected ? "bg-[rgba(223,240,228,0.5)] border-l-4 border-l-[var(--accent)]" : "hover:bg-[rgba(223,240,228,0.15)]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      isSelected ? "bg-[var(--accent)] text-white" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                    }`}>
                      {client.name.charAt(0)}
                    </div>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#b95f33] border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`text-sm font-bold truncate ${isSelected ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>
                        {client.name}
                      </p>
                      {lastMsg && (
                        <span className="text-[10px] text-[var(--muted)] font-medium">
                          {lastMsg.sentAt}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isUnread ? "text-[var(--ink)] font-semibold" : "text-[var(--soft-ink)]"}`}>
                      {lastMsg ? lastMsg.body : "Henüz mesaj yok"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Chat Area */}
        <div className="flex-1 bg-[rgba(251,253,251,0.5)] flex flex-col relative overflow-hidden">
          {/* Chat Header */}
          <div className="h-[72px] shrink-0 px-6 border-b border-[rgba(47,44,40,0.08)] bg-white flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold shadow-sm">
                {selectedClient?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{selectedClient?.name}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Çevrimiçi</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[var(--soft-ink)]">
              <button className="p-2 hover:bg-[rgba(223,240,228,0.4)] rounded-full transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Quick Nudges Bar */}
          <div className="flex items-center gap-3 px-6 py-2 border-b border-[rgba(47,44,40,0.04)] bg-[rgba(223,240,228,0.1)] overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold whitespace-nowrap">Dürtmeler:</span>
            <button
              onClick={() => sendReminder("water", "client", 0)}
              className="px-3 py-1.5 bg-white border border-[rgba(47,44,40,0.08)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all whitespace-nowrap"
            >
              💧 Su Hatırlat
            </button>
            <button
              onClick={() => sendReminder("meal", "client", 0)}
              className="px-3 py-1.5 bg-white border border-[rgba(47,44,40,0.08)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all whitespace-nowrap"
            >
              🥗 Öğün Zamanı
            </button>
            <button
              onClick={() => sendReminder("measurement", "client", 0)}
              className="px-3 py-1.5 bg-white border border-[rgba(47,44,40,0.08)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all whitespace-nowrap"
            >
              📏 Ölçüm İste
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {clientMessages.map((message) => {
              const isDietitian = message.sender === "dietitian";
              const isSystem = message.sender === "system";
              
              return (
                <div
                  key={message.id}
                  onClick={() => {
                    if (message.status !== "read") markMessageAsRead(message.id);
                  }}
                  className={`flex ${isDietitian ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] group relative px-5 py-3.5 shadow-sm transition-all ${
                      isDietitian
                        ? "bg-[var(--accent)] text-white rounded-t-2xl rounded-bl-2xl rounded-br-none"
                        : isSystem
                          ? "bg-white border border-[rgba(47,44,40,0.08)] text-[var(--soft-ink)] rounded-2xl italic text-center mx-auto max-w-[80%]"
                          : "bg-white border border-[rgba(47,44,40,0.08)] text-[var(--ink)] rounded-t-2xl rounded-br-2xl rounded-bl-none"
                    }`}
                  >
                    {!isDietitian && !isSystem && (
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent)] mb-1">Danışan</p>
                    )}
                    <p className="text-sm leading-relaxed">{message.body}</p>
                    <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isDietitian ? "text-white/60" : "text-[var(--muted)]"}`}>
                      <span className="text-[10px] font-medium">{message.sentAt.split("•")[1] ?? message.sentAt}</span>
                      {isDietitian && (
                        message.status === "read"
                          ? <CheckCheck size={14} className="text-white/80" />
                          : <Check size={14} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
            {clientMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--muted)] opacity-40">
                <MessageSquareText size={48} />
                <p className="text-sm font-medium">Sohbeti başlatın...</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-6 bg-white border-t border-[rgba(47,44,40,0.08)]">
            <div className="flex items-center gap-3 bg-[rgba(223,240,228,0.2)] border border-[rgba(47,44,40,0.1)] px-4 py-1">
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Mesajınızı buraya yazın..."
                className="flex-1 bg-transparent py-4 text-sm outline-none resize-none max-h-32"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim()}
                className="p-3 bg-[var(--accent)] text-white hover:bg-[#24794e] transition-all disabled:opacity-30 disabled:grayscale"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
