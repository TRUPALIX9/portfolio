
export type ProjectMediaItem = {
    type: "image" | "video";
    src: string;
    title: string;
    caption: string;
    poster?: string;
    /** Device frame the screen is drawn in; the case-study gallery lays shots out by it. */
    frame?: "browser" | "phone" | "windows" | "terminal";
};

export type ProjectMediaDisplay = "spotlight" | "grid" | "storyboard";

export type ProjectMilestone = {
    title: string;
    detail: string;
    state: "done" | "in-progress" | "planned";
};

export type ProjectTech = {
    name: string;
    icon: string;
};

export type Project = {
    slug: string;
    title: string;
    tagline: string;
    category?: string;
    heroImage?: string;
    liveUrl?: string;
    githubUrl?: string;
    challenge?: string;
    architecture?: string[];
    techStack?: string[];
    metrics?: string[];
    detailedDescription?: string;
    description: string;
    scenario: string;
    problemSolved: string;
    howToUse: string[];
    outcomes: string[];
    progress: ProjectMilestone[];
    futureGoals: string[];
    tech: ProjectTech[];
    links: {
        live: string;
        github: string;
    };
    image: string;
    mediaDisplay: ProjectMediaDisplay;
    media: ProjectMediaItem[];
    architectureImage?: string;
    mermaidChart?: string;
    logoIcon?: string;
    /** Replaces the default "screens are recreated" note under the product shots. */
    screensNote?: string;
    /** An earlier version the project grew out of, shown as its own chapter on the case study. */
    legacy?: ProjectLegacy;
};

export type ProjectLegacy = {
    title: string;
    summary: string;
    /** What the earlier version did. */
    features: string[];
    /** What changed in the current version, and why. */
    changes: string[];
    github?: string;
    screens?: ProjectMediaItem[];
};

