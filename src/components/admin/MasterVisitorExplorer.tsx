"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    ChevronRight, 
    ChevronDown, 
    X, 
    Laptop, 
    Smartphone,
    Globe,
    Calendar,
    Clock,
    Cpu
} from "lucide-react";

type LeaderboardEntry = {
    id: number;
    name: string;
    score: number;
    game: string;
    date: string;
    deviceId?: string;
};

type VisitorSession = {
    session_id: string;
    device_id: string;
    route: string;
    share_token?: string | null;
    source?: string | null;
    session_label?: string | null;
    referrer?: string | null;
    browser?: string;
    os?: string;
    deviceType?: string;
    isBot?: boolean;
    city?: string;
    country?: string;
    hardware?: {
        connection: string;
        memory: string | number;
        cores: string | number;
    };
    maxScrollDepth?: number;
    sessionDuration?: number;
    rageClicks?: number;
    started_at: string;
    last_seen_at: string;
    view_count: number;
    link_clicks: number;
    game_opens: number;
    completed_runs: number;
    total_score: number;
    best_score?: number;
    games_played: string[];
    link_targets: string[];
    resume_opens: number;
    resume_downloads: number;
    contact_submissions: number;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    route_times?: Record<string, number>;
    recent_events?: Array<{
        at: string;
        type: string;
        route: string;
        label?: string | null;
        value?: string | number | null;
    }>;
};

type DeviceSummary = {
    deviceId: string;
    sessions: number;
    totalViews: number;
    totalLinkClicks: number;
    totalRuns: number;
    totalResumeDownloads: number;
    totalContacts: number;
    lastSeenAt: string;
    topRoutes?: string[];
    browser?: string;
    os?: string;
    deviceType?: string;
    ip?: string;
    city?: string;
    country?: string;
    isBot?: boolean;
    customName?: string;
    hardware?: {
        connection: string;
        memory: string | number;
        cores: string | number;
    };
};

type RouteStoryEntry = {
    route: string;
    sessions: number;
    views: number;
    links: number;
    runs: number;
    resumeDownloads: number;
    contacts: number;
    topSources: string[];
};

type MasterVisitorExplorerProps = {
    devices: DeviceSummary[];
    sessions: VisitorSession[];
    scores: LeaderboardEntry[];
    routeStory: RouteStoryEntry[];
    getAdminHeaders: (includeContentType?: boolean) => Record<string, string>;
    onRefresh: () => Promise<void>;
};

function formatLoc(city?: string, country?: string) {
    if (!city && !country) return "Unknown Location";
    const cleanCity = city ? decodeURIComponent(city).trim() : "";
    const cleanCountry = country ? decodeURIComponent(country).trim() : "";
    if (cleanCity && cleanCountry) return `${cleanCity}, ${cleanCountry}`;
    return cleanCity || cleanCountry;
}

function formatHardware(hw?: { memory: string | number; cores: string | number; connection: string; batteryLevel?: string; isCharging?: boolean; exactModel?: string; }) {
    if (!hw) return "Unknown hardware specs";
    
    let mem = String(hw.memory);
    if (mem.toLowerCase() === "unknown" || mem === "") {
        mem = "Unknown RAM";
    } else {
        mem = `${mem}GB RAM`;
    }

    let cores = String(hw.cores);
    if (cores.toLowerCase() === "unknown" || cores === "") {
        cores = "Unknown Cores";
    } else {
        cores = `${cores} Cores`;
    }

    let conn = hw.connection || "Unknown Network";
    
    let res = `${mem} · ${cores} · ${conn}`;
    if (hw.batteryLevel && hw.batteryLevel !== "unknown") {
        res += ` · 🔋 ${hw.batteryLevel} ${hw.isCharging ? '(Charging)' : ''}`;
    }
    if (hw.exactModel && hw.exactModel !== "unknown") {
        res += ` · 📱 ${hw.exactModel}`;
    }
    return res;
}

export function isLocalIp(ip?: string) {
    if (!ip) return false;
    const cleanIp = ip.trim().toLowerCase();
    return (
        cleanIp === "127.0.0.1" ||
        cleanIp === "::1" ||
        cleanIp === "localhost" ||
        cleanIp.startsWith("192.168.") ||
        cleanIp.startsWith("10.") ||
        cleanIp.startsWith("172.")
    );
}

