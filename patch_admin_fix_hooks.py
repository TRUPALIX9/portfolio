import re

with open('src/components/admin/MasterVisitorExplorer.tsx', 'r') as f:
    content = f.read()

hooks_to_insert = """
    const [searchQuery, setSearchQuery] = useState("");
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
"""

target = "}: MasterVisitorExplorerProps) {\n"
content = content.replace(target, target + hooks_to_insert)

with open('src/components/admin/MasterVisitorExplorer.tsx', 'w') as f:
    f.write(content)
