import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Icons, Pressable } from './ui';

/**
 * Polling-based chat for a single order. Surface from the customer's
 * tracking page or the rider's active-delivery card by toggling `open`.
 *
 * Polls /api/orders/:id/messages every 2s while open. Posts go to the
 * same endpoint. Server enforces that only the customer who placed the
 * order, the rider who picked it up, the restaurant, and admin can
 * read/write the thread.
 */
const POLL_MS = 2000;

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours(), m = d.getMinutes();
  return `${(h % 12 || 12)}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

export default function OrderChat({
  open, onClose, orderId, currentUserId, otherPartyName,
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // Open → fetch + start polling. Closed → stop polling.
  useEffect(() => {
    if (!open || !orderId) return undefined;
    let cancelled = false;
    const fetchOnce = () => {
      api.get(`/orders/${orderId}/messages`)
        .then(r => {
          if (cancelled) return;
          const next = r.data?.data || [];
          setMessages(prev => (
            prev.length === next.length && prev[prev.length - 1]?.id === next[next.length - 1]?.id
              ? prev : next
          ));
        })
        .catch(() => {});
    };
    fetchOnce();
    const t = setInterval(fetchOnce, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [open, orderId]);

  // Stick the scroll to the bottom whenever a new message arrives.
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, open]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !orderId) return;
    setSending(true);
    // Optimistic append so the input clears immediately.
    const optimistic = {
      id: `local-${Date.now()}`,
      text,
      created_at: new Date().toISOString(),
      sender: { id: currentUserId },
      sender_id: currentUserId,
      _optimistic: true,
    };
    setMessages(m => [...m, optimistic]);
    setDraft('');
    try {
      const r = await api.post(`/orders/${orderId}/messages`, { text });
      const real = r.data?.data;
      setMessages(m => m.map(x => x.id === optimistic.id ? real : x));
    } catch (e) {
      // Roll back optimistic message; keep draft so user can retry.
      setMessages(m => m.filter(x => x.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 1100,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
            }}
          />
          <motion.div
            key="chat-sheet"
            role="dialog" aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', zIndex: 1101,
              left: 0, right: 0, bottom: 0,
              maxHeight: '80vh',
              background: '#fff',
              borderTopLeftRadius: 18, borderTopRightRadius: 18,
              boxShadow: '0 -12px 32px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Grab handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E5E5' }}/>
            </div>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 16px 12px',
              borderBottom: '1px solid #F3F4F6',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 999,
                background: 'linear-gradient(135deg, var(--qb-primary), var(--qb-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icons.Message size={18} stroke="#fff" sw={2.2}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {otherPartyName || 'Chat'}
                </div>
                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 1 }}>
                  Online · live chat
                </div>
              </div>
              <Pressable onClick={onClose} aria-label="Close" style={{
                width: 36, height: 36, borderRadius: 999, background: '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icons.X size={16} stroke="#374151" sw={2.2}/>
              </Pressable>
            </div>

            {/* Messages list */}
            <div
              ref={listRef}
              style={{
                flex: 1, overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex', flexDirection: 'column', gap: 8,
                background: '#FAFAFA',
              }}
            >
              {messages.length === 0 ? (
                <div style={{
                  margin: 'auto', textAlign: 'center', color: '#9CA3AF',
                  fontSize: 13, padding: 24,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>💬</div>
                  Say hi — your messages stay tied to this order.
                </div>
              ) : (
                messages.map(m => {
                  const senderId = m.sender?.id || m.sender?._id || m.sender_id;
                  const mine = senderId === currentUserId;
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: mine ? 'flex-end' : 'flex-start',
                        maxWidth: '78%',
                        padding: '8px 12px',
                        borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: mine ? 'var(--qb-primary)' : '#fff',
                        color: mine ? '#fff' : '#111',
                        boxShadow: mine ? '0 4px 12px rgba(229,57,53,0.18)' : '0 1px 2px rgba(0,0,0,0.06)',
                        border: mine ? 0 : '1px solid #F0F0F0',
                        opacity: m._optimistic ? 0.7 : 1,
                      }}
                    >
                      <div style={{ fontSize: 13, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {m.text}
                      </div>
                      <div style={{
                        fontSize: 9, fontWeight: 600,
                        color: mine ? 'rgba(255,255,255,0.75)' : '#9CA3AF',
                        textAlign: 'right', marginTop: 3,
                      }}>
                        {fmtTime(m.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => { e.preventDefault(); if (!sending) send(); }}
              style={{
                display: 'flex', gap: 8, alignItems: 'flex-end',
                padding: '10px 12px calc(env(safe-area-inset-bottom, 0px) + 10px)',
                borderTop: '1px solid #F3F4F6', background: '#fff',
              }}
            >
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!sending) send();
                  }
                }}
                placeholder="Type a message…"
                rows={1}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1.5px solid #E5E5E5',
                  borderRadius: 22,
                  fontSize: 14, fontFamily: 'inherit',
                  resize: 'none', outline: 'none',
                  color: '#111',
                  maxHeight: 120, minHeight: 22,
                }}
              />
              <Pressable
                onClick={send}
                disabled={sending || !draft.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                  background: draft.trim() && !sending ? 'var(--qb-primary)' : '#D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: draft.trim() && !sending ? '0 4px 12px rgba(229,57,53,0.3)' : 'none',
                }}
              >
                <Icons.Send size={18} stroke="#fff" sw={2.2}/>
              </Pressable>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
