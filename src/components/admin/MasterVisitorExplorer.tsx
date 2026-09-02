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

    const handleToggleExpand = (deviceId: string) => {
        setExpandedDeviceIds(prev => ({
            ...prev,
            [deviceId]: !prev[deviceId]
        }));
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
                        const src = s.source || s.referrer || "direct";
                        return src === activeRef;
                    })) {
                        return false;
                    }
                }

                if (searchTerm.trim() !== "") {
                    const searchLower = searchTerm.toLowerCase();
                    const nameMatch = device.customName?.toLowerCase().includes(searchLower);
                    const idMatch = device.deviceId.toLowerCase().includes(searchLower);
                    const ipMatch = device.ip?.toLowerCase().includes(searchLower);
                    const cityMatch = device.city ? decodeURIComponent(device.city).toLowerCase().includes(searchLower) : false;
                    const osMatch = device.os?.toLowerCase().includes(searchLower);
                    const browserMatch = device.browser?.toLowerCase().includes(searchLower);

                    return nameMatch || idMatch || ipMatch || cityMatch || osMatch || browserMatch;
                }

                return true;
            })
            .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
    }, [devices, sessions, searchTerm, activeTab, activeRoute, activeRef]);

    const totalPages = Math.max(1, Math.ceil(filteredDevices.length / devicesPerPage));
    const paginatedDevices = useMemo(() => {
        const page = Math.min(currentPage, totalPages);
        const start = (page - 1) * devicesPerPage;
        return filteredDevices.slice(start, start + devicesPerPage);
    }, [filteredDevices, currentPage, totalPages]);

    return (
        <section className="bg-neutral-900/[0.12] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-6 flex flex-col gap-6 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Navigation */}
                <div className="w-full md:w-56 shrink-0 flex flex-col gap-3">
                    <h4 className="font-bold text-white text-lg tracking-wide border-b border-white/[0.05] pb-2">Route Storyline</h4>
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
                    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-white/[0.05] pb-4">
                        <div className="flex bg-neutral-950/60 p-1 rounded-xl border border-white/[0.08]">
                            {(["all", "mobile", "pc", "bot"] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                                        activeTab === tab ? "bg-white/[0.1] text-white" : "text-neutral-500 hover:text-neutral-300"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div className="relative min-w-[240px]">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search IP, location, OS..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-neutral-950/60 border border-white/[0.1] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#4ADE80] transition-colors"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm("")} 
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white"
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
                        <div className="flex justify-between items-center text-sm text-neutral-400 mt-2 px-2">
                            <div>
                                Showing <strong className="text-white">{Math.min(filteredDevices.length, (currentPage - 1) * devicesPerPage + 1)}</strong> -{" "}
                                <strong className="text-white">{Math.min(filteredDevices.length, currentPage * devicesPerPage)}</strong> of{" "}
                                <strong className="text-white">{filteredDevices.length}</strong>
                            </div>

                            {/* Standard Page Number Buttons */}
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-neutral-950 border border-white/[0.08] text-neutral-300 hover:text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-900/60 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum = currentPage;
                                    if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    
                                    if (pageNum <= 0 || pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                                currentPage === pageNum 
                                                    ? "bg-[#38bdf8] text-black" 
                                                    : "bg-neutral-950 border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-neutral-950 border border-white/[0.08] text-neutral-300 hover:text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-900/60 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