export const projects: Project[] = [
    {
        slug: "retailsync",
        title: "RetailSync",
        tagline: "Full-stack multi-tenant SaaS: POS ingestion, bank statement OCR, and QuickBooks sync in one platform.",
        description: "A TypeScript monorepo SaaS for retail operations. Handles email/Google OAuth, company-scoped RBAC, POS CSV imports with Georgia sales-tax review, async bank statement PDF extraction via background jobs, and a standalone QuickBooks workspace for contacts, invoices, and reconciliation.",
        scenario: "Multi-location retail operators needed a single system to isolate tenant data, ingest POS exports, process statement PDFs without manual data entry, and hand off finalized records directly into QuickBooks — without bouncing between spreadsheets and carrier portals.",
        problemSolved: "RetailSync centralizes authentication, tenant-scoped access, POS analytics, async PDF accounting pipelines, and QuickBooks operations into one coherent platform. Background jobs handle OCR, layout extraction, and artifact generation so the interactive UI stays fast.",
        howToUse: [
            "Register or sign in with Google OAuth. Create or join a company to enter the RBAC-scoped dashboard shell.",
            "Open the POS workspace and import daily sales CSVs. Review totals, Georgia Troup County sales-tax breakdowns, and monthly analytics.",
            "Upload a bank statement PDF in the Accounting workspace. Async pipeline renders pages, extracts text, builds validation artifacts, and surfaces them for structured review.",
            "Navigate to the QuickBooks workspace to manage contacts, invoices, vendor records, and finalize reconciliation entries.",
        ],
        outcomes: [
            "Company-scoped RBAC across 6 workspaces: Dashboard, POS, Accounting, QuickBooks, Settings, and Access.",
            "Async statement pipeline: PDF → cloud storage → OCR jobs → artifact model → structured review UI.",
            "Google Sheets and QuickBooks integrations isolated behind service layers so either can fail independently.",
            "Monorepo shared-schema package eliminates drift between client state, server validation, and domain types.",
        ],
        progress: [
            { title: "Auth & onboarding (Phase 0 + 2)", detail: "Email/password, Google OAuth, verification, invite flow, forgot/reset, and QuickBooks-first company creation.", state: "done" },
            { title: "POS & sales tax (Phase 1)", detail: "Daily/monthly POS import, analytics, and Georgia Troup County sales-tax review active.", state: "done" },
            { title: "Statement pipeline & QuickBooks workspace (Phase 3)", detail: "PDF upload, async OCR jobs, artifact review, and standalone QuickBooks CRUD workspace live.", state: "done" },
            { title: "Procurement & invoice reconciliation (Phase 4)", detail: "Planned expansion into deeper invoice OCR and automated reconciliation workflows.", state: "planned" },
        ],
        futureGoals: [
            "Expand statement pipeline into full automated reconciliation with confidence scoring.",
            "Build procurement module for invoice CRUD and PO matching.",
            "Add multi-location rollup dashboard across company tenants.",
        ],
        tech: [
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Redux Toolkit", icon: "devicon-redux-original colored" },
            { name: "Express", icon: "devicon-express-original" },
            { name: "MongoDB", icon: "devicon-mongodb-plain colored" },
            { name: "Docker", icon: "devicon-docker-plain colored" },
            { name: "Vite", icon: "devicon-vitejs-plain colored" },
            { name: "Google Cloud", icon: "devicon-googlecloud-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/comp596-spring-2026/RetailSync" },
        image: "/projects/retailsync/banner.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/retailsync/screen-dashboard.svg",
                title: "Dashboard",
                caption: "POS KPIs for the last 30 days, the sales trend and the QuickBooks year-to-date summary.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/retailsync/screen-pos-analytics.svg",
                title: "POS analytics",
                caption: "KPI overview, revenue distribution and the daily trend for imported POS data.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/retailsync/screen-statement-review.svg",
                title: "Statement review",
                caption: "A processed bank statement on the Review Transactions tab, with parsed deposits ready for approval.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/retailsync/screen-roles.svg",
                title: "Roles and permissions",
                caption: "The Access workspace capability editor for a custom Store Manager role.",
                frame: "browser",
            }
        ],
        architectureImage: "/projects/retailsync/architecture.svg",
        logoIcon: "/projects/retailsync/icon.svg"
    },
    {
        slug: "web-warehouse",
        title: "Web Warehouse",
        tagline: "Full-stack inventory and PO management with a 3D warehouse model rendered in Three.js.",
        description: "Next.js 15 App Router warehouse system backed by MongoDB Atlas. Manages items, vendors, suppliers, purchase orders with embedded pallets, and renders the structured warehouse layout (unit → row → column) as an interactive 3D preview using Three.js. Dashboard analytics powered by ApexCharts.",
        scenario: "Warehouse operators needed more than a flat table to understand where inventory lived, how pallets moved, and whether storage slots were efficiently utilized — especially when seeding or reviewing large purchase orders.",
        problemSolved: "By modeling the physical warehouse hierarchy in MongoDB and projecting it into a Three.js 3D scene, operators can navigate the real layout, inspect individual items, and understand spatial utilization without leaving the browser.",
        howToUse: [
            "Seed the database using the dbScript.ts runner to generate parties, warehouse layout, 50 items, and 10 purchase orders with embedded pallets.",
            "Browse the warehouse hierarchy (Unit → Row → Column) and open the 3D preview to inspect item placement in the scene.",
            "Create purchase orders assigned to vendors or suppliers, with embedded pallet records tracking storage locations.",
            "Review the analytics dashboard for stock levels, PO status, and vendor/supplier activity.",
        ],
        outcomes: [
            "Structured MongoDB schemas for Warehouse, Item, Party, and Purchase Order with embedded pallet support.",
            "Interactive Three.js 3D item viewer inside the browser — no external tooling required.",
            "ApexCharts dashboard showing inventory metrics and purchase order analytics.",
            "Role-ready architecture scaffolded for Admin, Manager, and Employee access tiers.",
        ],
        progress: [
            { title: "Warehouse schema & CRUD", detail: "Items, parties (vendor/supplier), POs with pallets, and warehouse hierarchy fully implemented.", state: "done" },
            { title: "3D item preview (Three.js)", detail: "3D spatial viewer for individual items embedded in the warehouse browse flow.", state: "done" },
            { title: "Analytics dashboard", detail: "ApexCharts panels for inventory and purchase order analytics.", state: "done" },
            { title: "Role-based access control", detail: "Scaffolded for Admin/Manager/Employee tiers, not yet fully enforced in UI.", state: "planned" },
        ],
        futureGoals: [
            "Fully enforce RBAC tiers across all CRUD surfaces.",
            "Add heatmap overlays for slot utilization and congestion.",
            "Introduce path-optimized picking simulations for large warehouses.",
        ],
        tech: [
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "Three.js", icon: "devicon-threejs-original" },
            { name: "MongoDB", icon: "devicon-mongodb-plain colored" },
            { name: "Tailwind CSS", icon: "devicon-tailwindcss-original colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/web-warehouse" },
        image: "/projects/web-warehouse/banner.svg",
        architectureImage: "/projects/web-warehouse/architecture.svg",
        logoIcon: "/projects/web-warehouse/icon.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/web-warehouse/screen-inventory.svg",
                title: "Inventory",
                caption: "Searchable inventory table filtered by the fragile tag, with SKU links, dimensions, weights, storage locations and tag chips.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/web-warehouse/screen-dashboard.svg",
                title: "Dashboard",
                caption: "Stock and purchase-order stat cards with ApexCharts for item categories, PO item coverage, vendor vs supplier POs and item counts per PO.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/web-warehouse/screen-item-3d.svg",
                title: "Item detail with 3D preview",
                caption: "A React Three Fiber box scaled to the item's length, width and height on a grid, next to the item's dimension and information fields.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/web-warehouse/screen-purchase-order.svg",
                title: "Purchase order",
                caption: "A supplier purchase order with its volume, weight and cost summary, ordered items and the Pallet 1 standard 48x40x60 in breakdown.",
                frame: "browser",
            }
        ],
        mermaidChart: `
flowchart TD
    classDef client fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef server fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    classDef db fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#fff

    Client[Browser UI Client]:::client
    Three[Three.js 3D Viewport]:::client
    API[Next.js API Routes]:::server
    DB[(MongoDB Atlas)]:::db
    Pallets[Pallet Placement Engine]:::server

    Client --> Three
    Client -- REST / WebSockets --> API
    API <--> DB
    API -- Position Updates --> Pallets
        `
    },
    {
        slug: "shipping-agent",
        title: "Shipping Agent",
        tagline: "Paste an order, get a label: an AI shipping desk that quotes every carrier through ShipStation and checks out to a printable label.",
        description: "A Python + Streamlit shipping desk that started as a four-person team prototype and was rebuilt end to end. An AI assistant (Groq tool calling, with an optional AWS Bedrock Agent) reads a pasted order email, packing slip or address block, builds the shipment, and fetches exact rates from every connected carrier through the ShipStation API v2. Rates come back with carrier logos and Cheapest / Best value / Fastest picks; checkout opens pre-filled and ends in a real label PDF with a tracking number. Around the assistant sit Dashboard, Rates, Checkout, Shipments and Tracking pages.",
        scenario: "Shipping one package usually means five tabs of copy-paste: lift the address out of an order email, key it into a carrier portal, compare prices across carriers, then buy and print the label somewhere else.",
        problemSolved: "The whole desk collapses into one paste. The assistant extracts the sender, recipient, package and contents, quotes every carrier at once, and hands off to a checkout that is already filled in, so the path from order to printable label is a couple of clicks.",
        howToUse: [
            "Paste an order into the assistant, or drop a .txt or .csv file.",
            "Groq pulls out the addresses, package and contents, then calls ShipStation for exact rates from every connected carrier.",
            "Pick a rate from the table, or use Choose cheapest / Choose fastest.",
            "Checkout opens pre-filled; add signature confirmation or insurance and the price updates with the carrier's itemized charges.",
            "Buy the label to get a label PDF and tracking number you can print, download (PDF, PNG or ZPL) or void.",
        ],
        outcomes: [
            "One paste goes from a messy order to exact multi-carrier rates; the demo run returned 14 rates in 7.4s.",
            "Cheapest, Best value and Fastest picks, with USPS Media Mail only offered when the contents are books or media.",
            "Label safety by default: the production key never buys labels unless ALLOW_LIVE_LABELS=1, and the app never collects card numbers.",
            "Keeps the legacy AWS Bedrock Agent as a switchable assistant provider (CHAT_PROVIDER=bedrock), so the original team build still runs.",
            "Runs with no keys on labelled demo data; 54 tests drive every page, including the full Rates → Checkout → label flow, without network calls.",
        ],
        progress: [
            { title: "Legacy: Bedrock prototype", detail: "The team's first version: a Streamlit chat app calling a deployed AWS Bedrock Agent via boto3 with IAM-scoped invocation, plus quick-action buttons.", state: "done" },
            { title: "ShipStation rebuild", detail: "Exact rates, estimates, labels, void, tracking and address validation through the ShipStation API v2.", state: "done" },
            { title: "AI checkout", detail: "Groq tool-calling agent that builds shipments from pasted text and hands off to a pre-filled checkout.", state: "done" },
            { title: "Live tracking coverage", detail: "Tracking falls back to carrier pages or simulated scans when the plan or sandbox lacks API tracking.", state: "in-progress" },
        ],
        futureGoals: [
            "Batch shipping: paste a CSV of orders and buy every label in one pass.",
            "Cost-history trends and per-carrier spend analytics on the Dashboard.",
            "Store integrations that pull new orders in automatically.",
        ],
        tech: [
            { name: "Python", icon: "devicon-python-plain colored" },
            { name: "Streamlit", icon: "devicon-streamlit-plain colored" },
            { name: "ShipStation API", icon: "" },
            { name: "Groq", icon: "" },
            { name: "AWS Bedrock", icon: "devicon-amazonwebservices-plain colored" },
            { name: "pytest", icon: "" }
        ],
        links: { live: "#", github: "https://github.com/Shipping-Agent/shipping-agent" },
        image: "/projects/shipping-agent/demo-poster.jpg",
        logoIcon: "/projects/shipping-agent/icon.svg",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "video",
                src: "/projects/shipping-agent/demo.mp4",
                poster: "/projects/shipping-agent/demo-poster.jpg",
                title: "Paste an order, get a label",
                caption: "A 24-second demo: an order is pasted into the assistant, ShipStation returns 14 rates, Choose cheapest opens checkout, and a USPS Media Mail label prints. The order, rates and tracking number come from a real run against the ShipStation sandbox with Groq.",
            },
            {
                type: "image",
                src: "/projects/shipping-agent/screen-rates.jpg",
                title: "Rates",
                caption: "12 rates from 4 carriers side by side, with carrier logos and Cheapest, Best value and Fastest picks, then Ship cheapest or Ship fastest in one click.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/shipping-agent/screen-dashboard.jpg",
                title: "Dashboard",
                caption: "Shipments, labels and postage at a glance, with shortcuts to compare and ship, track a package or ask the assistant.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/shipping-agent/screen-assistant.jpg",
                title: "Assistant",
                caption: "Paste an order to build a shipment, quote a package or track a delivery, all in plain language.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/shipping-agent/screen-checkout-label.jpg",
                title: "Checkout: label and options",
                caption: "Ship date, delivery confirmation, insurance and label format (PDF, PNG or ZPL), with a live preview of the label.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/shipping-agent/screen-checkout-review.jpg",
                title: "Checkout: review and pay",
                caption: "Every detail on one screen with Edit links, then a test label in sandbox mode or payment in ShipStation.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/shipping-agent/screen-tracking.jpg",
                title: "Tracking",
                caption: "Status, delivery date and every carrier scan in one place.",
                frame: "browser",
            },
        ],
        screensNote: "Screenshots of the app running in demo mode, with simulated rates and fictional addresses.",
        legacy: {
            title: "Shipping Agent Assistant (AWS Bedrock)",
            summary: "The project started as Shipping Agent Assistant, a four-person team prototype. It was a single-page Streamlit chat app wired straight to a deployed AWS Bedrock Agent through boto3. The agent called the ShipStation API for rates and tracking, and answered in the chat as prose. Its source still lives in the original repo, and the rebuild keeps that Bedrock Agent as an optional assistant provider.",
            features: [
                "Chat with a deployed AWS Bedrock Agent through boto3, with IAM-scoped invocation and session IDs.",
                "The Bedrock Agent called the ShipStation API itself to fetch shipping rates and tracking.",
                "A sidebar form for the AWS region, agent ID and alias ID. Credentials loaded only from environment variables, never hard-coded.",
                "Quick-action buttons for Get Shipping Rates, Track Package and Clear Chat.",
                "Rates and tracking came back as chat text, so they could not be compared, picked or turned into a label.",
            ],
            changes: [
                "ShipStation results became structured data instead of chat text: a rate table you can sort and pick from, plus labels, void and tracking through the ShipStation API v2.",
                "The Bedrock Agent is no longer the core. A Groq tool-calling agent builds shipments from a pasted order, and Bedrock stays switchable with CHAT_PROVIDER=bedrock.",
                "One chat page grew into a full desk: Dashboard, Rates, Checkout, Shipments, Tracking and the Assistant.",
                "Added what the prototype never had: a checkout that ends in a printable label, label-safety rules, a keyless demo mode and 54 tests.",
            ],
            github: "https://github.com/TRUPALIX9/Shipping-Agent-AWS",
            screens: [
                {
                    type: "image",
                    src: "/projects/shipping-agent/legacy-chat.svg",
                    title: "Chat with the Bedrock agent",
                    caption: "The agent quotes three shipping rates and tracks a package, with the AWS Agent Configuration form in the sidebar.",
                    frame: "browser",
                },
                {
                    type: "image",
                    src: "/projects/shipping-agent/legacy-connect.svg",
                    title: "Connecting to the agent",
                    caption: "The sidebar form shows the Connecting to AWS Bedrock Agent spinner while the main area still reads Not Connected.",
                    frame: "browser",
                },
                {
                    type: "image",
                    src: "/projects/shipping-agent/legacy-quick-actions.svg",
                    title: "Quick actions",
                    caption: "Get Shipping Rates, Track Package and Clear Chat, with the Getting shipping rates spinner and the session ID footer.",
                    frame: "browser",
                },
            ],
        },
        mermaidChart: `
graph LR
    classDef client fill:#2563EB,stroke:#8AB4FF,color:#fff
    classDef ai fill:#7C3AED,stroke:#C4B5FD,color:#fff
    classDef api fill:#0F766E,stroke:#5EEAD4,color:#fff
    classDef db fill:#374151,stroke:#9CA3AF,color:#fff

    UI[Streamlit pages + Ask AI]:::client
    Agent[Groq tool-calling agent]:::ai
    Bedrock[AWS Bedrock Agent, optional]:::ai
    Tools[Shipping tools: quote, create shipment, track, validate]:::client
    SS[ShipStation API v2]:::api
    Store[(data/quotes.json)]:::db

    UI --> Agent
    UI -.-> Bedrock
    Agent --> Tools
    UI -- Rates / Checkout --> Tools
    Tools -- rates, labels, tracking --> SS
    UI --> Store
        `
    },
    {
        slug: "fire-forecasting",
        title: "Fire Forecasting",
        tagline: "Wildfire risk dashboard prototype for the Tri-County area, built on bundled sample forecasts.",
        description: "A Next.js dashboard prototype showing wildfire risk for Santa Barbara, Ventura and Los Angeles counties: KPI cards, a Leaflet forecast map, an ApexCharts risk chart and a site table, all driven by a small sample dataset built from a committed trihourly weather CSV. The monitoring sites and risk probabilities are fictional sample data, and the UI labels them that way. An earlier version included a Python ML pipeline (FIRMS, RAWS and FRAP data with ANN/LSTM models) and a FastAPI backend; that code now lives only in the git history while the project restarts from the front end.",
        scenario: "Fire-risk planning starts with a clear picture of which sites are trending toward danger over the next few days. This project works out what that operator view should look like before a live model sits behind it.",
        problemSolved: "A forecast window (start date plus a 24, 48 or 72-hour horizon) drives four KPI cards, a map of sites coloured by risk level, a per-site risk chart with threshold and peak markers, and a site table, all recomputed from the bundled sample.",
        howToUse: [
            "Install dependencies and start the Next.js dev server.",
            "Pick a forecast start date and a 24h, 48h or 72h horizon over the 15-17 Aug 2023 sample.",
            "Click a map marker or a table row to switch the risk chart to that site.",
            "Open /map for the full-width map with layer toggles and the risk legend.",
        ],
        outcomes: [
            "Forecast dashboard with KPI cards for peak risk, sites above the 0.50 threshold, max temperature and min humidity.",
            "Leaflet map with the Tri-County bounding box, risk-coloured site markers, popups, a legend and a scale bar.",
            "ApexCharts risk chart with threshold and peak annotations, linked to the map and the table.",
            "Reproducible sample data: a script rebuilds the bundled JSON from the weather CSV.",
        ],
        progress: [
            { title: "Dashboard prototype", detail: "KPI cards, forecast map, risk chart and site table on bundled sample data.", state: "done" },
            { title: "Build and theming", detail: "Production build fixed, MUI theme and Inter typography applied.", state: "done" },
            { title: "Saved settings", detail: "Settings are stored in the browser but not yet applied to the dashboard.", state: "planned" },
            { title: "Model-backed forecasts", detail: "Serve real forecasts from a trained model; the original pipeline lives in git history.", state: "planned" },
        ],
        futureGoals: [
            "Apply the saved Settings (units, theme) to the dashboard.",
            "Serve real forecasts from a trained model instead of sample data.",
        ],
        tech: [
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Material UI", icon: "devicon-materialui-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/fire-forecasting" },
        image: "/projects/fire-forecasting/banner.svg",
        logoIcon: "/projects/fire-forecasting/icon.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/fire-forecasting/screen-dashboard.svg",
                title: "Dashboard",
                caption: "KPI cards, a Leaflet forecast map, a 72-hour ApexCharts risk chart and the site forecast table, all on bundled sample data.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/fire-forecasting/screen-map.svg",
                title: "Forecast Map",
                caption: "Full-width Leaflet map with layer toggles, the Tri-County bounding box, a risk legend and a site popup.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/fire-forecasting/screen-ml-history.svg",
                title: "ML History",
                caption: "Model training runs and KPI cards, clearly labelled as example data.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/fire-forecasting/screen-settings.svg",
                title: "Settings",
                caption: "General and display preferences, saved in the browser.",
                frame: "browser",
            }
        ]
    },
    {
        slug: "motion-detection",
        title: "ZoneWatch",
        tagline: "C# Windows app integrating ONVIF IP cameras with EmguCV motion detection and PTZ control.",
        description: "A C# WinForms desktop application that connects to ONVIF-compliant IP cameras via their device and media service endpoints. Uses EmguCV (OpenCV wrapper) for real-time motion detection, and implements continuous, absolute, and relative PTZ (pan-tilt-zoom) camera control over ONVIF + RTSP streams.",
        scenario: "Security operators needed a single Windows desktop tool to manage ONVIF IP cameras — connecting via RTSP, controlling PTZ movement, and detecting motion — without relying on vendor-specific software.",
        problemSolved: "Implements ONVIF device management, media service queries, and PTZ control APIs directly from C#, combined with EmguCV frame-differencing for motion detection on live RTSP streams.",
        howToUse: [
            "Enter the camera IP address, port, username, and password (or paste an RTSP URL for auto-parsing).",
            "Connect to the ONVIF device service to discover media profiles and stream URIs.",
            "Use PTZ controls (continuous, absolute, relative move) to position the camera.",
            "Start motion detection to run EmguCV frame differencing on the live RTSP stream.",
        ],
        outcomes: [
            "ONVIF device management and media service integration for IP camera discovery.",
            "PTZ control: continuous, absolute, relative move, and configuration retrieval via ONVIF.",
            "RTSP URL parsing and EmguCV-powered real-time motion detection on live camera feeds.",
            "Windows service support via FFMPEG stream forwarding module.",
        ],
        progress: [
            { title: "ONVIF camera integration", detail: "Device management, media profiles, and RTSP stream connection via ONVIF service endpoints.", state: "done" },
            { title: "PTZ control", detail: "Continuous, absolute, and relative PTZ move commands implemented via ONVIF PTZ API.", state: "done" },
            { title: "EmguCV motion detection", detail: "Real-time frame differencing on RTSP streams using EmguCV (C# OpenCV wrapper).", state: "done" },
            { title: "Alert classification", detail: "Sensitivity tuning and object classification improvements are future work.", state: "planned" },
        ],
        futureGoals: [
            "Add motion event history logging and clip saving.",
            "Improve false-positive reduction with background subtraction models.",
            "Expand to multi-camera grid views.",
        ],
        tech: [
            { name: "C#", icon: "devicon-csharp-plain colored" },
            { name: ".NET", icon: "devicon-dotnetcore-plain colored" },
            { name: "OpenCV", icon: "devicon-opencv-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/Motion-Detection-Windows-App" },
        image: "/projects/motion-detection/banner.svg",
        architectureImage: "/projects/motion-detection/architecture.svg",
        logoIcon: "/projects/motion-detection/icon.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/motion-detection/screen-motion-detection.svg",
                title: "Motion detection",
                caption: "The Output Frame tab: a worker inside the blue zone is boxed in red and turns the indicator green, while the car outside the zone is boxed but ignored.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/motion-detection/screen-zone-drawing.svg",
                title: "Drawing a zone",
                caption: "On the Original Frame tab, click points across the drive aisle to outline the zone (yellow while open), then double-click to close it.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/motion-detection/screen-ptz-controls.svg",
                title: "PTZ Controls",
                caption: "The ONVIF window opened from the main window: camera login, zoom-only continuous, absolute and relative moves, and a quick motion test feed.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/motion-detection/screen-stream-forwarding.svg",
                title: "Stream Forwarding",
                caption: "The companion tool relays one RTSP stream to another with ffmpeg -c copy and logs the FFmpeg command it built.",
                frame: "windows",
            }
        ]
    },
    {
        slug: "vehicle-log",
        title: "Gatelog",
        tagline: "Proof-of-concept Windows installer and updater for a vehicle-log server stack.",
        description: "A C# WinForms (.NET 6) setup wizard that installs the server side of a number-plate-recognition vehicle-log system on Windows: MongoDB and mongosh, an Eclipse Mosquitto MQTT broker, a web portal and a detection bot, each registered as an auto-start Windows service with NSSM. When the services already exist it switches to an update screen that pulls newer component releases from an S3 bucket. It is a proof of concept: the installer payloads are not part of the repository.",
        scenario: "Setting up a vehicle-log server on a Windows machine meant installing a database, a broker, a portal and a bot by hand, then keeping each one running and up to date.",
        problemSolved: "One wizard relaunches itself as administrator, shows a notice, asks for an install location, then runs an eight-step install with a live log that stops at the first failed step. Existing installs go straight to an S3-backed update screen that stops, replaces and restarts each service.",
        howToUse: [
            "Run the app on Windows; it relaunches itself with administrator rights.",
            "Accept the notice and choose an install location (a Gatelog folder under C:\\Program Files by default).",
            "Follow the eight-step install and its timestamped log as each component is extracted and registered as a service.",
            "On a machine where all four services exist, pick a newer release to update each component from S3.",
        ],
        outcomes: [
            "Eight-step install: MongoDB 7.0.1, mongosh 2.1.1, Mosquitto 2.0.18, an auth-enabled mongod service, and the portal and bot registered with NSSM.",
            "Install-or-update detection based on the four installed Windows services.",
            "S3 update channel comparing installed and available component versions.",
            "Uninstall script that removes the services and the install folder.",
        ],
        progress: [
            { title: "Install wizard", detail: "Elevated relaunch, notice, install location and the eight-step install with a live log.", state: "done" },
            { title: "S3 update channel", detail: "Lists newer releases and updates each service in place.", state: "done" },
            { title: "Rebrand and startup fix", detail: "Rebranded to Gatelog and fixed the startup crash.", state: "done" },
            { title: "End-to-end test", detail: "A full install with real payload archives has not been run since the refresh.", state: "planned" },
        ],
        futureGoals: [
            "Run an end-to-end install with real payload archives.",
            "Check nssm, mongod and sc exit codes so a failed service is reported.",
        ],
        tech: [
            { name: "C#", icon: "devicon-csharp-plain colored" },
            { name: ".NET", icon: "devicon-dotnetcore-plain colored" },
            { name: "MongoDB", icon: "devicon-mongodb-plain colored" },
            { name: "AWS S3", icon: "devicon-amazonwebservices-plain-wordmark colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/Vehicle-Log-Managment-System" },
        image: "/projects/vehicle-log/banner.svg",
        architectureImage: "/projects/vehicle-log/architecture.svg",
        logoIcon: "/projects/vehicle-log/icon.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/vehicle-log/screen-installer.svg",
                title: "Installing",
                caption: "The eight-step install mid-way: progress at 57% on Creating MongoDBUser, with a timestamped log of MongoDB, mongosh and Mosquitto being set up as services.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/vehicle-log/screen-license.svg",
                title: "Notice step",
                caption: "The proof-of-concept notice loaded from Setups/EULA.docx; Next unlocks once the checkbox is ticked.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/vehicle-log/screen-location.svg",
                title: "Install location",
                caption: "Choosing where to install; the app creates a Gatelog folder under C:\\Program Files by default.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/vehicle-log/screen-update.svg",
                title: "Update step",
                caption: "When all four services exist: pick a newer release from the S3 bucket, compare component versions, and update each service in turn.",
                frame: "windows",
            }
        ]
    },
    {
        slug: "comp-599-webgl",
        title: "WebGL Academic Presentation",
        tagline: "A seminar slide deck where every slide runs its own live Three.js scene.",
        description: "A Next.js page laid out like a slide deck for a graduate seminar on browser-based 3D visualization. A sidebar carries each slide's points while a full-height canvas runs that slide's Three.js scene: a 30,000-point cloud, a 3D equation plotter, an icosphere point cloud, GLB model loading, a highway driving demo and an FPS target-practice scene. The seminar paper and slides, which review three WebGL research papers, live alongside it.",
        scenario: "Slides about WebGL are more convincing when the slides themselves are WebGL, so each technique had to be demonstrated live rather than described.",
        problemSolved: "Six slides each pair notes with a live canvas; every slide change disposes the old renderer and builds the next, and /highway and /bunker open straight on their demos for jumping mid-talk.",
        howToUse: [
            "Start the Next.js dev server and open the deck.",
            "Step through the six slides with Back and Next.",
            "On slide 2, pick an equation and orbit the plot with the mouse.",
            "Open /highway to steer with A/D, or /bunker for mouse-look target practice.",
        ],
        outcomes: [
            "GPU point cloud of 30,000 points in a single BufferGeometry.",
            "3D equation plotter with five equations, projected axis labels and OrbitControls.",
            "GLB asset loading with GLTFLoader and a highway driving demo with eased steering.",
            "FPS target practice with raycast hits from the crosshair.",
        ],
        progress: [
            { title: "Six live slides", detail: "Point cloud, equation plotter, icosphere, GLB loading, highway and FPS scenes.", state: "done" },
            { title: "Build and styling fixes", detail: "Fixed the TypeScript build error and the CSS rule that hid the chart legend.", state: "done" },
        ],
        futureGoals: [],
        tech: [
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Three.js", icon: "devicon-threejs-original" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/comp-599-webgl" },
        image: "/projects/comp-599-webgl/banner.svg",
        logoIcon: "/projects/comp-599-webgl/icon.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/comp-599-webgl/screen-graphing.svg",
                title: "3D Mathematical Graphing",
                caption: "Slide 2: the 3D Spiral (Helix) plotted on axes you can orbit, with X/Y/Z labels and the equation legend.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/comp-599-webgl/screen-compute.svg",
                title: "Super-Compute Visualization",
                caption: "Slide 1: 30,000 GPU-rendered cyan points in a slowly rotating 40-unit cube.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/comp-599-webgl/screen-highway.svg",
                title: "Highway Driving Simulation",
                caption: "Slide 5 (/highway): the Dodge Challenger steering with A/D along a looping highway model.",
                frame: "browser",
            },
            {
                type: "image",
                src: "/projects/comp-599-webgl/screen-fps.svg",
                title: "FPS Combat Interaction",
                caption: "Slide 6 (/bunker): mouse-look, a camera-mounted rifle and raycast hits on green targets.",
                frame: "browser",
            }
        ]
    },
    {
        slug: "file-system-engine",
        title: "File System Engine",
        tagline: "Electron desktop file manager with a dual-pane Transfer Hub and a treemap disk analyzer.",
        description: "An Electron desktop app for macOS and Windows for everyday file housekeeping: a dual-pane Transfer Hub for moving work between folders, external drives and an Android phone over adb, and a Storage Analyzer that scans a folder and draws a treemap of its largest subfolders. Every file, device and database call runs in the main process behind a typed, validated IPC API, with a sandboxed renderer and a local SQLite activity log.",
        scenario: "Standard OS file managers lack the dual-pane workflows, activity audit trails, and secure IPC boundaries required for power users and agentic automation tooling.",
        problemSolved: "File System Engine delivers a dual-pane Electron desktop experience with type-safe IPC between main and renderer processes, SQLite activity records for every file operation, and a strict CSP that allows MUI dynamic styling without external script execution.",
        howToUse: [
            "Launch the app on macOS or Windows (grant Full Disk Access on macOS or elevation on Windows if prompted).",
            "Use the dual-pane browser to navigate directories side by side and drag/copy between panes.",
            "Use the quick-access sidebar to jump to Home, Downloads, Documents, or mounted drives.",
            "Review the activity log for a persistent record of all file operations performed.",
        ],
        outcomes: [
            "Dual-pane Transfer Hub: copy or move between panes, with confirmed moves that never overwrite existing items.",
            "Treemap disk analyzer: total size, file and directory counts, and the largest folders sized by share of the total.",
            "Drives, folders and Android phones over adb in one sidebar, refreshed every 10 seconds.",
            "Locked-down Electron shell: context isolation, a sandboxed renderer, Zod-validated IPC and a production CSP.",
        ],
        progress: [
            { title: "Dual-pane file manager", detail: "Transfer Hub, breadcrumbs, Quick Access and everyday file actions.", state: "done" },
            { title: "Storage Analyzer", detail: "Folder scan with a treemap of the largest subfolders.", state: "done" },
            { title: "Hardened IPC and CSP", detail: "Typed preload API, Zod validation and path checks on every request.", state: "done" },
            { title: "Duplicate detection and AI features", detail: "Planned, not built.", state: "planned" },
        ],
        futureGoals: [
            "Add duplicate detection.",
            "Build the planned AI-assisted housekeeping features.",
            "Ship signed macOS and Windows installers.",
        ],
        tech: [
            { name: "Electron", icon: "devicon-electron-original colored" },
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "SQLite", icon: "devicon-sqlite-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/file-system-engine" },
        image: "/projects/file-system-engine/banner.svg",
        architectureImage: "/projects/file-system-engine/architecture.svg",
        logoIcon: "/projects/file-system-engine/icon.svg",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/projects/file-system-engine/screen-transfer-hub.svg",
                title: "Transfer Hub",
                caption: "Two file panes side by side: copy or move the focused pane's selection into the other pane's folder.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/file-system-engine/screen-storage-analyzer.svg",
                title: "Storage Analyzer",
                caption: "Scan a folder for its total size, file and directory counts, and a treemap of its largest folders.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/file-system-engine/screen-explorer.svg",
                title: "Explorer",
                caption: "Browse an Android phone over adb alongside local drives, with the Select Drive menu open.",
                frame: "windows",
            },
            {
                type: "image",
                src: "/projects/file-system-engine/screen-settings.svg",
                title: "Settings",
                caption: "macOS Full Disk Access status and the Light, Dark and System theme toggle, in the light theme.",
                frame: "windows",
            }
        ]
    }
];
