import { useId } from 'react';
import './ui.css';

export function Spinner({ size = 18 }: { size?: number }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="status"
      aria-labelledby={id}
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <title id={id}>Loading…</title>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="4"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger' | 'ghost';
  busy?: boolean;
};

export function Button({ variant = 'primary', busy, children, style, ...rest }: ButtonProps) {
  const base = {
    primary: { bg: 'var(--scarlet)', hover: 'var(--scarlet-600)', color: '#fff' },
    danger: { bg: 'var(--err)', hover: '#b91c1c', color: '#fff' },
    ghost: { bg: 'transparent', hover: 'rgba(0,0,0,.06)', color: 'var(--ink)' },
  }[variant];

  return (
    <button
      {...rest}
      disabled={busy || rest.disabled}
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        background: rest.disabled ? 'rgba(0,0,0,.06)' : base.bg,
        color: rest.disabled ? 'rgba(0,0,0,.35)' : base.color,
        border: '1px solid rgba(0,0,0,.06)',
        fontWeight: 600,
        transition: 'background .15s ease, transform .04s ease',
        transform: busy ? 'scale(.99)' : 'none',
        ...(style || {}),
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(.98)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'none';
      }}
      onMouseEnter={(e) => {
        if (!rest.disabled && !busy)
          (e.currentTarget as HTMLButtonElement).style.background = base.hover;
      }}
      onMouseLeave={(e) => {
        if (!rest.disabled && !busy)
          (e.currentTarget as HTMLButtonElement).style.background = base.bg;
      }}
    >
      <div
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}
      >
        {busy && <Spinner />}
        <span>{children}</span>
      </div>
    </button>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        margin: 'min(8vw,48px) auto',
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: '24px 20px',
      }}
    >
      {children}
    </div>
  );
}

export function Banner({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'ok' | 'warn' | 'err';
  children: React.ReactNode;
}) {
  const map = {
    info: { bg: '#eef2ff', color: '#3730a3' },
    ok: { bg: '#ecfdf5', color: '#065f46' },
    warn: { bg: '#fffbeb', color: '#92400e' },
    err: { bg: '#fef2f2', color: '#991b1b' },
  }[tone];
  return (
    <div
      style={{
        background: map.bg,
        color: map.color,
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,.06)',
      }}
    >
      {children}
    </div>
  );
}
