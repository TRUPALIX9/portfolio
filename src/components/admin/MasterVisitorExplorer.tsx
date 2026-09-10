
"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    ChevronRight, 
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Laptop, 
    Smartphone,
    Globe,
    Cpu,
    Trash2,
    Activity,
    Clock, Gamepad2, Eye, MousePointerClick, MapPin, CalendarDays, RefreshCw,
    Filter,
    ShieldAlert,
    LayoutTemplate,
    ListTree,
    History
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

function formatDuration(seconds?: number) {
    if (seconds === undefined || seconds === null) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

export default function MasterVisitorExplorer({
    devices,
    sessions,
    routeStory,
    getAdminHeaders,
    onRefresh
}: MasterVisitorExplorerProps) {
    // Global Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(["mobile", "pc", "bot"]));

    const toggleFilter = (filter: string) => {
        setSelectedFilters(prev => {
            const next = new Set(prev);
            if (next.has(filter)) next.delete(filter);
            else next.add(filter);
            return next;
        });
    };

    // Memoize global valid devices based on search and filters
    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const city = device.city ? decodeURIComponent(device.city).trim().toLowerCase() : "";
            const ip = device.ip || "";
            if (city === "la grange" || city === "stockbridge" || ip === "75.139.41.49") return false;

            const isBot = !!device.isBot;
            const isMob = !isBot && (device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile"));
            const isPc = !isBot && !isMob;

            if (isBot && !selectedFilters.has("bot")) return false;
            if (isMob && !selectedFilters.has("mobile")) return false;
            if (isPc && !selectedFilters.has("pc")) return false;

            if (searchTerm.trim() !== "") {
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = device.customName?.toLowerCase().includes(searchLower);
                const ipMatch = device.ip?.toLowerCase().includes(searchLower);
                const locMatch = `${device.city} ${device.country}`.toLowerCase().includes(searchLower);
                const techMatch = `${device.os} ${device.browser} ${device.deviceType}`.toLowerCase().includes(searchLower);
                return nameMatch || ipMatch || locMatch || techMatch;
            }
            return true;
        }).sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
    }, [devices, searchTerm, selectedFilters]);

    const filteredDeviceIds = useMemo(() => new Set(filteredDevices.map(d => d.deviceId)), [filteredDevices]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(s => filteredDeviceIds.has(s.device_id));
    }, [sessions, filteredDeviceIds]);

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
        <div className="flex flex-col gap-12 font-sans">
            {/* GLOBAL HEADER & FILTERS */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col gap-5 sticky top-4 z-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
                            <Activity className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Traffic Explorer</h2>
                        <span className="bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-lg text-xs text-neutral-300 font-medium">
                            {filteredDevices.length} Devices
                        </span>
                    </div>

                    <div className="relative w-full sm:w-72 md:w-80 shrink-0">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search IP, OS, location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 bg-black/40 border border-white/[0.08] rounded-xl pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-white/[0.08] pt-4 mt-1">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                        <Filter className="w-4 h-4" /> Filter By
                    </span>
                    <div className="flex flex-wrap gap-2 w-full">
                        {([
                            { id: "mobile", label: "Mobile", icon: <Smartphone className="w-4 h-4" /> },
                            { id: "pc", label: "Desktop", icon: <Laptop className="w-4 h-4" /> },
                            { id: "bot", label: "Bots & Crawlers", icon: <Cpu className="w-4 h-4" /> }
                        ] as const).map(filter => {
                            const isSelected = selectedFilters.has(filter.id);
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => toggleFilter(filter.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                                        isSelected 
                                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[inset_0_0_10px_rgba(99,102,241,0.1)]" 
                                            : "bg-white/[0.04] text-neutral-500 border-transparent hover:bg-white/[0.08] hover:text-neutral-300 border-white/[0.08]"
                                    }`}
                                >
                                    {filter.icon}
                                    {filter.label}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setSelectedFilters(new Set(["mobile", "pc", "bot"]))}
                            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] ml-auto"
                        >
                            Select All
                        </button>
                    </div>
                </div>
            </div>

            {/* MODULE A: ROUTE EXPLORER */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2">
                    <ListTree className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white tracking-wide">Page Explorer</h2>
                </div>
                <RouteCentricView 
                    routeStory={routeStory} 
                    filteredDevices={filteredDevices} 
                    filteredSessions={filteredSessions} 
                />
            </div>

            {/* MODULE B: DEVICE EXPLORER */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2">
                    <LayoutTemplate className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white tracking-wide">Device Explorer</h2>
                </div>
                <DeviceCentricView 
                    filteredDevices={filteredDevices} 
                    filteredSessions={filteredSessions} 
                    handleWipeSpecificIp={handleWipeSpecificIp}
                />
            </div>

            {/* MODULE C: RECENT ACTIVITY */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2">
                    <History className="w-5 h-5 text-amber-400" />
                    <h2 className="text-xl font-bold text-white tracking-wide">Live Activity Feed</h2>
                </div>
                <RecentActivityView 
                    filteredDevices={filteredDevices}
                    filteredSessions={filteredSessions}
                    handleWipeSpecificIp={handleWipeSpecificIp}
                />
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// MODULE A: ROUTE CENTRIC VIEW
// -----------------------------------------------------------------------------
function RouteCentricView({ routeStory, filteredDevices, filteredSessions }: { routeStory: RouteStoryEntry[], filteredDevices: DeviceSummary[], filteredSessions: VisitorSession[] }) {
    const [yPage, setYPage] = useState(1);
    const routesPerPage = 8;
    const [activeRoute, setActiveRoute] = useState<string | null>(null);

    // Filter to only show routes that have sessions in the currently filtered sessions
    const activeRouteStory = useMemo(() => {
        const availableRoutes = new Set(filteredSessions.map(s => s.route));
        return routeStory.filter(r => availableRoutes.has(r.route)).sort((a,b) => b.views - a.views);
    }, [routeStory, filteredSessions]);

    const yTotalPages = Math.max(1, Math.ceil(activeRouteStory.length / routesPerPage));
    const paginatedRoutes = activeRouteStory.slice((yPage - 1) * routesPerPage, yPage * routesPerPage);

    const selectedRoute = activeRoute || (paginatedRoutes[0]?.route || null);
    
    const devicesOnRoute = useMemo(() => {
        if (!selectedRoute) return [];
        const deviceIds = new Set(filteredSessions.filter(s => s.route === selectedRoute).map(s => s.device_id));
        return filteredDevices.filter(d => deviceIds.has(d.deviceId));
    }, [filteredSessions, filteredDevices, selectedRoute]);

    const [zPage, setZPage] = useState(1);
    const devicesPerPageZ = 6;
    const zTotalPages = Math.max(1, Math.ceil(devicesOnRoute.length / devicesPerPageZ));
    const paginatedDevicesZ = devicesOnRoute.slice((zPage - 1) * devicesPerPageZ, zPage * devicesPerPageZ);

    const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Y BOX: Routes */}
            <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2 min-h-[500px]">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-2 px-2">Pages Visited</h3>
                    {paginatedRoutes.map(route => {
                        const isActive = selectedRoute === route.route;
                        return (
                            <button
                                key={route.route}
                                onClick={() => { setActiveRoute(route.route); setZPage(1); setExpandedDevice(null); }}
                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                    isActive 
                                        ? "bg-indigo-500/20 border-indigo-500/50 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] ring-1 ring-indigo-500/20" 
                                        : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.1]"
                                }`}
                            >
                                <div className="flex flex-col gap-1 min-w-0">
                                    <span className={`font-bold text-sm truncate ${isActive ? 'text-indigo-400' : 'text-white'}`}>
                                        {humanizeRoute(route.route)}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-mono truncate">{route.route}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold text-white">{route.views}</span>
                                    <span className="text-[10px] uppercase text-neutral-400">views</span>
                                </div>
                            </button>
                        );
                    })}
                    {paginatedRoutes.length === 0 && (
                        <div className="py-12 text-center text-sm text-neutral-400">No routes match filters.</div>
                    )}
                </div>
                
                {/* Y Pagination */}
                {yTotalPages > 1 && (
                    <div className="flex items-center justify-between bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 border border-white/[0.08] rounded-xl p-2 px-4">
                        <button onClick={() => setYPage(p => Math.max(1, p - 1))} disabled={yPage === 1} className="p-1.5 hover:bg-neutral-700 rounded-lg disabled:opacity-30 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-xs font-bold text-neutral-400 tracking-widest">PAGE {yPage} / {yTotalPages}</span>
                        <button onClick={() => setYPage(p => Math.min(yTotalPages, p + 1))} disabled={yPage === yTotalPages} className="p-1.5 hover:bg-neutral-700 rounded-lg disabled:opacity-30 transition-colors">
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}
            </div>

            {/* Z BOX: Devices on this route */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col gap-6 min-h-[500px]">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                            <ListTree className="w-5 h-5 text-indigo-400" />
                            Devices visiting {selectedRoute ? humanizeRoute(selectedRoute) : '...'}
                        </h3>
                        <span className="bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-lg text-xs text-neutral-300 font-medium">
                            {devicesOnRoute.length} Devices
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {paginatedDevicesZ.map(device => {
                            const isMob = device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile");
                            const isExp = expandedDevice === device.deviceId;
                            const deviceRouteSessions = filteredSessions.filter(s => s.device_id === device.deviceId && s.route === selectedRoute);
                            
                            return (
                                <div key={device.deviceId} className="flex flex-col bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden transition-all shadow-sm">
                                    <button 
                                        onClick={() => setExpandedDevice(isExp ? null : device.deviceId)}
                                        className="flex items-center justify-between p-4 hover:bg-white/[0.08] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {device.isBot ? <Cpu className="w-5 h-5 text-neutral-400" /> : isMob ? <Smartphone className="w-5 h-5 text-neutral-400" /> : <Laptop className="w-5 h-5 text-neutral-400" />}
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm">{device.os || "Apple"} Profile</span>
                                                    {device.isBot && <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Bot</span>}
                                                    {device.isSuspicious && <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Sus</span>}
                                                </div>
                                                <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                                                    <Globe className="w-3 h-3" /> {formatLoc(device.city, device.country)} <span className="mx-1">•</span> <span className="font-mono">{device.ip}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:flex flex-col">
                                                <span className="text-xs font-bold text-white">{deviceRouteSessions.length} sessions</span>
                                                <span className="text-[10px] text-neutral-400 uppercase">on this page</span>
                                            </div>
                                            {isExp ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                                        </div>
                                    </button>
                                    
                                    {isExp && (
                                        <div className="p-4 bg-black/40 border-t border-white/[0.08] flex flex-col gap-3">
                                            {deviceRouteSessions.map((sesh, idx) => (
                                                <div key={sesh.session_id} className="flex flex-col gap-3 bg-white/[0.04] p-3 rounded-lg border border-white/[0.08]">
                                                    <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" /> {new Date(sesh.started_at).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-400 uppercase">Ref: {normalizeReferrer(sesh.source || '')}</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] text-neutral-400 font-bold uppercase">Time</span>
                                                                <span className="text-xs font-medium text-amber-400">{formatDuration(sesh.sessionDuration)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex flex-col"><span className="text-[10px] text-neutral-500 uppercase font-bold">Views</span><span className="text-xs text-emerald-400 font-medium">{sesh.view_count}</span></div>
                                                        {sesh.link_clicks > 0 && <div className="flex flex-col"><span className="text-[10px] text-neutral-500 uppercase font-bold">Link Clicks</span><span className="text-xs text-white font-medium">{sesh.link_clicks}</span></div>}
                                                        {sesh.game_opens > 0 && <div className="flex flex-col"><span className="text-[10px] text-neutral-500 uppercase font-bold">Game Opens</span><span className="text-xs text-white font-medium">{sesh.game_opens}</span></div>}
                                                        {sesh.completed_runs > 0 && <div className="flex flex-col"><span className="text-[10px] text-neutral-500 uppercase font-bold">Runs</span><span className="text-xs text-white font-medium">{sesh.completed_runs}</span></div>}
                                                        {sesh.contact_submissions > 0 && <div className="flex flex-col"><span className="text-[10px] text-neutral-500 uppercase font-bold">Contacts</span><span className="text-xs text-white font-medium">{sesh.contact_submissions}</span></div>}
                                                        {sesh.resume_downloads > 0 && <div className="flex flex-col"><span className="text-[10px] text-neutral-500 uppercase font-bold">Resumes</span><span className="text-xs text-white font-medium">{sesh.resume_downloads}</span></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {paginatedDevicesZ.length === 0 && <div className="text-center py-10 text-neutral-400 text-sm">No devices found.</div>}
                    </div>

                    {zTotalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 mt-auto">
                            <button onClick={() => setZPage(p => Math.max(1, p - 1))} disabled={zPage === 1} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-white/[0.08]">Prev</button>
                            <span className="text-xs font-bold text-neutral-400 tracking-widest">PAGE {zPage} / {zTotalPages}</span>
                            <button onClick={() => setZPage(p => Math.min(zTotalPages, p + 1))} disabled={zPage === zTotalPages} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-white/[0.08]">Next</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// MODULE B: DEVICE CENTRIC VIEW
// -----------------------------------------------------------------------------
function DeviceCentricView({ filteredDevices, filteredSessions, handleWipeSpecificIp }: { filteredDevices: DeviceSummary[], filteredSessions: VisitorSession[], handleWipeSpecificIp: (ip: string) => void }) {
    const [yPage, setYPage] = useState(1);
    const devicesPerPage = 10;
    const [zPage, setZPage] = useState(1);
    const sessionsPerPage = 5;
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

    const yTotalPages = Math.max(1, Math.ceil(filteredDevices.length / devicesPerPage));
    const paginatedDevices = filteredDevices.slice((yPage - 1) * devicesPerPage, yPage * devicesPerPage);

    const activeDevice = filteredDevices.find(d => d.deviceId === activeDeviceId) || paginatedDevices[0] || null;

    const activeDeviceSessions = useMemo(() => {
        if (!activeDevice) return [];
        return filteredSessions
            .filter(s => s.device_id === activeDevice.deviceId)
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }, [filteredSessions, activeDevice]);

    const zTotalPages = Math.max(1, Math.ceil(activeDeviceSessions.length / sessionsPerPage));
    const paginatedSessions = activeDeviceSessions.slice((zPage - 1) * sessionsPerPage, zPage * sessionsPerPage);

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Y BOX: Sidebar List */}
            <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2 min-h-[500px]">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-2 px-2">Visitor Devices</h3>
                    {paginatedDevices.map(device => {
                        const isMob = device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") || device.deviceType?.toLowerCase().includes("mobile");
                        const isActive = activeDevice?.deviceId === device.deviceId;
                        return (
                            <button
                                key={device.deviceId}
                                onClick={() => { setActiveDeviceId(device.deviceId); setZPage(1); }}
                                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                                    isActive 
                                        ? "bg-emerald-500/20 border-emerald-500/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] ring-1 ring-emerald-500/20" 
                                        : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.1]"
                                }`}
                            >
                                <div className="mt-1">
                                    {device.isBot ? (
                                        <Cpu className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                                    ) : isMob ? (
                                        <Smartphone className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                                    ) : (
                                        <Laptop className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
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
                                    <div className="text-[10px] font-mono text-neutral-400 truncate">{device.ip}</div>
                                </div>
                            </button>
                        );
                    })}
                    {paginatedDevices.length === 0 && <div className="py-12 text-center text-sm text-neutral-400">No visitors found.</div>}
                </div>
                
                {yTotalPages > 1 && (
                    <div className="flex items-center justify-between bg-gradient-to-br from-neutral-900/90 to-neutral-800/80 border border-white/[0.08] rounded-xl p-2 px-4">
                        <button onClick={() => setYPage(p => Math.max(1, p - 1))} disabled={yPage === 1} className="p-1.5 hover:bg-neutral-700 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-white" /></button>
                        <span className="text-xs font-bold text-neutral-400 tracking-widest">PAGE {yPage} / {yTotalPages}</span>
                        <button onClick={() => setYPage(p => Math.min(yTotalPages, p + 1))} disabled={yPage === yTotalPages} className="p-1.5 hover:bg-neutral-700 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4 text-white" /></button>
                    </div>
                )}
            </div>

            {/* Z BOX: Main Detail View */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {activeDevice ? (
                    <>
                        {/* Summary Header */}
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-white tracking-wide">{activeDevice.os || "Apple"} Profile</h3>
                                        {activeDevice.isBot && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded font-black tracking-wider uppercase">Bot</span>}
                                        {activeDevice.isSuspicious && <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Suspicious</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                                        <span>{activeDevice.browser}</span><span className="w-1 h-1 rounded-full bg-neutral-600" />
                                        <span>{activeDevice.deviceType || "Desktop"}</span><span className="w-1 h-1 rounded-full bg-neutral-600" />
                                        <span className="font-mono">{activeDevice.deviceId}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <button onClick={() => handleWipeSpecificIp(activeDevice.ip || '')} className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete IP</button>
                                    <div className="text-xs text-neutral-400">Last seen {new Date(activeDevice.lastSeenAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400 bg-white/[0.04] border border-white/[0.08] px-4 py-3 rounded-xl">
                                <Cpu className="w-4 h-4 text-emerald-400" />
                                <span className="font-medium text-neutral-300">System Hardware:</span>
                                <span>{formatHardware(activeDevice.hardware)}</span>
                            </div>
                        </div>

                        {/* Session History */}
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white tracking-wide">Page History</h3>
                                <div className="bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-lg text-xs text-neutral-300 font-medium">{activeDeviceSessions.length} total sessions</div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                {paginatedSessions.map((session, sidx) => (
                                    <div key={session.session_id} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/50 border-2 border-emerald-500 mt-2 shrink-0 group-hover:bg-emerald-400 transition-colors" />
                                            {sidx < paginatedSessions.length - 1 && <div className="w-px h-full bg-white/[0.05] my-2 group-hover:bg-white/[0.1] transition-colors" />}
                                        </div>
                                        <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 mb-2 flex flex-col gap-3 hover:bg-white/[0.08] hover:border-white/[0.1] transition-all shadow-sm">
                                            <div className="flex flex-wrap justify-between items-start gap-2 border-b border-white/[0.08] pb-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-white uppercase tracking-wider">{humanizeRoute(session.route)}</span>
                                                    <span className="text-xs text-neutral-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{new Date(session.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                </div>
                                                <span className="bg-white/[0.05] border border-white/[0.08] text-neutral-300 text-[10px] font-bold uppercase px-2 py-1 rounded-md">{normalizeReferrer(session.source || '')}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                                <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Views</span><span className="text-neutral-200 font-medium">{session.view_count}</span></div>
                                                <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Time</span><span className="text-neutral-200 font-medium">{formatDuration(session.sessionDuration)}</span></div>
                                                {session.link_clicks > 0 && <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Link Clicks</span><span className="text-neutral-200 font-medium">{session.link_clicks}</span></div>}
                                                {session.game_opens > 0 && <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Game Opens</span><span className="text-neutral-200 font-medium">{session.game_opens}</span></div>}
                                                {session.completed_runs > 0 && <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Runs</span><span className="text-neutral-200 font-medium">{session.completed_runs}</span></div>}
                                                {session.contact_submissions > 0 && <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Contacts</span><span className="text-neutral-200 font-medium">{session.contact_submissions}</span></div>}
                                                {session.resume_downloads > 0 && <div className="flex flex-col gap-0.5"><span className="text-[10px] text-neutral-400 font-bold uppercase">Resumes</span><span className="text-neutral-200 font-medium">{session.resume_downloads}</span></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {zTotalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 mt-2">
                                    <button onClick={() => setZPage(p => Math.max(1, p - 1))} disabled={zPage === 1} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] shadow-sm text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-white/[0.08]">Prev</button>
                                    <span className="text-xs font-bold text-neutral-400 tracking-widest">PAGE {zPage} / {zTotalPages}</span>
                                    <button onClick={() => setZPage(p => Math.min(zTotalPages, p + 1))} disabled={zPage === zTotalPages} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] shadow-sm text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-white/[0.08]">Next</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-12 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                        <Filter className="w-12 h-12 text-neutral-600 mb-4" />
                        <h3 className="text-xl font-bold text-neutral-300">No Device Selected</h3>
                        <p className="text-neutral-400 mt-2 max-w-sm">Select a visitor from the sidebar to view their full device storyline, metrics, and session history.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// MODULE C: RECENT ACTIVITY VIEW
// -----------------------------------------------------------------------------
function RecentActivityView({ filteredDevices, filteredSessions, handleWipeSpecificIp }: { filteredDevices: DeviceSummary[], filteredSessions: VisitorSession[], handleWipeSpecificIp: (ip: string) => void }) {
    const [page, setPage] = useState(1);
    const itemsPerPage = 15;
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const sortedSessions = useMemo(() => {
        return [...filteredSessions].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }, [filteredSessions]);

    const totalPages = Math.max(1, Math.ceil(sortedSessions.length / itemsPerPage));
    const paginatedSessions = sortedSessions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-2xl border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col gap-4 min-h-[600px]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    Live Activity Feed
                </h3>
                <span className="bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-lg text-xs text-neutral-300 font-medium">
                    Showing latest {sortedSessions.length} sessions
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4 px-4 py-2 text-xs font-bold text-neutral-300 uppercase tracking-widest border-b border-white/[0.08]">
                    <div>Time</div>
                    <div>Page & Ref</div>
                    <div>Device</div>
                    <div className="text-right">Action</div>
                </div>

                {paginatedSessions.map((sesh) => {
                    const device = filteredDevices.find(d => d.deviceId === sesh.device_id);
                    const isExp = expandedRow === sesh.session_id;

                    return (
                        <div key={sesh.session_id} className="flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.08] rounded-xl overflow-hidden transition-all">
                            <div 
                                onClick={() => setExpandedRow(isExp ? null : sesh.session_id)}
                                className="grid grid-cols-[1fr_2fr_1.5fr_1fr] gap-4 p-4 items-center cursor-pointer"
                            >
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-sm font-bold text-white">{new Date(sesh.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="text-[10px] text-neutral-400">{new Date(sesh.started_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <span className="text-sm font-black text-amber-400 uppercase tracking-wider truncate">{humanizeRoute(sesh.route)}</span>
                                    <span className="text-[10px] text-neutral-400 truncate">Ref: {normalizeReferrer(sesh.source || '')}</span>
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="text-sm font-bold text-neutral-200 truncate">{sesh.os || 'Apple'}</span>
                                        {sesh.isBot && <span className="bg-red-500/20 text-red-400 text-[9px] px-1 py-0.5 rounded font-black tracking-wider uppercase shrink-0">Bot</span>}
                                    </div>
                                    <span className="text-[10px] font-mono text-neutral-400 truncate">{device?.ip || 'Unknown IP'}</span>
                                </div>
                                <div className="flex justify-end items-center">
                                    {isExp ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                                </div>
                            </div>

                            {isExp && (
                                <div className="p-4 bg-black/40 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-3">
                                        <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Session Details</h4>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex flex-col bg-white/[0.04] border border-white/[0.08] p-2 px-3 rounded-lg"><span className="text-[10px] text-neutral-400 uppercase">Views</span><span className="text-sm text-white font-bold">{sesh.view_count}</span></div>
                                            <div className="flex flex-col bg-white/[0.04] border border-white/[0.08] p-2 px-3 rounded-lg"><span className="text-[10px] text-neutral-400 uppercase">Duration</span><span className="text-sm text-white font-bold">{formatDuration(sesh.sessionDuration)}</span></div>
                                            <div className="flex flex-col bg-white/[0.04] border border-white/[0.08] p-2 px-3 rounded-lg"><span className="text-[10px] text-neutral-400 uppercase">Games</span><span className="text-sm text-white font-bold">{sesh.completed_runs}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 items-start md:items-end">
                                        <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Administrative Actions</h4>
                                        <button onClick={(e) => { e.stopPropagation(); handleWipeSpecificIp(device?.ip || ''); }} className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
                                            <Trash2 className="w-4 h-4" /> Wipe All IP Data
                                        </button>
                                        <span className="text-[10px] text-neutral-400 text-right max-w-xs">Warning: This instantly deletes all sessions and devices associated with IP <span className="font-mono text-neutral-400">{device?.ip}</span>.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {paginatedSessions.length === 0 && <div className="text-center py-10 text-neutral-400 text-sm">No recent activity.</div>}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 mt-auto">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] shadow-sm text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-white/[0.08]">Prev</button>
                    <span className="text-xs font-bold text-neutral-400 tracking-widest">PAGE {page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] shadow-sm text-sm font-bold text-white rounded-lg disabled:opacity-30 hover:bg-white/[0.08]">Next</button>
                </div>
            )}
        </div>
    );
}
