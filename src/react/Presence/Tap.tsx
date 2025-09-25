import { useEffect, useState } from 'react';
import { Button, Card } from './ui';
import useQuery from './useQuery';
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';
import SuccessCheck from './SuccessCheck.json';

type Status = {
  isIn: boolean;
  location: string | null;
  since: string | null;
  user?: { id: string; handle?: string };
};

export default function PresenceTapPage() {
  const [me, setMe] = useState<{ authed: boolean; [key: string]: any }>({
    authed: false,
  });

  const [err, setErr] = useState<String>('');
  const [status, setStatus] = useState<Status | null>(null);

  const q = useQuery();
  const loc = (q.get('loc') || '').trim();

  useEffect(() => {
    async function init() {
      try {
        if (loc) {
          // 1) Always resolve user info first
          await fetch('/auth/me')
            .then((r) => r.json())
            .then(setMe)
            .catch(() => setMe({ authed: false }));

          // 2) Then toggle presence
          await fetch(`/api/presence/tap?loc=${encodeURIComponent(loc)}`)
            .then((r) => r.json())
            .then(setStatus);
        }
      } catch (e: any) {
        setErr(e?.message || 'Tap failed');
        setMe({ authed: false });
      }
    }

    init();
  }, [loc]);

  // Redirect to main presence page
  useEffect(() => {
    if (status?.user) {
      const t = setTimeout(() => {
        const inStandalone =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone;
        if (inStandalone) window.close();
        else window.location.replace('/presence');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  if (!me.authed) {
    return (
      <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: '24px' }}>
        <Card>
          <h1 style={{ fontSize: 28, margin: '0 0 6px' }}>BUCKS Presence</h1>
          <p style={{ color: 'var(--muted)', margin: '0 0 16px' }}>
            Sign in with Discord to continue.
          </p>
          <a href={`/auth/discord?returnTo=${encodeURIComponent(`/presence/tap?loc=${loc}`)}`}>
            <Button>Continue with Discord</Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {status?.user && (
        <>
          <Lottie
            animationData={SuccessCheck}
            play
            loop={false}
            style={{ width: '80svw', height: '80svh' }}
          />
          <h1>You're Checked {status.isIn ? 'In' : 'Out'}!</h1>
        </>
      )}
      {err != '' && (
        <div>
          <h1>Something's Wrong</h1>
          <h2>{err}</h2>
        </div>
      )}
    </div>
  );
}
