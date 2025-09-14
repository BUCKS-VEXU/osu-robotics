import { useEffect, useState } from "react";
import useQuery from "./useQuery";
import { useParams } from "react-router-dom";

export default function PresenceTapPage() {
    const [me, setMe] = useState<{ authed: boolean;[key: string]: any }>({
        authed: false,
    });

    const q = useQuery();

    const { loc: locParam } = useParams<{ loc: string }>();
    const loc = (q.get("loc") || locParam || "").trim();

    useEffect(() => {
        async function init() {
            try {
                // 1) Always resolve user info first
                const meResp = await fetch("/auth/me");
                if (!meResp.ok) throw new Error("Auth failed");
                const meJson = await meResp.json();
                setMe({ ...meJson, authed: true });

                // 2) Then toggle presence
                if (loc) {
                    const tapResp = await fetch(`/api/presence/tap?loc=${encodeURIComponent(loc)}`);
                    // you can choose whether to ignore the result or display confirm page inline
                    if (!tapResp.ok) {
                        console.error("Tap failed", await tapResp.text());
                    }

                    console.log(await tapResp.text());
                }
            } catch (e) {
                console.error(e);
                setMe({ authed: false });
            }
        }

        init();
    }, [loc]);

    return (
        <div>
            {me.authed ? (
                <p>Hello {me.handle ?? "member"}!</p>
            ) : (
                <p>Please log in</p>
            )}
        </div>
    );
}
