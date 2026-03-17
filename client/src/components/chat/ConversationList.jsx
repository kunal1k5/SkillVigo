const FILTER_LABELS = {
  all: 'All chats',
  unread: 'Unread',
  nearby: 'Within 10 km',
  hired: 'Active hires',
};

function formatPreviewTime(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat('en-IN', isSameDay
    ? { hour: 'numeric', minute: '2-digit' }
    : { day: '2-digit', month: 'short' }).format(date);
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) {
  return (
    <aside
      className="chat-sidebar-shell"
      style={{
        display: 'grid',
        gap: '18px',
      }}
    >
      <section
        style={{
          borderRadius: '28px',
          padding: '22px',
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '16px',
        }}
      >
        <div style={{ display: 'grid', gap: '6px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.2rem',
              color: '#0f172a',
              fontFamily: '"Sora", "Segoe UI", sans-serif',
            }}
          >
            Nearby conversations
          </h2>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Pick a thread and continue the hire or skill-sharing discussion.
          </p>
        </div>

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
            Search chat
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name, skill or area"
            style={{
              width: '100%',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              borderRadius: '18px',
              padding: '13px 14px',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.entries(FILTER_LABELS).map(([key, label]) => {
            const isActive = activeFilter === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(key)}
                style={{
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '999px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: isActive ? '#ffffff' : '#334155',
                  background: isActive
                    ? 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)'
                    : 'rgba(15, 23, 42, 0.04)',
                  boxShadow: isActive ? '0 12px 24px rgba(37, 99, 235, 0.16)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section
        style={{
          borderRadius: '28px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.82)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '10px',
          maxHeight: '780px',
          overflow: 'auto',
        }}
      >
        {conversations.length ? (
          conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                style={{
                  width: '100%',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.28)' : '1px solid transparent',
                  borderRadius: '22px',
                  padding: '16px',
                  background: isActive
                    ? 'linear-gradient(180deg, rgba(239, 246, 255, 0.98) 0%, rgba(240, 253, 250, 0.98) 100%)'
                    : '#ffffff',
                  boxShadow: isActive
                    ? '0 16px 32px rgba(15, 23, 42, 0.08)'
                    : '0 10px 18px rgba(15, 23, 42, 0.04)',
                  display: 'grid',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '16px',
                        background: conversation.avatarGradient,
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '15px',
                        flexShrink: 0,
                        boxShadow: '0 12px 22px rgba(15, 23, 42, 0.12)',
                      }}
                    >
                      {conversation.avatar}
                    </div>

                    <div style={{ minWidth: 0, display: 'grid', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <strong
                          style={{
                            color: '#0f172a',
                            fontSize: '15px',
                            lineHeight: 1.3,
                          }}
                        >
                          {conversation.participantName}
                        </strong>
                        <span
                          style={{
                            width: '9px',
                            height: '9px',
                            borderRadius: '999px',
                            background: conversation.isOnline ? '#10b981' : '#cbd5e1',
                            boxShadow: conversation.isOnline ? '0 0 0 4px rgba(16, 185, 129, 0.12)' : 'none',
                          }}
                        />
                      </div>
                      <span style={{ color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
                        {conversation.role} | {conversation.skillTitle}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '8px', justifyItems: 'end', flexShrink: 0 }}>
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
                      {formatPreviewTime(conversation.lastMessageAt)}
                    </span>
                    {conversation.unreadCount ? (
                      <span
                        style={{
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '999px',
                          background: '#0f172a',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '0 6px',
                        }}
                      >
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '6px 10px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {conversation.distanceLabel}
                  </span>
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '6px 10px',
                      background: 'rgba(15, 23, 42, 0.06)',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {conversation.bookingStatus}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: '#475569',
                    lineHeight: 1.6,
                    fontSize: '14px',
                  }}
                >
                  {conversation.lastMessage}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{conversation.area}</span>
                  <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 700 }}>
                    {conversation.nextSlotLabel}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div
            style={{
              borderRadius: '22px',
              border: '1px dashed rgba(148, 163, 184, 0.3)',
              padding: '22px',
              display: 'grid',
              gap: '8px',
              color: '#475569',
              background: 'rgba(248, 250, 252, 0.9)',
            }}
          >
            <strong style={{ color: '#0f172a' }}>No conversation matches this view.</strong>
            <span>Try another search or switch the chat filter.</span>
          </div>
        )}
      </section>
    </aside>
  );
}
