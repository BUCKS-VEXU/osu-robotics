/* Noah Klein */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

type Status = {
    isIn: boolean;
    location: string | null;
    since: string | null; // ISO datetime or null
};

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

function fmtDurationSince(iso?: string | null) {
    if (!iso) return "";
    const start = new Date(iso).getTime();
    const now = Date.now();
    const mins = Math.max(0, Math.floor((now - start) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
}

export default function PresencePage() {
    const q = useQuery();
    const params = useParams<{ loc: string }>();
    const loc = (q.get("loc") || params.loc || "").trim().toLowerCase();

    const [status, setStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    // soft refresh of the elapsed timer
    useEffect(() => {
        const id = setInterval(() => setTick((x) => x + 1), 30_000);
        return () => clearInterval(id);
    }, []);

    async function refresh() {
        setErr(null);
        try {
            const r = await fetch("/api/status");
            const j = (await r.json()) as Status;
            setStatus(j);
        } catch (e: any) {
            setErr(e?.message || "Failed to load status");
        }
    }

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loc]);

    async function checkIn() {
        if (!loc) return setErr("Missing location.");
        setLoading(true);
        setErr(null);
        try {
            const r = await fetch("/api/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locationId: loc, source: "qr", }),
            });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                throw new Error(j.error || `Check-in failed (${r.status})`);
            }
            await refresh();
        } catch (e: any) {
            setErr(e?.message || "Check-in failed");
        } finally {
            setLoading(false);
        }
    }

    async function checkOut() {
        setLoading(true);
        setErr(null);
        try {
            const r = await fetch("/api/checkout", { method: "POST" });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                throw new Error(j.error || `Check-out failed (${r.status})`);
            }
            await refresh();
        } catch (e: any) {
            setErr(e?.message || "Check-out failed");
        } finally {
            setLoading(false);
        }
    }

    const title = loc ? `Check In · ${loc}` : "Check In";

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
                <h1 className="text-2xl font-semibold mb-1">{title}</h1>
                <p className="text-sm text-gray-500 mb-4">
                    Scan the QR when you enter/leave. (Auth coming soon.)
                </p>

                {err && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                        {err}
                    </div>
                )}

                {!status ? (
                    <p className="text-gray-600">Loading…</p>
                ) : status.isIn ? (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="font-medium">
                                You’re checked in{status.location ? ` at ${status.location}` : ""}.
                            </p>
                            <p className="text-sm text-green-800">
                                On site: {fmtDurationSince(status.since)} {tick ? "" : ""}
                            </p>
                        </div>
                        <button
                            onClick={checkOut}
                            disabled={loading}
                            className="w-full rounded-xl py-3 font-medium bg-red-600 text-white disabled:opacity-60"
                        >
                            {loading ? "Checking out…" : "Check Out"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                            <p className="font-medium">You’re currently not checked in.</p>
                            {!loc && (
                                <p className="text-sm text-yellow-800">
                                    Add <code>?loc=workshop</code> or use <code>/p/workshop</code>.
                                </p>
                            )}
                        </div>
                        <button
                            onClick={checkIn}
                            disabled={loading || !loc}
                            className="w-full rounded-xl py-3 font-medium bg-green-600 text-white disabled:opacity-60"
                        >
                            {loading ? "Checking in…" : `Check In${loc ? ` to ${loc}` : ""}`}
                        </button>
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-500">
                    Tip: QR can point to <code>/p/workshop</code> (short) or
                    <code> /presence?loc=workshop</code> (verbose).
                </div>
            </div>
        </div>
    );
}
