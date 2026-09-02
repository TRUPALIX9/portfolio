import re

with open('src/components/admin/MasterVisitorExplorer.tsx', 'r') as f:
    content = f.read()

# 1. Normalize Referrer & IP Filter
normalize_func = """function normalizeReferrer(ref: string): string {
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

export default function MasterVisitorExplorer"""

content = content.replace("export default function MasterVisitorExplorer", normalize_func)

old_valid_devices = """    const validDevices = useMemo(() => {
        return devices.filter(d => {
            const city = d.city ? decodeURIComponent(d.city).trim().toLowerCase() : "";
            return city !== "la grange" && city !== "stockbridge";
        });
    }, [devices]);"""

new_valid_devices = """    const validDevices = useMemo(() => {
        return devices.filter(d => {
            const city = d.city ? decodeURIComponent(d.city).trim().toLowerCase() : "";
            const ip = d.ip || "";
            return city !== "la grange" && city !== "stockbridge" && ip !== "75.139.41.49";
        });
    }, [devices]);"""

content = content.replace(old_valid_devices, new_valid_devices)

old_ref_story = """    const refStory = useMemo(() => {
        const refs: Record<string, number> = {};
        for (const s of validSessions) {
            const r = s.source || s.referrer || "direct";
            refs[r] = (refs[r] || 0) + 1;
        }
        return Object.entries(refs).map(([ref, count]) => ({ ref, count })).sort((a, b) => b.count - a.count);
    }, [validSessions]);"""

new_ref_story = """    const refStory = useMemo(() => {
        const refs: Record<string, number> = {};
        for (const s of validSessions) {
            const r = normalizeReferrer(s.source || s.referrer || "");
            refs[r] = (refs[r] || 0) + 1;
        }
        return Object.entries(refs).map(([ref, count]) => ({ ref, count })).sort((a, b) => b.count - a.count);
    }, [validSessions]);"""

content = content.replace(old_ref_story, new_ref_story)

old_active_ref_filter = """if (!deviceSessions.some(s => (s.source || s.referrer || "direct") === activeRef)) {"""
new_active_ref_filter = """if (!deviceSessions.some(s => normalizeReferrer(s.source || s.referrer || "") === activeRef)) {"""
content = content.replace(old_active_ref_filter, new_active_ref_filter)

# 2. Toolbar Redesign
old_toolbar_match = re.search(r'\{\/\* Toolbar \*\/\}.*?<div className="relative w-full sm:w-64">.*?</div>\s*</div>', content, re.DOTALL)

new_toolbar = """{/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-5">
                        <div className="flex flex-wrap bg-neutral-900/60 rounded-xl p-1.5 border border-white/[0.08] shadow-inner shrink-0">
                            {(["all", "mobile", "pc", "bot"] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider transition-all duration-200 flex-1 sm:flex-none text-center ${
                                        activeTab === tab ? "bg-[#38bdf8] text-neutral-950 shadow-md" : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:max-w-xs shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search IPs, Cities..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 bg-neutral-900/60 border border-white/[0.08] rounded-xl pl-10 pr-4 text-[0.85rem] text-white placeholder-neutral-500 focus:outline-none focus:border-[#38bdf8] focus:bg-neutral-900 transition-colors shadow-inner"
                            />
                        </div>
                    </div>"""

if old_toolbar_match:
    content = content.replace(old_toolbar_match.group(0), new_toolbar)

with open('src/components/admin/MasterVisitorExplorer.tsx', 'w') as f:
    f.write(content)