function humanizeRoute(route: string) {
    if (route === "/social-only") return "Social Only";
    if (route === "/game-only") return "Game Only";
    if (route === "/arcade-only") return "Arcade Only";
    if (route === "/social") return "Social";
    if (route === "/game") return "Game";
    if (route === "/resume") return "Resume";
    if (route === "/contact") return "Contact";
    if (route === "/") return "Home";
    return route.replace(/^\//, "").replace(/-/g, " ") || "Unknown";
}

function normalizeReferrer(ref: string): string {
    if (!ref) return "Direct";
    const r = ref.toLowerCase();
    if (r.includes("instagram")) return "Instagram";
    if (r.includes("linkedin")) return "LinkedIn";
    if (r.includes("github")) return "GitHub";
    if (r.includes("twitter") || r.includes("t.co")) return "X (Twitter)";
    if (r.includes("vercel")) return "Vercel";
    if (r.includes("google")) return "Google";
    return ref;
}

export default function MasterVisitorExplorer({
    devices,
    sessions,
    scores,
    routeStory,
    getAdminHeaders,
    onRefresh
}: MasterVisitorExplorerProps) {

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "mobile" | "pc" | "bot">("all");
    const [activeRoute, setActiveRoute] = useState<string>("all");
    const [activeRef, setActiveRef] = useState<string>("all");
    const [expandedDeviceIds, setExpandedDeviceIds] = useState<Record<string, boolean>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const devicesPerPage = 12;
    const [sessionPages, setSessionPages] = useState<Record<string, number>>({});

    // IP Wiper state
    const [wipeIpInput, setWipeIpInput] = useState("");
    const [wipeConfirm, setWipeConfirm] = useState(false);
    const [wipeBusy, setWipeBusy] = useState(false);
    const [wipeResult, setWipeResult] = useState<{ success: boolean; msg: string } | null>(null);

    // Device Storyline state
    const [activeStoryDeviceId, setActiveStoryDeviceId] = useState<string | null>(null);
    const [storySessionPage, setStorySessionPage] = useState(1);
    const [deviceSidebarPage, setDeviceSidebarPage] = useState(1);
    const devicesPerSidebarPage = 12;

    const handleToggleExpand = (deviceId: string) => {
        setExpandedDeviceIds(prev => ({
            ...prev,
            [deviceId]: !prev[deviceId]
        }));
    };

    const handleWipeIp = async () => {
        const ip = wipeIpInput.trim();
        if (!ip) return;
        setWipeBusy(true);
        setWipeResult(null);
        try {
            const res = await fetch("/api/visitor-analytics", {
                method: "DELETE",
                headers: getAdminHeaders(true),
                body: JSON.stringify({ targetIp: ip }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setWipeResult({ success: true, msg: `✓ Wiped ${data.deletedDevices} device(s) and ${data.deletedSessions} session(s) for ${ip}` });
                setWipeIpInput("");
                setWipeConfirm(false);
                await onRefresh();
            } else {
                setWipeResult({ success: false, msg: data.error || "Failed to wipe." });
            }
        } catch {
            setWipeResult({ success: false, msg: "Network error — could not wipe." });
        } finally {
            setWipeBusy(false);
        }
    };

    const validDevices = useMemo(() => {
        return devices.filter(d => {
            const city = d.city ? decodeURIComponent(d.city).trim().toLowerCase() : "";
            const ip = d.ip || "";
            return city !== "la grange" && city !== "stockbridge" && ip !== "75.139.41.49";
        });
    }, [devices]);

    const validDeviceIds = useMemo(() => new Set(validDevices.map(d => d.deviceId)), [validDevices]);

    const validSessions = useMemo(() => {
        return sessions.filter(s => validDeviceIds.has(s.device_id));
    }, [sessions, validDeviceIds]);

    const dynamicRouteStory = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const s of validSessions) {
            counts[s.route] = (counts[s.route] || 0) + 1;
        }
        return Object.entries(counts).map(([route, count]) => ({ route, sessions: count })).sort((a, b) => b.sessions - a.sessions);
    }, [validSessions]);

    const refStory = useMemo(() => {
        const refs: Record<string, number> = {};
        for (const s of validSessions) {
            const r = normalizeReferrer(s.source || s.referrer || "");
            refs[r] = (refs[r] || 0) + 1;
        }
        return Object.entries(refs).map(([ref, count]) => ({ ref, count })).sort((a, b) => b.count - a.count);
    }, [validSessions]);

    const deviceStory = useMemo(() => {
        return validDevices.map(d => {
            const dSessions = validSessions.filter(s => s.device_id === d.deviceId);
            const routes = [...new Set(dSessions.map(s => s.route))];
            const games = [...new Set(dSessions.flatMap(s => s.games_played || []))];
            const city = d.city ? decodeURIComponent(d.city) : "";
            
            const totalViews = dSessions.reduce((acc, s) => acc + (s.view_count || 0), 0);
            const totalContacts = dSessions.reduce((acc, s) => acc + (s.contact_submissions || 0), 0);
            const totalDownloads = dSessions.reduce((acc, s) => acc + (s.resume_downloads || 0), 0);
            const gameOpens = dSessions.reduce((acc, s) => acc + (s.game_opens || 0), 0);
            const completedRuns = dSessions.reduce((acc, s) => acc + (s.completed_runs || 0), 0);
            const maxScore = Math.max(0, ...dSessions.map(s => s.best_score || s.total_score || 0));

            return {
                deviceId: d.deviceId,
                ip: d.ip || "—",
                city,
                browser: d.browser || "",
                os: d.os || "",
                deviceType: d.deviceType || "",
                isBot: d.isBot || false,
                sessions: dSessions.length,
                routes,
                games,
                totalViews,
                totalContacts,
                totalDownloads,
                gameOpens,
                completedRuns,
                maxScore,
                lastSeenAt: d.lastSeenAt || dSessions.sort((a,b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime())[0]?.last_seen_at
            };
        }).sort((a, b) => b.sessions - a.sessions);
    }, [validDevices, validSessions]);

    const deviceSidebarTotalPages = Math.max(1, Math.ceil(deviceStory.length / devicesPerSidebarPage));
    const paginatedDeviceStory = useMemo(() => {
        const page = Math.min(deviceSidebarPage, deviceSidebarTotalPages);
        const start = (page - 1) * devicesPerSidebarPage;
        return deviceStory.slice(start, start + devicesPerSidebarPage);
    }, [deviceStory, deviceSidebarPage, deviceSidebarTotalPages]);

    const selectedStoryDevice = useMemo(() => {
        return deviceStory.find(d => d.deviceId === activeStoryDeviceId) || null;
    }, [deviceStory, activeStoryDeviceId]);

    const selectedStorySessions = useMemo(() => {
        if (!activeStoryDeviceId) return [];
        return validSessions
            .filter(s => s.device_id === activeStoryDeviceId)
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }, [validSessions, activeStoryDeviceId]);

    const storySessionsPerPage = 5;
    const storyTotalSessionPages = Math.max(1, Math.ceil(selectedStorySessions.length / storySessionsPerPage));
    const paginatedStorySessions = useMemo(() => {
        const page = Math.min(storySessionPage, storyTotalSessionPages);
        const start = (page - 1) * storySessionsPerPage;
        return selectedStorySessions.slice(start, start + storySessionsPerPage);
    }, [selectedStorySessions, storySessionPage, storyTotalSessionPages]);

    const filteredDevices = useMemo(() => {
        return validDevices
            .filter(device => {
                if (activeTab === "bot" && !device.isBot) return false;
                if (activeTab === "mobile" && !(device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile"))) return false;
                if (activeTab === "pc" && (device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile") || device.isBot)) return false;

                if (activeRoute !== "all") {
                    const deviceSessions = validSessions.filter(s => s.device_id === device.deviceId);
                    if (!deviceSessions.some(s => s.route === activeRoute)) {
                        return false;
                    }
                }

                if (activeRef !== "all") {
                    const deviceSessions = validSessions.filter(s => s.device_id === device.deviceId);
                    if (!deviceSessions.some(s => {
                        return normalizeReferrer(s.source || s.referrer || "") === activeRef;
                    })) {
                        return false;
                    }
                }

                if (searchTerm.trim() !== "") {
                    const searchLower = searchTerm.toLowerCase();
                    const nameMatch = device.customName?.toLowerCase().includes(searchLower);
                    const idMatch = device.deviceId.toLowerCase().includes(searchLower);
                    const ipMatch = device.ip?.toLowerCase().includes(searchLower);
                    const locMatch = `${device.city} ${device.country}`.toLowerCase().includes(searchLower);
                    const techMatch = `${device.os} ${device.browser} ${device.deviceType}`.toLowerCase().includes(searchLower);
                    
                    return nameMatch || idMatch || ipMatch || locMatch || techMatch;
                }

                return true;
            })
            .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
    }, [validDevices, validSessions, searchTerm, activeTab, activeRoute, activeRef]);

    const totalPages = Math.max(1, Math.ceil(filteredDevices.length / devicesPerPage));
    const paginatedDevices = useMemo(() => {
        const page = Math.min(currentPage, totalPages);
        const start = (page - 1) * devicesPerPage;
        return filteredDevices.slice(start, start + devicesPerPage);
    }, [filteredDevices, currentPage, totalPages]);

    return (
        <div className="flex flex-col gap-8">
            <section className="bg-neutral-900/[0.12] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-6 flex flex-col gap-6 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Navigation */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">

                    {/* Device Type Filter */}
                    <h4 className="font-bold text-white text-lg tracking-wide border-b border-white/[0.05] pb-2">Device Type</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                        {(["all", "mobile", "pc", "bot"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                className={`py-2.5 text-xs font-black uppercase tracking-widest rounded-xl border transition-all duration-200 ${
                                    activeTab === tab
                                        ? "bg-white text-black border-white shadow-md"
                                        : "bg-neutral-950/60 border-white/[0.08] text-neutral-500 hover:text-white hover:border-white/20"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <h4 className="font-bold text-white text-lg tracking-wide border-b border-white/[0.05] pb-2 mt-2">Route Storyline</h4>
                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={() => { setActiveRoute("all"); setCurrentPage(1); }}
                            className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                                activeRoute === "all" ? "bg-[#38bdf8]/20 text-[#38bdf8] font-bold" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                            }`}
                        >
                            <span>All Routes</span>
                            <span className="bg-neutral-950 px-2 py-0.5 rounded-full text-[10px]">{validSessions.length}</span>
                        </button>
                        {dynamicRouteStory.map(route => (
                            <button
                                key={route.route}
                                onClick={() => { setActiveRoute(route.route); setCurrentPage(1); }}
                                className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                                    activeRoute === route.route ? "bg-[#38bdf8]/20 text-[#38bdf8] font-bold" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                                }`}
                            >
                                <span className="uppercase tracking-widest text-[11px] truncate max-w-[120px]" title={humanizeRoute(route.route)}>{humanizeRoute(route.route)}</span>
                                <span className="bg-neutral-950 px-2 py-0.5 rounded-full text-[10px]">{route.sessions}</span>
                            </button>
                        ))}
                    </div>

                    <h4 className="font-bold text-white text-lg tracking-wide border-b border-white/[0.05] pb-2 mt-4">Sources</h4>
                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={() => { setActiveRef("all"); setCurrentPage(1); }}
                            className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                                activeRef === "all" ? "bg-[#38bdf8]/20 text-[#38bdf8] font-bold" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                            }`}
                        >
                            <span>All Sources</span>
                            <span className="bg-neutral-950 px-2 py-0.5 rounded-full text-[10px]">{validSessions.length}</span>
                        </button>
                        {refStory.map(r => (
                            <button
                                key={r.ref}
                                onClick={() => { setActiveRef(r.ref); setCurrentPage(1); }}
                                className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                                    activeRef === r.ref ? "bg-[#38bdf8]/20 text-[#38bdf8] font-bold" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                                }`}
                            >
                                <span className="uppercase tracking-widest text-[11px] max-w-[140px] truncate" title={r.ref}>{r.ref}</span>
                                <span className="bg-neutral-950 px-2 py-0.5 rounded-full text-[10px]">{r.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col gap-5 min-w-0">
                    <div className="border-b border-white/[0.05] pb-4">
                        {/* Search — full width */}
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by IP, city, OS, browser..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full h-11 bg-neutral-900 border border-white/[0.10] rounded-xl pl-11 pr-10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#38bdf8]/60 transition-colors shadow-inner"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-0 border border-white/[0.08] rounded-2xl overflow-hidden bg-neutral-950/30 shadow-xl relative">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_1.2fr_1fr_120px] gap-4 p-4 border-b border-white/[0.08] bg-neutral-900/60 text-xs font-black uppercase tracking-widest text-neutral-500">
                            <div>Profile & Device</div>
                            <div>Location & Network</div>
                            <div>Engagement</div>
                            <div className="text-right">Activity</div>
                        </div>

                        {filteredDevices.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500 text-sm">
                                No visitor profiles match your search criteria.
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-white/[0.04]">
                                {paginatedDevices.map((device) => {
                                    const deviceSessions = sessions.filter((s) => s.device_id === device.deviceId);
                                    const isExpanded = expandedDeviceIds[device.deviceId] || false;
                                    const profileName = `${device.os || "Apple"} Profile`;
                                    const isMobile = device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile");

                                    // Local session pagination for expanded view
                                    const sessionPage = sessionPages[device.deviceId] || 1;
                                    const sessionsPerPage = 3;
                                    const totalSessionPages = Math.max(1, Math.ceil(deviceSessions.length / sessionsPerPage));
                                    const paginatedSessions = deviceSessions.slice(
                                        (sessionPage - 1) * sessionsPerPage,
                                        sessionPage * sessionsPerPage
                                    );

                                    return (
                                        <div key={device.deviceId} className="flex flex-col hover:bg-white/[0.02] transition-colors">
                                            {/* Table Row */}
                                            <div 
                                                onClick={() => handleToggleExpand(device.deviceId)}
                                                className="grid grid-cols-[1fr_1.2fr_1fr_120px] gap-4 p-4 items-center cursor-pointer"
                                            >
                                                {/* Profile Col */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-[#fca5a5] text-sm tracking-wide uppercase truncate">
                                                            {profileName}
                                                        </span>
                                                        {device.isBot && <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Bot</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
                                                        {isMobile ? <Smartphone className="w-3.5 h-3.5 text-[#a78bfa]" /> : <Laptop className="w-3.5 h-3.5 text-[#38bdf8]" />}
                                                        <span className="truncate">{device.deviceType || "Desktop"} · {device.browser}</span>
                                                    </div>
                                                </div>

                                                {/* Location Col */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 text-neutral-300 text-sm truncate">
                                                        <Globe className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                                                        <span className="truncate">{formatLoc(device.city, device.country)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                                                        <span className="truncate">{device.ip || "Unknown IP"}</span>
                                                    </div>
                                                </div>

                                                {/* Engagement Col */}
                                                <div className="flex flex-col gap-1 min-w-0 justify-center">
                                                    <div className="flex gap-2 text-xs font-bold text-neutral-300">
                                                        <span title="Sessions">{deviceSessions.length} sesh</span>
                                                        <span className="text-neutral-600">·</span>
                                                        <span title="Page Views">{device.totalViews} views</span>
                                                    </div>
                                                    <div className="flex gap-2 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
                                                        {device.totalRuns > 0 && <span className="text-amber-400">{device.totalRuns} runs</span>}
                                                        {device.totalContacts > 0 && <span className="text-pink-400">{device.totalContacts} msg</span>}
                                                    </div>
                                                </div>

                                                {/* Activity Col */}
                                                <div className="flex flex-col items-end gap-1 text-right">
                                                    <div className="text-white text-xs font-medium">
                                                        {new Date(device.lastSeenAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-neutral-500 text-xs">
                                                        {new Date(device.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Drawer */}
                                            {isExpanded && (
                                                <div className="p-5 bg-neutral-950/60 border-t border-white/[0.04] flex flex-col gap-5 shadow-[inset_0_4px_24px_rgba(0,0,0,0.2)]">
                                                    
                                                    {/* Hardware Specs row */}
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium bg-neutral-900/50 px-3 py-2 rounded-lg border border-white/[0.04]">
                                                        <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                                                        <span>System Hardware:</span>
                                                        <span className="text-neutral-300">{formatHardware(device.hardware)}</span>
                                                    </div>

                                                    <div className="flex flex-col gap-3.5">
                                                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-[#4ADE80]">
                                                                Activity Logs
                                                            </h4>
                                                            
                                                            {totalSessionPages > 1 && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSessionPages(prev => ({
                                                                                ...prev,
                                                                                [device.deviceId]: Math.max(1, (prev[device.deviceId] || 1) - 1)
                                                                            }));
                                                                        }}
                                                                        disabled={sessionPage === 1}
                                                                        className="px-2.5 py-1 bg-neutral-900 text-xs text-neutral-400 hover:text-white rounded border border-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
                                                                    >
                                                                        Prev
                                                                    </button>
                                                                    <span className="text-[10px] text-neutral-500 font-bold uppercase">
                                                                        {sessionPage} / {totalSessionPages}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSessionPages(prev => ({
                                                                                ...prev,
                                                                                [device.deviceId]: Math.min(totalSessionPages, (prev[device.deviceId] || 1) + 1)
                                                                            }));
                                                                        }}
                                                                        disabled={sessionPage === totalSessionPages}
                                                                        className="px-2.5 py-1 bg-neutral-900 text-xs text-neutral-400 hover:text-white rounded border border-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed"
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {deviceSessions.length === 0 ? (
                                                            <div className="py-4 text-center text-neutral-600 text-xs">
                                                                No session logs stored for this profile.
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                                {paginatedSessions.map((session) => (
                                                                    <div key={session.session_id} className="p-4 rounded-xl border border-white/[0.04] bg-neutral-900/40 flex flex-col gap-3">
                                                                        <div className="flex flex-wrap justify-between items-start gap-2">
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <strong className="text-white text-xs font-bold flex items-center gap-2">
                                                                                    {session.session_label?.trim() || "Session"}
                                                                                </strong>
                                                                                <span className="text-neutral-500 text-[10px] flex items-center gap-1.5 mt-0.5">
                                                                                    <Calendar className="w-3 h-3" />
                                                                                    {new Date(session.started_at).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-white/[0.05]">
                                                                                Source: {session.utm_source || session.source || session.referrer || "direct"}
                                                                            </span>
                                                                            {session.utm_campaign && (
                                                                                <span className="text-[10px] text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded border border-[#4ADE80]/20 font-bold uppercase tracking-wider">
                                                                                    {session.utm_campaign}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex flex-wrap gap-2.5 text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                                                                            <span className="bg-neutral-950/80 px-2 py-1 border border-white/[0.04] rounded text-emerald-400">
                                                                                Time Spent: {session.sessionDuration || 0}s
                                                                            </span>
                                                                        </div>

                                                                        <div className="text-[11px] text-neutral-400 leading-normal flex flex-col gap-1.5 mt-2">
                                                                            <span className="font-extrabold text-neutral-500 uppercase tracking-widest text-[9px]">Active Dwell Time by Route:</span>
                                                                            {session.route_times && Object.keys(session.route_times).length > 0 ? (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {Object.entries(session.route_times).sort((a, b) => b[1] - a[1]).map(([r, time]) => (
                                                                                        <span key={r} className="bg-neutral-950/80 px-2 py-1 border border-white/[0.04] rounded text-emerald-400 font-mono text-[9px]">
                                                                                            {humanizeRoute(r.replace(/_/g, '/'))}: {time}s
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-neutral-600 text-xs italic">No route dwell times recorded yet.</span>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        <div className="text-[11px] text-neutral-400 leading-normal flex flex-col gap-1.5 mt-2">
                                                                            <span className="font-extrabold text-neutral-500 uppercase tracking-widest text-[9px]">Activity Log:</span>
                                                                            {session.recent_events && session.recent_events.length > 0 ? (
                                                                                <div className="flex flex-col gap-1 pl-2 border-l-2 border-neutral-800">
                                                                                    {session.recent_events.map((ev, i) => (
                                                                                        <div key={i} className="flex justify-between items-center bg-neutral-950/40 px-2 py-1 rounded hover:bg-neutral-900/60 transition-colors">
                                                                                            <span className="text-white font-medium truncate pr-2">{ev.route} <span className="text-neutral-600 font-normal">({ev.type})</span></span>
                                                                                            <span className="text-neutral-500 text-[9px] font-mono shrink-0">{new Date(ev.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-neutral-600 text-xs italic">No specific page activity recorded.</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-3 px-2 py-3 border-t border-white/[0.06]">
                            <p className="text-sm text-neutral-400">
                                Showing{" "}
                                <span className="text-white font-bold">{Math.min(filteredDevices.length, (currentPage - 1) * devicesPerPage + 1)}</span>
                                {" – "}
                                <span className="text-white font-bold">{Math.min(filteredDevices.length, currentPage * devicesPerPage)}</span>
                                {" of "}
                                <span className="text-[#38bdf8] font-black">{filteredDevices.length}</span>
                                {" visitors"}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-800 border border-white/[0.10] text-white hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum = i + 1;
                                    if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    if (pageNum <= 0 || pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                currentPage === pageNum
                                                    ? "bg-[#38bdf8] text-neutral-950 shadow-md"
                                                    : "bg-neutral-800 border border-white/[0.10] text-neutral-300 hover:text-white hover:bg-neutral-700"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-800 border border-white/[0.10] text-white hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </section>

            {/* ── Device Storyline ────────────────────────── */}
            <section className="bg-neutral-900/[0.12] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-6 flex flex-col gap-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-white tracking-wide">Device Storyline</h3>
                        <span className="bg-neutral-950/60 border border-white/[0.08] px-3 py-1 rounded-full text-xs text-neutral-400 font-medium">
                            {validDevices.length} Total Devices
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
                    {/* Left Pane: Device List */}
                    <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.05] pb-6 md:pb-0 md:pr-6">
                        <div className="flex flex-col gap-2">
                            {paginatedDeviceStory.map(d => (
                                <button
                                    key={d.deviceId}
                                    onClick={() => {
                                        setActiveStoryDeviceId(d.deviceId);
                                        setStorySessionPage(1);
                                    }}
                                    className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border text-left transition-all ${
                                        activeStoryDeviceId === d.deviceId 
                                            ? "bg-[#38bdf8]/10 border-[#38bdf8]/30 shadow-inner" 
                                            : "bg-neutral-950/50 border-white/[0.05] hover:bg-neutral-900/50 hover:border-white/[0.1]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            {d.isBot ? (
                                                <Cpu className="w-4 h-4 text-red-400" />
                                            ) : d.deviceType?.toLowerCase().includes("iphone") || d.deviceType?.toLowerCase().includes("android") || d.deviceType?.toLowerCase().includes("mobile") ? (
                                                <Smartphone className="w-4 h-4 text-[#a78bfa]" />
                                            ) : (
                                                <Laptop className="w-4 h-4 text-[#38bdf8]" />
                                            )}
                                            <span className={`font-mono text-sm font-bold truncate ${activeStoryDeviceId === d.deviceId ? "text-[#38bdf8]" : "text-white"}`}>
                                                {d.ip}
                                            </span>
                                        </div>
                                        <span className={`${activeStoryDeviceId === d.deviceId ? 'bg-[#38bdf8] text-neutral-950' : 'bg-white/10 text-white'} px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0`}>
                                            {d.sessions}
                                        </span>
                                    </div>
                                    <span className="text-xs text-neutral-400 truncate">
                                        {[d.city, d.os, d.browser].filter(Boolean).join(" · ") || "Unknown Device"}
                                    </span>
                                    <span className="text-[10px] text-neutral-500 mt-1">
                                        Last seen: {new Date(d.lastSeenAt).toLocaleDateString()}
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        {/* Device List Pagination */}
                        {deviceSidebarTotalPages > 1 && (
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/[0.05]">
                                <button
                                    onClick={() => setDeviceSidebarPage(p => Math.max(1, p - 1))}
                                    disabled={deviceSidebarPage === 1}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 border border-white/[0.1] text-white hover:bg-neutral-800 disabled:opacity-30 transition-all"
                                >
                                    Prev
                                </button>
                                <span className="text-xs text-neutral-500 font-medium">{deviceSidebarPage} / {deviceSidebarTotalPages}</span>
                                <button
                                    onClick={() => setDeviceSidebarPage(p => Math.min(deviceSidebarTotalPages, p + 1))}
                                    disabled={deviceSidebarPage === deviceSidebarTotalPages}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 border border-white/[0.1] text-white hover:bg-neutral-800 disabled:opacity-30 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Pane: Activity Detail */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        {selectedStoryDevice ? (
                            <div className="flex flex-col gap-6">
                                {/* Aggregate Summary */}
                                <div className="bg-neutral-950/40 border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
                                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                        {selectedStoryDevice.games.length > 0 && (
                                            <span className="text-neutral-400 flex items-center gap-2">
                                                Games played: <strong className="text-emerald-400">{selectedStoryDevice.games.join(', ')}</strong>
                                            </span>
                                        )}
                                        {selectedStoryDevice.maxScore > 0 && (
                                            <span className="text-neutral-400 flex items-center gap-2">
                                                High Score: <strong className="text-yellow-400">{selectedStoryDevice.maxScore}</strong>
                                            </span>
                                        )}
                                        {selectedStoryDevice.totalContacts > 0 && (
                                            <span className="text-neutral-400 flex items-center gap-2">
                                                Messages: <strong className="text-white">{selectedStoryDevice.totalContacts}</strong>
                                            </span>
                                        )}
                                        {selectedStoryDevice.totalDownloads > 0 && (
                                            <span className="text-neutral-400 flex items-center gap-2">
                                                Resume DLs: <strong className="text-white">{selectedStoryDevice.totalDownloads}</strong>
                                            </span>
                                        )}
                                        {/* If no major actions, show simple views summary */}
                                        {selectedStoryDevice.games.length === 0 && selectedStoryDevice.totalContacts === 0 && selectedStoryDevice.totalDownloads === 0 && (
                                            <span className="text-neutral-400 flex items-center gap-2">
                                                Total Page Views: <strong className="text-white">{selectedStoryDevice.totalViews}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStoryDevice.routes.map(r => (
                                            <span key={r} className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs text-neutral-300">
                                                {humanizeRoute(r)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Sessions Timeline */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-white font-bold tracking-wide flex justify-between items-center">
                                        Session Timeline
                                        <span className="text-xs text-neutral-500 font-normal">{selectedStorySessions.length} total sessions</span>
                                    </h4>
                                    
                                    <div className="flex flex-col gap-0">
                                        {paginatedStorySessions.map((session, idx) => (
                                            <div key={session.session_id} className="flex gap-4 group">
                                                {/* Timeline Line */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]/50 border-2 border-[#38bdf8] mt-1.5 group-hover:bg-[#38bdf8] transition-colors shrink-0" />
                                                    {idx < paginatedStorySessions.length - 1 && <div className="w-px h-full bg-white/[0.05] mt-2 group-hover:bg-white/[0.1] transition-colors" />}
                                                </div>
                                                
                                                {/* Session Details */}
                                                <div className="flex-1 bg-neutral-950/30 border border-white/[0.05] rounded-2xl p-4 mb-3 flex flex-col gap-2 hover:bg-neutral-900/50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-bold text-white">{humanizeRoute(session.route)}</span>
                                                        <span className="text-xs text-neutral-500 font-mono">
                                                            {new Date(session.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                                        <span className="text-neutral-400">Views: <strong className="text-neutral-200">{session.view_count}</strong></span>
                                                        {(session.sessionDuration || 0) > 0 && (
                                                            <span className="text-neutral-400">Time: <strong className="text-neutral-200">{Math.round(session.sessionDuration! / 1000)}s</strong></span>
                                                        )}
                                                        {session.source && (
                                                            <span className="text-neutral-400">From: <strong className="text-neutral-200">{normalizeReferrer(session.source)}</strong></span>
                                                        )}
                                                        {(session.completed_runs || 0) > 0 && (
                                                            <span className="text-emerald-400 font-medium">Played {session.completed_runs} rounds</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Session Pagination */}
                                    {storyTotalSessionPages > 1 && (
                                        <div className="flex justify-between items-center pt-2">
                                            <button
                                                onClick={() => setStorySessionPage(p => Math.max(1, p - 1))}
                                                disabled={storySessionPage === 1}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 border border-white/[0.1] text-white hover:bg-neutral-800 disabled:opacity-30 transition-all"
                                            >
                                                Prev
                                            </button>
                                            <span className="text-xs text-neutral-500 font-medium">{storySessionPage} / {storyTotalSessionPages}</span>
                                            <button
                                                onClick={() => setStorySessionPage(p => Math.min(storyTotalSessionPages, p + 1))}
                                                disabled={storySessionPage === storyTotalSessionPages}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 border border-white/[0.1] text-white hover:bg-neutral-800 disabled:opacity-30 transition-all"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/[0.05] rounded-3xl p-10 min-h-[300px]">
                                <span className="text-neutral-500 text-sm font-medium">Select a device from the left to view its activity storyline</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── IP Wiper ────────────────────────────────── */}
            <div className="border border-red-500/20 rounded-2xl p-5 bg-red-950/10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <h4 className="font-black text-sm uppercase tracking-widest text-red-400">Wipe IP Data</h4>
                    <span className="text-xs text-neutral-500 ml-auto">Deletes all devices + sessions for a given IP from the database</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Paste IP address e.g. 75.139.41.49"
                        value={wipeIpInput}
                        onChange={e => { setWipeIpInput(e.target.value); setWipeConfirm(false); setWipeResult(null); }}
                        className="flex-1 h-11 bg-neutral-950/60 border border-red-500/20 rounded-xl px-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/60 transition-colors font-mono"
                    />
                    {!wipeConfirm ? (
                        <button
                            onClick={() => { if (wipeIpInput.trim()) setWipeConfirm(true); }}
                            disabled={!wipeIpInput.trim()}
                            className="h-11 px-5 rounded-xl text-sm font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                        >
                            Delete IP
                        </button>
                    ) : (
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={handleWipeIp}
                                disabled={wipeBusy}
                                className="h-11 px-5 rounded-xl text-sm font-black bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition-all shrink-0"
                            >
                                {wipeBusy ? "Wiping…" : `⚠ Confirm — Wipe ${wipeIpInput.trim()}`}
                            </button>
                            <button
                                onClick={() => setWipeConfirm(false)}
                                className="h-11 px-4 rounded-xl text-sm font-bold border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {wipeResult && (
                    <p className={`text-sm font-semibold ${wipeResult.success ? "text-emerald-400" : "text-red-400"}`}>
                        {wipeResult.msg}
                    </p>
                )}
            </div>
        </div>
    );
}
