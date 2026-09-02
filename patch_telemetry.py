import re

with open('src/components/admin/MasterVisitorExplorer.tsx', 'r') as f:
    content = f.read()

# Replace the beginning of the component to add our pre-filters
filter_code = """
export default function MasterVisitorExplorer({
    devices,
    sessions,
    scores,
    routeStory,
    getAdminHeaders,
    onRefresh
}: MasterVisitorExplorerProps) {
    const validDevices = useMemo(() => {
        return devices.filter(d => {
            const city = d.city ? decodeURIComponent(d.city).trim().toLowerCase() : "";
            return city !== "la grange" && city !== "stockbridge";
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
            const r = s.source || s.referrer || "direct";
            refs[r] = (refs[r] || 0) + 1;
        }
        return Object.entries(refs).map(([ref, count]) => ({ ref, count })).sort((a, b) => b.count - a.count);
    }, [validSessions]);
"""

old_start = r'export default function MasterVisitorExplorer\(\{[\s\S]*?onRefresh\n\}: MasterVisitorExplorerProps\) \{[\s\S]*?const refStory = useMemo\(\(\) => \{[\s\S]*?\}, \[sessions\]\);'

content = re.sub(old_start, filter_code.strip(), content)

# Now replace 'devices' with 'validDevices' and 'sessions' with 'validSessions' inside the hook logic
content = content.replace('devices\n            .filter(device => {', 'validDevices\n            .filter(device => {')
content = content.replace('const city = device.city ? decodeURIComponent(device.city).trim() : "";\n                if (city.toLowerCase() === "la grange" || city.toLowerCase() === "stockbridge") {\n                    return false; // Ignore owner devices\n                }', '')
content = content.replace('sessions.filter(s => s.device_id', 'validSessions.filter(s => s.device_id')
content = content.replace('sessions.length', 'validSessions.length')
content = content.replace('routeStory.map', 'dynamicRouteStory.map')
# Fix any remaining usages in the JSX of deviceSessions 
# Wait, deviceSessions is calculated per device, using validSessions is fine.

with open('src/components/admin/MasterVisitorExplorer.tsx', 'w') as f:
    f.write(content)
