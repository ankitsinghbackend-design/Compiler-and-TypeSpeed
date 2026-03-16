import { useEffect, useRef } from 'react';

export default function SupportModal({ open, loading, onRetry }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
      }
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(2px)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-notice-title"
        style={{
          background: '#ffffff',
          color: '#111827',
          padding: '32px',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textAlign: 'left'
        }}
      >
        <h2 
          id="support-notice-title"
          style={{
            margin: '0 0 16px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827'
          }}
        >
          Please support this free tool
        </h2>
        
        <p style={{ margin: '0 0 20px', lineHeight: '1.5', fontSize: '15px', color: '#4b5563' }}>
          It looks like a browser extension is preventing some resources from loading. 
          To keep these tools free for everyone, please whitelist this site and then click <strong>Retry</strong>.
        </p>

        <ul style={{ margin: '0 0 32px', paddingLeft: '24px', lineHeight: '1.6', fontSize: '15px', color: '#4b5563' }}>
          <li style={{ marginBottom: '8px' }}>Open your browser extension settings.</li>
          <li style={{ marginBottom: '8px' }}>Choose "Pause on this site" or "Allow".</li>
          <li>Click <strong>Retry</strong> below.</li>
        </ul>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={onRetry}
            disabled={loading}
            style={{
              background: loading ? '#059669' : '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Retrying...' : 'Retry'}
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '9px 24px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => window.open('https://help.getadblock.com/support/solutions/articles/6000067131-how-to-whitelist-a-website', '_blank')}
          >
            Help
          </button>
        </div>
      </div>
    </div>
  );
}
