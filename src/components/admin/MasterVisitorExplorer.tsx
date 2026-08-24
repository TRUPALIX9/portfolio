"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    ChevronRight, 
    ChevronDown, 
    Check, 
    Edit2, 
    X, 
    Laptop, 
    Smartphone, 
    Globe, 
    Calendar, 
    Clock, 
    User, 
    Award, 
    FileText, 
    Bot, 
    AlertTriangle 
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
    sessions: number; // dynamically computed or backend aggregated
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

type MasterVisitorExplorerProps = {
    devices: DeviceSummary[];
    sessions: VisitorSession[];
    scores: LeaderboardEntry[];
    getAdminHeaders: (includeContentType?: boolean) => Record<string, string>;
    onRefresh: () => Promise<void>;
};

// Geolocation cleaner
function formatLoc(city?: string, country?: string) {
    if (!city && !country) return "Unknown Location";
    const cleanCity = city ? decodeURIComponent(city).trim() : "";
    const cleanCountry = country ? decodeURIComponent(country).trim() : "";
    if (cleanCity && cleanCountry) return `${cleanCity}, ${cleanCountry}`;
    return cleanCity || cleanCountry;
}

// Check local/test IPs
export function isLocalIp(ip?: string) {
    if (!ip) return false;
    const cleanIp = ip.trim().toLowerCase();
    return (
        cleanIp === "127.0.0.1" ||
        cleanIp === "::1" ||
        cleanIp === "localhost" ||
        cleanIp.startsWith("192.168.") ||
        cleanIp.startsWith("10.") ||
        cleanIp.startsWith("172.16.") ||
        cleanIp.startsWith("172.17.") ||
        cleanIp.startsWith("172.18.") ||
        cleanIp.startsWith("172.19.") ||
        cleanIp.startsWith("172.20.") ||
        cleanIp.startsWith("172.21.") ||
        cleanIp.startsWith("172.22.") ||
        cleanIp.startsWith("172.23.") ||
        cleanIp.startsWith("172.24.") ||
        cleanIp.startsWith("172.25.") ||
        cleanIp.startsWith("172.26.") ||
        cleanIp.startsWith("172.27.") ||
        cleanIp.startsWith("172.28.") ||
        cleanIp.startsWith("172.29.") ||
        cleanIp.startsWith("172.30.") ||
        cleanIp.startsWith("172.31.")
    );
}

// Generate insight badge
export function getDeviceInsight(device: DeviceSummary, deviceSessions: VisitorSession[]) {
    if (device.isBot) {
        return {
            type: "bot",
            label: "Bot / Crawler",
            description: `🤖 Automated Bot / Crawler · ${device.browser || "Unknown"}`,
            colorClass: "bg-red-500/10 text-red-400 border border-red-500/20"
        };
    }

    const totalRuns = device.totalRuns || 0;
    const sessionCount = deviceSessions.length;
    const totalViews = device.totalViews || 0;

    // Calculate average session duration
    const totalDuration = deviceSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0);
    const avgDuration = sessionCount ? Math.round(totalDuration / sessionCount) : 0;

    if (totalRuns >= 10) {
        return {
            type: "power-gamer",
            label: "Power Gamer",
            description: `🕹️ Power Gamer · ${totalRuns} runs across ${sessionCount} session(s)`,
            colorClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        };
    }

    if (totalRuns > 0) {
        return {
            type: "casual-player",
            label: "Casual Player",
            description: `🎮 Casual Player · Played ${totalRuns} time(s) · Avg stay: ${avgDuration}s`,
            colorClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        };
    }

    // Check contact page visits or resume interaction
    const hasContact = device.totalContacts > 0 || deviceSessions.some(s => s.contact_submissions > 0 || s.route === "/contact");
    const hasResume = device.totalResumeDownloads > 0 || deviceSessions.some(s => s.resume_downloads > 0 || s.resume_opens > 0);
    if (hasContact || hasResume) {
        return {
            type: "high-intent",
            label: "High-Intent Lead",
            description: "💼 High-Intent Lead · Visited contact page or viewed resume",
            colorClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        };
    }

    if (totalViews <= 2 && avgDuration < 15) {
        return {
            type: "bounce",
            label: "Quick Glance",
            description: `⚡ Quick Glance · Bounced in ${avgDuration}s after ${totalViews} page(s)`,
            colorClass: "bg-neutral-800 text-neutral-400 border border-neutral-700"
        };
    }

    return {
        type: "explorer",
        label: "Active Explorer",
        description: `🔍 Active Explorer · Browsed ${totalViews} page(s) across ${sessionCount} session(s)`,
        colorClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
    };
}

