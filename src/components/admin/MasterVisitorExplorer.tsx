
"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    ChevronRight, 
    ChevronLeft,
    Laptop, 
    Smartphone,
    Globe,
    Cpu,
    Trash2,
    Activity,
    Clock, Gamepad2, Eye, MousePointerClick, MapPin, CalendarDays, RefreshCw,
    Filter,
    ShieldAlert
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
    isSuspicious?: boolean;
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
    if (!city && !country) return "Unknown";
    const cleanCity = city ? decodeURIComponent(city).trim() : "";
    const cleanCountry = country ? decodeURIComponent(country).trim() : "";
    if (cleanCity && cleanCountry) return `${cleanCity}, ${cleanCountry}`;
    return cleanCity || cleanCountry;
}

function formatHardware(hw?: any) {
    if (!hw) return "Unknown hardware specs";
    let mem = String(hw.memory);
    mem = (mem.toLowerCase() === "unknown" || mem === "") ? "Unknown RAM" : `${mem}GB RAM`;
    let cores = String(hw.cores);
    cores = (cores.toLowerCase() === "unknown" || cores === "") ? "Unknown Cores" : `${cores} Cores`;
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

function humanizeRoute(route: string) {
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
    getAdminHeaders,
    onRefresh
}: MasterVisitorExplorerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "mobile" | "pc" | "bot">("all");
    
    // Pagination for Y Box
    const [yPage, setYPage] = useState(1);
    const devicesPerPage = 10;

    // Pagination for Z Box
    const [zPage, setZPage] = useState(1);
    const sessionsPerPage = 5;

    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

    // Filtering out the owner IPs or whatever was hardcoded
    const validDevices = useMemo(() => {
        return devices.filter(d => {
            const city = d.city ? decodeURIComponent(d.city).trim().toLowerCase() : "";
            const ip = d.ip || "";
            return city !== "la grange" && city !== "stockbridge" && ip !== "75.139.41.49";
        });
    }, [devices]);

    const filteredDevices = useMemo(() => {
        return validDevices
            .filter(device => {
                if (activeTab === "bot" && !device.isBot) return false;
                const isMob = device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile");
                if (activeTab === "mobile" && !isMob) return false;
                if (activeTab === "pc" && (isMob || device.isBot)) return false;

                if (searchTerm.trim() !== "") {
                    const searchLower = searchTerm.toLowerCase();
                    const nameMatch = device.customName?.toLowerCase().includes(searchLower);
                    const ipMatch = device.ip?.toLowerCase().includes(searchLower);
                    const locMatch = `${device.city} ${device.country}`.toLowerCase().includes(searchLower);
                    const techMatch = `${device.os} ${device.browser} ${device.deviceType}`.toLowerCase().includes(searchLower);
                    return nameMatch || ipMatch || locMatch || techMatch;
                }
                return true;
            })
            .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
    }, [validDevices, searchTerm, activeTab]);

    const yTotalPages = Math.max(1, Math.ceil(filteredDevices.length / devicesPerPage));
    const paginatedDevices = useMemo(() => {
        const page = Math.min(yPage, yTotalPages);
        const start = (page - 1) * devicesPerPage;
        return filteredDevices.slice(start, start + devicesPerPage);
    }, [filteredDevices, yPage, yTotalPages]);

    const activeDevice = useMemo(() => {
        return validDevices.find(d => d.deviceId === activeDeviceId) || paginatedDevices[0] || null;
    }, [validDevices, activeDeviceId, paginatedDevices]);

    const activeDeviceSessions = useMemo(() => {
        if (!activeDevice) return [];
        return sessions
            .filter(s => s.device_id === activeDevice.deviceId)
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }, [sessions, activeDevice]);

    const zTotalPages = Math.max(1, Math.ceil(activeDeviceSessions.length / sessionsPerPage));
    const paginatedSessions = useMemo(() => {
        const page = Math.min(zPage, zTotalPages);
        const start = (page - 1) * sessionsPerPage;
        return activeDeviceSessions.slice(start, start + sessionsPerPage);
    }, [activeDeviceSessions, zPage, zTotalPages]);

    const handleWipeSpecificIp = async (ip: string) => {
        if (!ip) return;
        if (!confirm(`Are you sure you want to delete all data for IP: ${ip}?`)) return;
        
        try {
            const res = await fetch("/api/visitor-analytics", {
                method: "DELETE",
                headers: getAdminHeaders(true),
                body: JSON.stringify({ targetIp: ip }),
            });
            if (res.ok) {
                await onRefresh();
            } else {
                alert("Failed to wipe IP");
            }
        } catch {
            alert("Network error while wiping IP");
        }
    };

    return (
        <div className="flex flex-col gap-6 font-sans">
            {/* X BOX: Top Stats & Filters */}
            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white tracking-wide">Traffic Explorer</h2>
                        <span className="bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-lg text-xs text-neutral-300 font-medium">
                            {filteredDevices.length} Results
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search IP, OS, location..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setYPage(1);
                                }}
                                className="w-full h-10 bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                        <div className="flex bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl p-1 shrink-0">
                            {(["all", "mobile", "pc", "bot"] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setYPage(1); }}
                                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                        activeTab === tab 
                                            ? "bg-neutral-700 text-white shadow-sm" 
                                            : "text-neutral-500 hover:text-neutral-300"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN LAYOUT: Y BOX (Left) and Z BOX (Right) */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Y BOX: Sidebar List */}
                <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4">
                    <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-2 min-h-[500px]">
                        {paginatedDevices.map(device => {
                            const isMob = device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile");
                            const isActive = activeDevice?.deviceId === device.deviceId;
                            return (
                                <button
                                    key={device.deviceId}
                                    onClick={() => { setActiveDeviceId(device.deviceId); setZPage(1); }}
                                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                                        isActive 
                                            ? "bg-indigo-500/10 border-indigo-500/40 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] ring-1 ring-indigo-500/20" 
                                            : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] hover:shadow-lg hover:shadow-black/20"
                                    }`}
                                >
                                    <div className="mt-1">
                                        {device.isBot ? (
                                            <Cpu className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-400'}`} />
                                        ) : isMob ? (
                                            <Smartphone className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-400'}`} />
                                        ) : (
                                            <Laptop className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-400'}`} />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm truncate">
                                                {device.os || "Apple"} Profile
                                            </span>
                                            {device.isBot && <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Bot</span>}
                                            {device.isSuspicious && <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Sus</span>}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate">
                                            <Globe className="w-3 h-3" />
                                            <span className="truncate">{formatLoc(device.city, device.country)}</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-neutral-500">{device.ip}</div>
                                    </div>
                                </button>
                            );
                        })}
                        {paginatedDevices.length === 0 && (
                            <div className="py-12 text-center text-sm text-neutral-500">No visitors found.</div>
                        )}
                    </div>
                    
                    {/* Y Pagination */}
                    {yTotalPages > 1 && (
                        <div className="flex items-center justify-between bg-neutral-800 border border-neutral-700/50 rounded-xl p-2 px-4">
                            <button 
                                onClick={() => setYPage(p => Math.max(1, p - 1))}
                                disabled={yPage === 1}
                                className="p-1.5 hover:bg-neutral-700 rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-xs font-bold text-neutral-400 tracking-widest">
                                PAGE {yPage} / {yTotalPages}
                            </span>
                            <button 
                                onClick={() => setYPage(p => Math.min(yTotalPages, p + 1))}
                                disabled={yPage === yTotalPages}
                                className="p-1.5 hover:bg-neutral-700 rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Z BOX: Main Detail View */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {activeDevice ? (
                        <>
                            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                                {/* Header / Identity */}
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-700/50 pb-5">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-white tracking-wide">
                                                {activeDevice.os || "Apple"} Profile
                                            </h3>
                                            {activeDevice.isBot && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded font-black tracking-wider uppercase">Bot</span>}
                                            {activeDevice.isSuspicious && <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Suspicious</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-neutral-400">
                                            <span>{activeDevice.browser}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                            <span>{activeDevice.deviceType || "Desktop"}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                            <span className="font-mono">{activeDevice.deviceId}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end gap-2">
                                        <button 
                                            onClick={() => handleWipeSpecificIp(activeDevice.ip || '')}
                                            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete IP
                                        </button>
                                        <div className="text-xs text-neutral-500">
                                            Last seen {new Date(activeDevice.lastSeenAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1"><CalendarDays className="w-3.5 h-3.5 text-indigo-400" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Sessions</span></div>
                                        <span className="text-2xl font-black text-white">{activeDeviceSessions.length}</span>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1"><Eye className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Page Views</span></div>
                                        <span className="text-2xl font-black text-white">{activeDevice.totalViews}</span>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1"><MousePointerClick className="w-3.5 h-3.5 text-amber-400" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Interactions</span></div>
                                        <span className="text-2xl font-black text-white">{activeDevice.totalLinkClicks + activeDevice.totalRuns}</span>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 mb-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Location</span></div>
                                        <span className="text-sm font-bold text-white truncate leading-tight mt-1" title={formatLoc(activeDevice.city, activeDevice.country)}>{formatLoc(activeDevice.city, activeDevice.country)}</span>
                                        <span className="text-[10px] text-neutral-500 font-mono mt-0.5">{activeDevice.ip}</span>
                                    </div>
                                </div>

                                {/* Hardware Details */}
                                <div className="flex items-center gap-3 text-xs text-neutral-400 bg-white/[0.02] border border-white/[0.05] shadow-sm px-4 py-3 rounded-xl">
                                    <Cpu className="w-4 h-4 text-indigo-400" />
                                    <span className="font-medium text-neutral-300">System Hardware:</span>
                                    <span>{formatHardware(activeDevice.hardware)}</span>
                                </div>
                            </div>

                            {/* Z BOX: Session History */}
                            <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white tracking-wide">Session History</h3>
                                    <div className="bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-lg text-xs text-neutral-300 font-medium">
                                        {activeDeviceSessions.length} total sessions
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-4">
                                    {paginatedSessions.map((session, sidx) => (
                                        <div key={session.session_id} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-indigo-500/50 border-2 border-indigo-500 mt-2 shrink-0 group-hover:bg-indigo-400 transition-colors" />
                                                {sidx < paginatedSessions.length - 1 && <div className="w-px h-full bg-neutral-700 my-2 group-hover:bg-neutral-600 transition-colors" />}
                                            </div>
                                            <div className="flex-1 bg-white/[0.02] border border-white/[0.05] shadow-sm rounded-xl p-5 mb-2 flex flex-col gap-3 hover:bg-neutral-900/80 hover:border-neutral-600 transition-all shadow-sm">
                                                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-neutral-700/50 pb-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-black text-white uppercase tracking-wider">{humanizeRoute(session.route)}</span>
                                                        <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(session.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </span>
                                                    </div>
                                                    <span className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                                                        {normalizeReferrer(session.source)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] text-neutral-500 font-bold uppercase">Views</span>
                                                        <span className="text-neutral-200 font-medium">{session.view_count}</span>
                                                    </div>
                                                    {(session.sessionDuration || 0) > 0 && (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] text-neutral-500 font-bold uppercase">Time</span>
                                                            <span className="text-neutral-200 font-medium">{Math.round(session.sessionDuration! / 1000)}s</span>
                                                        </div>
                                                    )}
                                                    {(session.completed_runs || 0) > 0 && (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] text-emerald-500 font-bold uppercase">Games Played</span>
                                                            <span className="text-emerald-400 font-medium">{session.completed_runs} rounds</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Z Pagination */}
                                {zTotalPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-neutral-700/50 pt-4 mt-2">
                                        <button 
                                            onClick={() => setZPage(p => Math.max(1, p - 1))}
                                            disabled={zPage === 1}
                                            className="px-4 py-2 bg-white/[0.02] border border-white/[0.05] shadow-sm text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-neutral-700 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-xs font-bold text-neutral-400 tracking-widest">
                                            PAGE {zPage} / {zTotalPages}
                                        </span>
                                        <button 
                                            onClick={() => setZPage(p => Math.min(zTotalPages, p + 1))}
                                            disabled={zPage === zTotalPages}
                                            className="px-4 py-2 bg-white/[0.02] border border-white/[0.05] shadow-sm text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-neutral-700 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-12 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <Filter className="w-12 h-12 text-neutral-600 mb-4" />
                            <h3 className="text-xl font-bold text-neutral-300">No Device Selected</h3>
                            <p className="text-neutral-500 mt-2 max-w-sm">Select a visitor from the sidebar to view their full device storyline, metrics, and session history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
