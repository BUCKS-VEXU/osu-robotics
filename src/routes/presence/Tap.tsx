import { useEffect, useState } from "react";
import useQuery from "./useQuery";
import Lottie from 'react-lottie-player/dist/LottiePlayerLight'
import SuccessCheck from './SuccessCheck.json'

type Status = {
    isIn: boolean;
    location: string | null;
    since: string | null;
    user?: { id: string; handle?: string };
};


export default function PresenceTapPage() {
    const [me, setMe] = useState<{ authed: boolean;[key: string]: any }>({
        authed: false,
    });

    const [err, setErr] = useState<String>("")
    const [status, setStatus] = useState<Status | null>(null);

    const q = useQuery();
    const loc = (q.get("loc") || "").trim();

    useEffect(() => {
        function timeout(delay: number) {
            return new Promise(res => setTimeout(res, delay));
        }

        async function init() {
            try {
                if (loc) {
                    // 1) Always resolve user info first
                    await fetch("/auth/me").then(r => r.json()).then(setMe).catch(() => setMe({ authed: false }));

                    // 2) Then toggle presence
                    await fetch(`/api/presence/tap?loc=${encodeURIComponent(loc)}`)
                        .then(r => r.json()).then(setStatus)
                }
            } catch (e: any) {
                setErr(e?.message || "Tap failed");
                setMe({ authed: false });
            }
        }

        init();
    }, [loc]);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {status?.user && (
                <>
                    <Lottie
                        animationData={SuccessCheck}
                        play
                        loop={false}
                        style={{ width: "80svw", height: "80svh" }}
                    />
                    <h1>You're Checked {(status.isIn ? "In" : "Out")}!</h1>
                </>
            )}
            {(err != "") && (
                <div>
                    <h1>Something's Wrong</h1>
                    <h2>{err}</h2>
                </div>
            )}
        </div>
    );
}