export default function MasterVisitorExplorer({
    devices,
    sessions,
    scores,
    getAdminHeaders,
    onRefresh
}: MasterVisitorExplorerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [excludeBotsAndLocal, setExcludeBotsAndLocal] = useState(true);
    const [expandedDeviceIds, setExpandedDeviceIds] = useState<Record<string, boolean>>({});
    
    // Inline Renaming State
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [isSavingRename, setIsSavingRename] = useState(false);

    // Primary Device Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const devicesPerPage = 5;

    // Session Drawer Local Pagination
    const [sessionPages, setSessionPages] = useState<Record<string, number>>({});

    const handleToggleExpand = (deviceId: string) => {
        setExpandedDeviceIds(prev => ({
            ...prev,
            [deviceId]: !prev[deviceId]
        }));
    };

    const handleStartRename = (device: DeviceSummary) => {
        setEditingDeviceId(device.deviceId);
        setRenameValue(device.customName || "");
    };

    const handleCancelRename = () => {
        setEditingDeviceId(null);
        setRenameValue("");
    };

    const handleSaveRename = async (deviceId: string) => {
        setIsSavingRename(true);
        try {
            const res = await fetch("/api/visitor-analytics", {
                method: "PATCH",
                headers: getAdminHeaders(true),
                body: JSON.stringify({
                    deviceId,
                    customName: renameValue.trim()
                })
            });

            if (!res.ok) throw new Error("Rename failed");
            await onRefresh();
            setEditingDeviceId(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error saving alias");
        } finally {
            setIsSavingRename(false);
        }
    };

    // Filter devices and count sessions
    const filteredDevices = useMemo(() => {
        return devices
            .filter(device => {
                // Exclude Bots & Local IPs if checked
                if (excludeBotsAndLocal) {
                    if (device.isBot) return false;
                    if (isLocalIp(device.ip)) return false;
                }

                // Match search term
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
            });
    }, [devices, searchTerm, excludeBotsAndLocal]);

    // Handle primary pagination boundary reset
    const totalPages = Math.max(1, Math.ceil(filteredDevices.length / devicesPerPage));
    const paginatedDevices = useMemo(() => {
        const page = Math.min(currentPage, totalPages);
        const start = (page - 1) * devicesPerPage;
        return filteredDevices.slice(start, start + devicesPerPage);
    }, [filteredDevices, currentPage, totalPages]);

    return (
        <section className="bg-neutral-900/[0.12] backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-6 flex flex-col gap-6 shadow-2xl">
            {/* Top Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-white/[0.05] pb-5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-white tracking-wide">Master Visitor Explorer</h3>
                    <p className="text-neutral-400 text-xs leading-normal">
                        Inspect persistent visitor profiles, rename browser fingerprints, and track collapse-nested navigation sessions.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="relative min-w-[240px] flex-1 md:flex-none">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search alias, ID, IP, location..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-neutral-950/60 border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#4ADE80] transition-colors"
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

                    {/* Exclude Bots & Test IP Checkbox */}
                    <label className="flex items-center gap-2.5 text-sm text-neutral-300 font-medium select-none cursor-pointer bg-neutral-950/40 px-4 py-2.5 border border-white/[0.06] rounded-xl hover:bg-neutral-900/60 transition-colors">
                        <input
                            type="checkbox"
                            checked={excludeBotsAndLocal}
                            onChange={(e) => {
                                setExcludeBotsAndLocal(e.target.checked);
                                setCurrentPage(1);
                            }}
                            className="rounded accent-[#4ADE80] bg-neutral-950 border-white/[0.1] text-[#4ADE80]"
                        />
                        <span>Filter Bots & Local IPs</span>
                    </label>

                    {/* Filtered Count */}
                    <div className="bg-neutral-950/60 border border-white/[0.08] text-[#4ADE80] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider">
                        {filteredDevices.length} visitor profile{filteredDevices.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            {/* Device Feeds List */}
            <div className="flex flex-col gap-4">
                {filteredDevices.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-sm border border-dashed border-white/[0.06] rounded-2xl bg-neutral-950/20">
                        No visitor profiles match your search criteria.
                    </div>
                ) : (
                    paginatedDevices.map((device) => {
                        // Match sessions dynamically
                        const deviceSessions = sessions.filter((s) => s.device_id === device.deviceId);
                        const isExpanded = expandedDeviceIds[device.deviceId] || false;
                        const deviceScores = scores.filter((s) => s.deviceId === device.deviceId);
                        const insight = getDeviceInsight(device, deviceSessions);

                        // Local session pagination
                        const sessionPage = sessionPages[device.deviceId] || 1;
                        const sessionsPerPage = 3;
                        const totalSessionPages = Math.max(1, Math.ceil(deviceSessions.length / sessionsPerPage));
                        const paginatedSessions = deviceSessions.slice(
                            (sessionPage - 1) * sessionsPerPage,
                            sessionPage * sessionsPerPage
                        );

                        const isEditing = editingDeviceId === device.deviceId;

                        return (
                            <div 
                                key={device.deviceId} 
                                className={`border border-white/[0.06] rounded-2xl bg-neutral-950/20 transition-all ${
                                    isExpanded ? "border-[#4ADE80]/30 shadow-[0_12px_32px_rgba(0,0,0,0.4)]" : "hover:border-white/[0.12] hover:bg-neutral-950/30"
                                }`}
                            >
                                {/* Device Header Row */}
                                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Custom Name Alias Editor */}
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 max-w-[320px]">
                                                    <input
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        placeholder="Alias name"
                                                        className="bg-neutral-950 border border-white/[0.15] text-[#4ADE80] font-bold text-sm px-2.5 py-1 rounded focus:outline-none focus:border-[#4ADE80]"
                                                        disabled={isSavingRename}
                                                    />
                                                    <button 
                                                        onClick={() => handleSaveRename(device.deviceId)} 
                                                        disabled={isSavingRename}
                                                        className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={handleCancelRename} 
                                                        disabled={isSavingRename}
                                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    {device.customName ? (
                                                        <span className="font-extrabold text-[#fca5a5] text-base tracking-wide uppercase">
                                                            {device.customName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-500 text-sm italic font-medium">
                                                            Unnamed Profile
                                                        </span>
                                                    )}
                                                    <button 
                                                        onClick={() => handleStartRename(device)} 
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white rounded transition-all"
                                                        title="Rename profile alias"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Fingerprint ID label */}
                                            <span className="text-neutral-500 text-xs font-mono bg-neutral-900/60 border border-white/[0.04] px-2.5 py-0.5 rounded-lg select-all">
                                                {device.deviceId}
                                            </span>

                                            {/* Geolocation metadata */}
                                            <span className="text-neutral-400 text-xs bg-neutral-900/40 border border-white/[0.04] px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                                                <Globe className="w-3 h-3 text-[#38bdf8]" />
                                                {formatLoc(device.city, device.country)}
                                            </span>
                                        </div>

                                        {/* Insight Pill & Desc */}
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${insight.colorClass}`}>
                                                {insight.label}
                                            </span>
                                            <span className="text-neutral-400 text-xs leading-normal">
                                                {insight.description}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action items right */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider">Last Activity</div>
                                            <div className="text-white text-xs font-medium mt-0.5">
                                                {new Date(device.lastSeenAt).toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Expand Chevron button */}
                                        <button 
                                            onClick={() => handleToggleExpand(device.deviceId)}
                                            className={`p-2.5 rounded-xl border border-white/[0.06] bg-neutral-900/40 text-neutral-400 hover:text-white hover:border-white/[0.12] transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                                                isExpanded ? "border-[#4ADE80]/30 text-white" : ""
                                            }`}
                                        >
                                            <span>{deviceSessions.length} Session{deviceSessions.length !== 1 ? "s" : ""}</span>
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Drawer */}
                                {isExpanded && (
                                    <div className="border-t border-white/[0.05] p-5 bg-neutral-950/40 rounded-b-2xl flex flex-col gap-5">
                                        {/* Device Stats Row */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            <div className="bg-neutral-900/60 border border-white/[0.04] p-3.5 rounded-xl text-center">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Page Views</div>
                                                <div className="text-white text-lg font-black mt-1">{device.totalViews}</div>
                                            </div>
                                            <div className="bg-neutral-900/60 border border-white/[0.04] p-3.5 rounded-xl text-center">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Outbound Clicks</div>
                                                <div className="text-white text-lg font-black mt-1">{device.totalLinkClicks}</div>
                                            </div>
                                            <div className="bg-neutral-900/60 border border-white/[0.04] p-3.5 rounded-xl text-center">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Arcade Runs</div>
                                                <div className="text-white text-lg font-black mt-1">{device.totalRuns}</div>
                                            </div>
                                            <div className="bg-neutral-900/60 border border-white/[0.04] p-3.5 rounded-xl text-center">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Resume DLs</div>
                                                <div className="text-white text-lg font-black mt-1">{device.totalResumeDownloads}</div>
                                            </div>
                                            <div className="bg-neutral-900/60 border border-white/[0.04] p-3.5 rounded-xl text-center col-span-2 md:col-span-1">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Contacts</div>
                                                <div className="text-white text-lg font-black mt-1">{device.totalContacts}</div>
                                            </div>
                                        </div>

                                        {/* Device Profile Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-400 bg-neutral-900/20 p-4 border border-white/[0.04] rounded-xl">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider">Client Fingerprint</div>
                                                <div className="text-white flex items-center gap-1.5">
                                                    {device.deviceType?.toLowerCase().includes("iphone") || device.deviceType?.toLowerCase().includes("android") ? (
                                                        <Smartphone className="w-3.5 h-3.5 text-[#a78bfa]" />
                                                    ) : (
                                                        <Laptop className="w-3.5 h-3.5 text-[#38bdf8]" />
                                                    )}
                                                    <span>{device.deviceType || "Desktop"} · {device.os} · {device.browser}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider">Network Address</div>
                                                <div className="text-white font-mono">
                                                    {device.ip || "Unknown IP"}{" "}
                                                    {device.ip && isLocalIp(device.ip) && (
                                                        <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700 ml-1">
                                                            LOCAL/TEST IP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider">System Hardware</div>
                                                <div className="text-white">
                                                    {device.hardware ? (
                                                        `${device.hardware.memory}GB RAM · ${device.hardware.cores} CPU Cores · ${device.hardware.connection}`
                                                    ) : (
                                                        "Unknown hardware specs"
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nested Device-Wide Arcade Runs List */}
                                        {deviceScores.length > 0 && (
                                            <div className="bg-neutral-950/60 border border-white/[0.05] p-4 rounded-xl flex flex-col gap-3">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                                                    <Award className="w-4 h-4" />
                                                    <span>Linked Arcade Submissions ({deviceScores.length})</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(
                                                        deviceScores.reduce((acc, score) => {
                                                            const existing = acc[score.game] || [];
                                                            existing.push(score);
                                                            acc[score.game] = existing;
                                                            return acc;
                                                        }, {} as Record<string, LeaderboardEntry[]>)
                                                    ).map(([game, entries]) => (
                                                        <div key={game} className="p-3 bg-neutral-900/40 border border-white/[0.04] rounded-lg flex flex-col gap-2">
                                                            <div className="text-xs font-extrabold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                                                                <span>🎮 {game}</span>
                                                                <span className="text-neutral-500 font-medium">({entries.length} play{entries.length !== 1 ? "s" : ""})</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {entries.sort((a, b) => b.score - a.score).map((entry) => (
                                                                    <div key={entry.id} className="text-[11px] bg-neutral-900 border border-white/[0.05] px-2.5 py-1 rounded flex items-center gap-2">
                                                                        <span className="text-red-400 font-black">🏆 {entry.score} pts</span>
                                                                        <span className="text-neutral-500">as</span>
                                                                        <span className="text-white font-extrabold">{entry.name}</span>
                                                                        <span className="text-neutral-600 font-mono text-[9px]">
                                                                            {new Date(entry.date).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Nested Collapsible Sessions drawer */}
                                        <div className="flex flex-col gap-3.5">
                                            <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-[#4ADE80]">
                                                    Sessions Log ({deviceSessions.length})
                                                </h4>
                                                
                                                {/* Localized Session Pagination Controls */}
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
                                                    No session logs stored for this fingerprint.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {paginatedSessions.map((session) => (
                                                        <div key={session.session_id} className="p-4 rounded-xl border border-white/[0.04] bg-neutral-900/40 flex flex-col gap-3">
                                                            <div className="flex flex-wrap justify-between items-start gap-2">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <strong className="text-white text-xs font-bold flex items-center gap-2">
                                                                        {session.session_label?.trim() || "Unnamed Session"}
                                                                        <span className="text-[10px] font-mono text-neutral-500 font-normal">
                                                                            ({session.session_id.slice(-8)})
                                                                        </span>
                                                                    </strong>
                                                                    <span className="text-neutral-500 text-[10px] flex items-center gap-1.5 mt-0.5">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {new Date(session.started_at).toLocaleString()}
                                                                        <span>·</span>
                                                                        <Clock className="w-3 h-3" />
                                                                        Active {new Date(session.last_seen_at).toLocaleTimeString()}
                                                                    </span>
                                                                </div>

                                                                {/* Referrer source badge */}
                                                                <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-white/[0.05]">
                                                                    Ref: {session.source || session.referrer || "direct"}
                                                                </span>
                                                            </div>

                                                            {/* Session Badges Row */}
                                                            <div className="flex flex-wrap gap-2.5 text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                                                                <span className="bg-neutral-950/80 px-2 py-1 border border-white/[0.04] rounded">
                                                                    {session.view_count} views
                                                                </span>
                                                                <span className="bg-neutral-950/80 px-2 py-1 border border-white/[0.04] rounded text-emerald-400">
                                                                    Duration: {session.sessionDuration || 0}s
                                                                </span>
                                                                <span className="bg-neutral-950/80 px-2 py-1 border border-white/[0.04] rounded text-[#38bdf8]">
                                                                    Scroll: {session.maxScrollDepth || 0}%
                                                                </span>
                                                                {session.rageClicks ? (
                                                                    <span className="bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-red-400 flex items-center gap-1">
                                                                        <AlertTriangle className="w-3 h-3" />
                                                                        {session.rageClicks} rage click(s)
                                                                    </span>
                                                                ) : null}
                                                                {session.completed_runs ? (
                                                                    <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-amber-400">
                                                                        runs: {session.completed_runs} · pts: {session.total_score}
                                                                    </span>
                                                                ) : null}
                                                            </div>

                                                            {/* Games Played and Targets */}
                                                            <div className="text-[11px] text-neutral-400 leading-normal flex flex-col gap-1">
                                                                <div>
                                                                    <span className="font-extrabold text-neutral-500 uppercase tracking-widest text-[9px] mr-2">Games:</span>
                                                                    {session.games_played?.length ? (
                                                                        <span className="text-white bg-neutral-900 border border-white/[0.04] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                                                            {session.games_played.join(", ")}
                                                                        </span>
                                                                    ) : (
                                                                        "None yet"
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <span className="font-extrabold text-neutral-500 uppercase tracking-widest text-[9px] mr-2">Links Tap:</span>
                                                                    {session.link_targets?.length ? (
                                                                        <span className="text-white text-[10px]">
                                                                            {session.link_targets.join(", ")}
                                                                        </span>
                                                                    ) : (
                                                                        "None clicked"
                                                                    )}
                                                                </div>
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
                    })
                )}
            </div>

            {/* Master Device Pagination Panel */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center border-t border-white/[0.05] pt-4 text-sm text-neutral-400">
                    <div>
                        Showing <strong className="text-white">{Math.min(filteredDevices.length, (currentPage - 1) * devicesPerPage + 1)}</strong> -{" "}
                        <strong className="text-white">{Math.min(filteredDevices.length, currentPage * devicesPerPage)}</strong> of{" "}
                        <strong className="text-white">{filteredDevices.length}</strong> visitor profile(s)
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-neutral-950 border border-white/[0.08] text-neutral-300 hover:text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-900/60 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-black uppercase tracking-wider text-[#4ADE80]">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-neutral-950 border border-white/[0.08] text-neutral-300 hover:text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-900/60 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
