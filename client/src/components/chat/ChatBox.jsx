import { useEffect, useRef, useState } from 'react';
import Button from '../common/Button';

function formatHeaderTime(dateValue) {
  if (!dateValue) {
    return 'Waiting for the next message';
  }

  const date = new Date(dateValue);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat('en-IN', isSameDay
    ? { hour: 'numeric', minute: '2-digit' }
    : { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}

function formatBubbleTime(dateValue) {
  if (!dateValue) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function formatDayLabel(dateValue) {
  if (!dateValue) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateValue));
}

export default function ChatBox({
  conversation,
  messages,
  onSendMessage,
  typingLabel,
  suggestions = [],
}) {
  const [draft, setDraft] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingLabel]);

  useEffect(() => {
    setDraft('');
  }, [conversation?.id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content || !conversation?.id || !onSendMessage) {
      return;
    }

    onSendMessage({
      conversationId: conversation.id,
      content,
    });
    setDraft('');
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  if (!conversation) {
    return (
      <section
        style={{
          minHeight: '720px',
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          display: 'grid',
          placeItems: 'center',
          padding: '32px',
        }}
      >
        <div style={{ maxWidth: '420px', display: 'grid', gap: '12px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.6rem' }}>Choose a conversation</h2>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
            Once you select a nearby chat, the full message thread and composer will appear here.
          </p>
        </div>
      </section>
    );
  }

  const messageItems = messages || [];

  return (
    <section
      style={{
        minHeight: '720px',
        borderRadius: '32px',
        overflow: 'hidden',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 24px 48px rgba(15, 23, 42, 0.1)',
        background: 'rgba(255, 255, 255, 0.92)',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr) auto',
      }}
    >
      <header
        style={{
          padding: '22px 24px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              background: conversation.avatarGradient,
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '17px',
              flexShrink: 0,
              boxShadow: '0 14px 26px rgba(15, 23, 42, 0.12)',
            }}
          >
            {conversation.avatar}
          </div>

          <div style={{ minWidth: 0, display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: 'clamp(1.2rem, 2vw, 1.55rem)',
                  fontFamily: '"Sora", "Segoe UI", sans-serif',
                }}
              >
                {conversation.participantName}
              </h2>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  background: conversation.isOnline ? '#10b981' : '#cbd5e1',
                  boxShadow: conversation.isOnline ? '0 0 0 4px rgba(16, 185, 129, 0.12)' : 'none',
                }}
              />
            </div>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
              {conversation.role} | {conversation.skillTitle} | {conversation.distanceLabel}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              borderRadius: '999px',
              padding: '8px 12px',
              background: 'rgba(37, 99, 235, 0.08)',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {conversation.bookingStatus}
          </span>
          <span
            style={{
              borderRadius: '999px',
              padding: '8px 12px',
              background: 'rgba(15, 23, 42, 0.05)',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Last update {formatHeaderTime(conversation.lastMessageAt)}
          </span>
        </div>
      </header>

      <div
        style={{
          position: 'relative',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background:
            'radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 18%), linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
        }}
      >
        {messageItems.map((message, index) => {
          const isOwn = Boolean(message?.isOwn || message?.senderRole === 'me');
          const content = message?.content || message?.text || message?.message || '';
          const key = message?._id || message?.id || `${index}-${message?.createdAt || 'msg'}`;
          const previousMessage = messageItems[index - 1];
          const showDayLabel =
            !previousMessage ||
            new Date(previousMessage.createdAt || '').toDateString() !==
              new Date(message.createdAt || '').toDateString();

          return (
            <div key={key} style={{ display: 'grid', gap: '10px' }}>
              {showDayLabel ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '7px 12px',
                      background: 'rgba(15, 23, 42, 0.06)',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {formatDayLabel(message.createdAt)}
                  </span>
                </div>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  justifyContent: isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: 'min(78%, 560px)',
                    borderRadius: isOwn ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
                    padding: '14px 16px',
                    color: isOwn ? '#f8fafc' : '#0f172a',
                    background: isOwn
                      ? 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)'
                      : 'rgba(255, 255, 255, 0.96)',
                    border: isOwn ? 'none' : '1px solid rgba(148, 163, 184, 0.18)',
                    boxShadow: isOwn
                      ? '0 16px 28px rgba(37, 99, 235, 0.18)'
                      : '0 12px 20px rgba(15, 23, 42, 0.06)',
                    display: 'grid',
                    gap: '8px',
                  }}
                >
                  {!isOwn ? (
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                      {message?.senderName || conversation.participantName}
                    </strong>
                  ) : null}
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.7,
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {content}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        color: isOwn ? 'rgba(248, 250, 252, 0.76)' : '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      {formatBubbleTime(message.createdAt)}
                    </span>
                    {isOwn ? (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'rgba(248, 250, 252, 0.76)',
                          fontWeight: 600,
                        }}
                      >
                        {message?.deliveryStatus || 'Delivered'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typingLabel ? (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                borderRadius: '24px 24px 24px 8px',
                padding: '12px 14px',
                background: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                boxShadow: '0 10px 18px rgba(15, 23, 42, 0.05)',
                display: 'grid',
                gap: '8px',
              }}
            >
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{typingLabel}</strong>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '999px',
                      background: '#94a3b8',
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div ref={messageEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: '1px solid rgba(148, 163, 184, 0.14)',
          padding: '18px 20px 20px',
          background: '#ffffff',
          display: 'grid',
          gap: '14px',
        }}
      >
        {suggestions.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setDraft(suggestion)}
                style={{
                  border: '1px solid rgba(37, 99, 235, 0.12)',
                  borderRadius: '999px',
                  padding: '9px 12px',
                  background: 'rgba(37, 99, 235, 0.06)',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className="chat-composer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: '12px',
            alignItems: 'end',
          }}
        >
          <label style={{ display: 'grid', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Message
            </span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={3}
              placeholder={`Message ${conversation.participantName} about the plan, timing or location`}
              style={{
                width: '100%',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                borderRadius: '20px',
                padding: '14px 16px',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#0f172a',
                background: '#f8fafc',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                minHeight: '112px',
              }}
            />
          </label>

          <div className="chat-compose-actions" style={{ display: 'grid', gap: '8px', minWidth: '150px' }}>
            <Button
              type="submit"
              disabled={!draft.trim()}
              style={{
                minHeight: '52px',
                background: 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
                border: 'none',
                boxShadow: '0 16px 28px rgba(37, 99, 235, 0.16)',
              }}
            >
              Send now
            </Button>
            <span style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>
              Press Enter to send. Use Shift + Enter for a new line.
            </span>
          </div>
        </div>
      </form>
    </section>
  );
}
