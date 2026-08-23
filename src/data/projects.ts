
export type ProjectMediaItem = {
    type: "image" | "video";
    src: string;
    title: string;
    caption: string;
    poster?: string;
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
};

export const projects: Project[] = [
    {
        slug: "storedesk",
        title: "StoreDesk",
        tagline: "Production-grade, 5-module local-first retail command center & POS sync ecosystem for convenience stores.",
        description: "A 5-module local-first POS ecosystem for convenience stores. Connects directly to live Verifone Commander registers via NAXML for PLU seeding, vendor cost analysis, and automated reporting without ISP dependencies.",
        scenario: "Convenience store and gas station operators require real-time POS visibility, catalog management, vendor cost analysis, and automated sales reporting on the store floor without risking store shutdown during internet outages.",
        problemSolved: "StoreDesk guarantees continuous store operations through 5 specialized modules: 1) StoreDesk Worker (Local Edge Node communicating with Verifone Commander via NAXML), 2) StoreDesk Desktop UI (Electron back-office command center), 3) StoreDesk Cloud Hub (GCP WebSocket Relay & Setup Key Server), 4) StoreDesk Web (Next.js 15 multi-store cloud dashboard), and 5) StoreDesk Mobile (Android Flutter barcode scanner with sub-100ms WebSocket lookups).",
        howToUse: [
            "Launch StoreDesk Desktop UI (Electron) on the back-office PC and activate using a secure Setup Key generated from StoreDesk Web.",
            "StoreDesk Worker automatically seeds 10,000+ PLUs via direct NAXML HTTP requests from the Verifone Commander register into local MongoDB.",
            "Use StoreDesk Mobile (Android Flutter app) to scan floor barcodes, instantly fetching live cost, margin, and retail prices over WebSocket relays.",
            "Review profit margins, vendor costs, and automated Google Sheets sales reporting from StoreDesk Web.",
        ],
        outcomes: [
            "Architected across 5 Git submodules: StoreDesk Worker, StoreDesk Desktop UI, StoreDesk Cloud Hub, StoreDesk Web, and StoreDesk Mobile.",
            "Eliminates downtime risk by running StoreDesk Worker local-first on the store edge network with Verifone Commander.",
            "Reduces cloud data transfer payloads from ~15MB XML dumps to lightweight MD5 delta-hash synchronization.",
            "Delivers compiled Windows .exe installers for StoreDesk Desktop UI and Android .apk binaries for StoreDesk Mobile alongside StoreDesk Web.",
        ],
        progress: [
            { title: "StoreDesk Worker (NAXML Integration)", detail: "Bulk XML PLU auto-seeding (pageSize=9999) with local MongoDB disk resilience.", state: "done" },
            { title: "StoreDesk Cloud Hub (WSS Relay)", detail: "Sub-100ms WebSocket lookup relay connecting StoreDesk Mobile with StoreDesk Worker.", state: "done" },
            { title: "StoreDesk Desktop UI & Web Admin", detail: "Back-office Electron control room and Next.js 15 multi-store dashboard.", state: "done" },
            { title: "Production Multi-Platform Releases (v0.0.4)", detail: "Windows Desktop .exe installer and Android .apk binaries published on GitHub Releases.", state: "done" },
        ],
        futureGoals: [
            "Expand StoreDesk Worker POS connectors to Gilbarco Passport and Wayne Nucleus registers.",
            "Integrate AI-driven vendor invoice OCR parsing in StoreDesk Web.",
            "Deploy multi-store inventory transfers in StoreDesk Web.",
        ],
        tech: [
            { name: "Electron", icon: "devicon-electron-original colored" },
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Node.js", icon: "devicon-nodejs-plain colored" },
            { name: "Flutter", icon: "devicon-flutter-plain colored" },
            { name: "MongoDB", icon: "devicon-mongodb-plain colored" },
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "Google Cloud", icon: "devicon-googlecloud-plain colored" }
        ],
        links: {
            live: "https://store-desk-adpgsbpyf-store-desk.vercel.app/",
            github: "https://github.com/TRUPALIX9/StoreDesk"
        },
        image: "/storedesk_logo.svg",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "/storedesk_logo.svg",
                title: "StoreDesk Desktop UI Command Center",
                caption: "Electron Desktop UI featuring Price Book, Cost Analysis, POS Sales, and Vendor Review.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&w=1200&q=80",
                title: "StoreDesk Mobile Companion Scanner",
                caption: "Flutter Android app executing sub-100ms barcode price & margin lookups over WebSockets.",
            },
        ],
        architectureImage: "/projects/storedesk_architecture.svg",
        logoIcon: "/storedesk_icon.svg"
    },
    {
        slug: "retailsync",
        title: "RetailSync SaaS",
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
        image: "/retailsync_logo.png",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "/retailsync_logo.png",
                title: "RetailSync Platform",
                caption: "Multi-tenant workspace shell with RBAC-aware navigation across POS, Accounting, and QuickBooks.",
            },
        ],
        architectureImage: "/projects/retailsync_architecture.svg",
        logoIcon: "/retailsync_logo.png"
    },
    {
        slug: "web-warehouse",
        title: "Web-Warehouse 3D",
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
        image: "/web_warehouse_card.png",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "/web_warehouse_card.png",
                title: "3D warehouse concept",
                caption: "Swap this with a screen capture of the warehouse map or pallet flow.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80",
                title: "Zone inspection view",
                caption: "Use another image to show how users inspect aisles, bins, or pallet locations.",
            },
            {
                type: "video",
                src: "/project-media/web-warehouse/tour.mp4",
                poster: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80",
                title: "3D interaction demo",
                caption: "A short clip can show camera movement, selection, and item drill-down.",
            },
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
        slug: "card-snap",
        title: "Card Vault (Card-Snap OCR)",
        tagline: "Cross-platform mobile app that scans business cards, extracts contacts via OCR, and syncs them to a backend.",
        description: "React Native (Expo) mobile client for business-card scanning built with TypeScript and file-based routing via Expo Router. Captures card images with expo-camera, sends base64 data to a Node.js backend that runs OCR + regex NLP parsing, and returns structured contact fields. Supports manual entry, light/dark mode, and local/backend sync.",
        scenario: "Networking events leave people with stacks of business cards and no fast path into organized contacts. Manual data entry is error-prone and time-consuming, especially after conferences or client meetings.",
        problemSolved: "Card Vault removes manual entry entirely: the camera scan triggers an async OCR pipeline on the backend, parses name, title, company, email, and phone number using regex NLP, then returns structured data for review and save.",
        howToUse: [
            "Open the app on Android, iOS, or Web via Expo Go, then navigate to the scan screen.",
            "Capture or upload a business card photo. The app encodes the image as base64 and sends it to the Node.js backend API.",
            "Review the extracted fields (name, title, company, email, phone) and correct any low-confidence values before saving.",
            "Browse saved contacts in the Contacts tab or add records manually via the Add screen.",
        ],
        outcomes: [
            "Expo Router file-based navigation across Home, Contacts, and Add tabs with a full Stack layout.",
            "Configurable backend URL via .env so the same codebase targets local, staging, or production APIs.",
            "ThemeContext-driven light/dark mode applied globally across all screens.",
            "OCR and NLP parsing handled server-side so the mobile client stays lightweight.",
        ],
        progress: [
            { title: "Camera capture & base64 pipeline", detail: "expo-camera integration sends card images to the backend API for processing.", state: "done" },
            { title: "OCR + NLP contact extraction", detail: "Backend parses name, title, company, email, and phone from OCR text using regex NLP.", state: "done" },
            { title: "Contact CRUD & manual entry", detail: "Users can review, save, edit, and add contacts manually from the mobile app.", state: "done" },
            { title: "Confidence scoring & multilingual support", detail: "Visual confidence indicators and multilingual card parsing are future improvements.", state: "planned" },
        ],
        futureGoals: [
            "Add per-field confidence scores and visual correction hints.",
            "Support direct CRM export (HubSpot, Salesforce).",
            "Expand regex NLP parsing for multilingual and non-latin card layouts.",
        ],
        tech: [
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "React Native", icon: "devicon-react-original colored" },
            { name: "Node.js", icon: "devicon-nodejs-plain colored" },
            { name: "Tesseract.js", icon: "devicon-javascript-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/card-snap-frontend" },
        image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "grid",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=1200&q=80",
                title: "Capture and extract flow",
                caption: "Replace this with your mobile screenshot sequence or short demo recording.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
                title: "Field review screen",
                caption: "A second mobile screen can show extracted fields and confidence checks.",
            },
            {
                type: "video",
                src: "/project-media/card-snap/mobile-demo.mp4",
                poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
                title: "Scan to contact demo",
                caption: "Use a short phone recording to show capture, OCR, and correction.",
            },
        ],
        mermaidChart: `
flowchart TD
    classDef client fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef server fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    classDef db fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#fff

    App[React Native Expo Mobile Client]:::client
    API[Node.js TypeScript Backend]:::server
    OCR[Tesseract.js OCR Engine]:::server
    NLP[NLP Parsing Module]:::server
    DB[(MongoDB Database)]:::db

    App -- Upload Card Image --> API
    API -- Extract Text --> OCR
    OCR -- Parse Contact Info --> NLP
    NLP -- Save Structured Data --> DB
        `
    },
    {
        slug: "shipping-agent-aws",
        title: "AWS Bedrock Shipping Agent",
        tagline: "Streamlit frontend wired to an AWS Bedrock Agent for conversational shipping and logistics assistance.",
        description: "A Python + Streamlit web app that connects directly to a deployed AWS Bedrock Agent. Users describe shipping needs in natural language and the agent responds with rate guidance, tracking context, or operational recommendations. Pre-built quick-action buttons handle common shipping queries without typing.",
        scenario: "Logistics teams jump between carrier websites, spreadsheets, and email threads to compare rates and check tracking status. There was no unified conversational entry point that could surface relevant data on demand.",
        problemSolved: "By wrapping AWS Bedrock Agents in a Streamlit chat interface, this tool lets operators ask shipping questions in plain language and receive structured responses — replacing manual portal hopping with a single conversational workflow.",
        howToUse: [
            "Configure .env with your AWS Access Key, Secret, Region, Bedrock Agent ID, and Alias ID.",
            "Run 'streamlit run app.py' and open the app at localhost:8501.",
            "Type a shipping request or click a quick-action button (e.g. 'Compare rates' or 'Check tracking').",
            "The agent invokes AWS Bedrock with proper IAM scoping and streams the response into the chat window.",
        ],
        outcomes: [
            "Real-time conversational interface backed by a live AWS Bedrock Agent session.",
            "Pre-built quick-action buttons reduce friction for common logistics queries.",
            "Responsive across desktop, tablet, and mobile — deployable as a shareable team tool.",
            "Credentials never hard-coded: all AWS config loaded from environment variables.",
        ],
        progress: [
            { title: "Bedrock Agent integration", detail: "Streamlit chat app connected to AWS Bedrock Agent via boto3 with IAM-scoped invocation.", state: "done" },
            { title: "Quick actions & UI", detail: "Pre-built action buttons and clean chat interface implemented.", state: "done" },
            { title: "Carrier coverage expansion", detail: "Broader logistics tool integrations and tracking provider coverage still being added.", state: "in-progress" },
            { title: "Observability & error tracing", detail: "Full production traceability and fallback handling on the roadmap.", state: "planned" },
        ],
        futureGoals: [
            "Add cost-history trend comparisons and shipping analytics.",
            "Build an approval workflow for procurement teams.",
            "Extend agent knowledge base with carrier-specific SLA data.",
        ],
        tech: [
            { name: "Python", icon: "devicon-python-plain colored" },
            { name: "AWS", icon: "devicon-amazonwebservices-plain colored" },
            { name: "Streamlit", icon: "devicon-streamlit-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/Shipping-Agent-AWS" },
        image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=1200&q=80",
                title: "Shipping conversation flow",
                caption: "Replace this with a conversation screenshot or walkthrough video poster.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
                title: "Rate comparison output",
                caption: "Use another asset for side-by-side shipping options or tracking states.",
            },
        ]
    },
    {
        slug: "fire-forecasting",
        title: "Fire Forecasting System",
        tagline: "End-to-end ML pipeline predicting wildfire risk across Southern California WUI sites using NASA FIRMS data.",
        description: "A complete Python machine-learning system that predicts next-day fire occurrence for 20+ Wildland-Urban Interface sites in Ventura, Santa Barbara, and LA counties. Ingests real NASA FIRMS VIIRS satellite data (75K+ records), RAWS daily weather features, and CAL FIRE FRAP historical perimeters. Trains ANN/LSTM models and surfaces predictions through a Next.js + FastAPI dashboard with interactive Leaflet maps and ApexCharts.",
        scenario: "Emergency planning teams and fire risk analysts needed a data-driven, reproducible system that combines satellite fire detection, historical weather patterns, and geographic perimeter data to forecast where fire risk would escalate — without relying on manual signal interpretation.",
        problemSolved: "The pipeline automates data ingestion, feature engineering (7-day lags, rolling stats, seasonality, neighbor features), chronological train/val/test splitting, class-imbalance weighting, and ANN/LSTM training — then serves predictions and PR/ROC curves through a full-stack dashboard operators can query interactively.",
        howToUse: [
            "Download FIRMS VIIRS satellite data and FRAP perimeter files from Google Drive, then run 'make fetch-firms' and 'make fetch-frap' to generate processed CSVs.",
            "Run the FastAPI backend to train the ANN model (~1-2 min on CPU) or LSTM (~5-8 min). The 9 REST endpoints expose metrics, model artifacts, and geospatial data.",
            "Open the Next.js dashboard to inspect KPI cards, PR/ROC curves, confusion matrix, and threshold tuning controls.",
            "Switch to the Leaflet map view to review per-site predictions, FRAP historical overlays, and WUI boundary markers.",
        ],
        outcomes: [
            "75K+ NASA FIRMS VIIRS records across 2019–2024 processed into a chronological ML dataset.",
            "ANN (256→128→ 64→1 with Dropout) and LSTM (14-day lookback) trained with automatic class-weight computation for imbalanced fire labels.",
            "Interactive Leaflet map with 20+ WUI site markers, FRAP perimeter overlays, and per-site performance breakdowns.",
            "Strict data pipeline hygiene: target is t+1, scaler fit on train only, no data leakage across 70/15/15 chronological split.",
        ],
        progress: [
            { title: "Data pipeline (FIRMS + RAWS + FRAP)", detail: "NASA VIIRS ingestion, RAWS weather features, and FRAP perimeter joins are automated via Makefile.", state: "done" },
            { title: "ANN & baseline models", detail: "Logistic Regression, Random Forest, and ANN all trained and evaluated with PR-AUC as the primary metric.", state: "done" },
            { title: "LSTM with 14-day lookback", detail: "LSTM model implemented as an optional extension to the ANN baseline.", state: "done" },
            { title: "Real-time weather feed integration", detail: "Live RAWS or NWS data ingestion for continuous daily inference not yet implemented.", state: "planned" },
        ],
        futureGoals: [
            "Add real-time RAWS weather feed ingestion for daily automated inference.",
            "Introduce evacuation-route map overlays for emergency planning teams.",
            "Expand WUI site coverage beyond the tri-county region.",
        ],
        tech: [
            { name: "Python", icon: "devicon-python-plain colored" },
            { name: "TensorFlow", icon: "devicon-tensorflow-original colored" },
            { name: "FastAPI", icon: "devicon-fastapi-plain colored" },
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "Pandas", icon: "devicon-pandas-original colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/fire-forecasting" },
        image: "https://images.unsplash.com/photo-1510253457173-7724a73747eb?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1510253457173-7724a73747eb?auto=format&fit=crop&w=1200&q=80",
                title: "Forecast visualization preview",
                caption: "Use this area for a chart screenshot, simulation view, or briefing visual.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
                title: "Scenario comparison",
                caption: "A second image can compare multiple conditions or forecast outputs.",
            },
        ]
    },
    {
        slug: "motion-detection",
        title: "Motion Detection VMS",
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
        image: "https://images.unsplash.com/photo-1557597774-9d273e3f60bc?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1557597774-9d273e3f60bc?auto=format&fit=crop&w=1200&q=80",
                title: "ONVIF camera control and motion detection",
                caption: "Windows desktop app connecting to ONVIF IP cameras with PTZ control and EmguCV motion detection.",
            },
        ]
    },
    {
        slug: "vehicle-log",
        title: "Vehicle Log System",
        tagline: "Windows desktop application for vehicle service tracking and maintenance scheduling.",
        description: "A C# WinForms desktop application for vehicle log management. Includes a Windows service component (via NSSM), service lifecycle management, and update management classes. Built with two primary form views for data entry and record management.",
        scenario: "Operations teams needed a structured desktop tool to log vehicle records, track service history, and manage maintenance schedules on Windows without relying on web-based tools.",
        problemSolved: "Provides a Windows-native WinForms interface backed by a Windows service for background operations, centralizing vehicle logs, service records, and scheduling into one local application.",
        howToUse: [
            "Launch the application on Windows and register vehicle records via Form1.",
            "Log service events and track maintenance history through the management views.",
            "The background Windows service (managed via NSSM) handles scheduled operations.",
        ],
        outcomes: [
            "WinForms desktop application with two primary form views for vehicle data management.",
            "Windows service integration via NSSM for background service lifecycle control.",
            "ServiceManager and UpdateManager classes for structured service and update handling.",
        ],
        progress: [
            { title: "Vehicle log UI", detail: "WinForms interface with Form1 and Form2 for record entry and management.", state: "done" },
            { title: "Windows service layer", detail: "Background service via NSSM with ServiceManager for lifecycle control.", state: "done" },
            { title: "Reporting and analytics", detail: "Dashboard-level reporting not yet implemented.", state: "planned" },
        ],
        futureGoals: [
            "Add reporting views for service cost and maintenance history.",
            "Introduce scheduled maintenance alerts.",
            "Migrate to a database-backed persistence layer.",
        ],
        tech: [
            { name: "C#", icon: "devicon-csharp-plain colored" },
            { name: ".NET", icon: "devicon-dotnetcore-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/Vehicle-Log-Managment-System" },
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "grid",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
                title: "Vehicle log desktop UI",
                caption: "WinForms application for vehicle record entry and service tracking.",
            },
        ]
    },
    {
        slug: "comp-599-webgl",
        title: "COMP-599 WebGL Seminar",
        tagline: "Four interactive 3D browser experiences built for a WebGL seminar: Campus Explorer, Paper Plane Assault, Plane vs AI, and OrbitScope.",
        description: "A Next.js application hosting four WebGL seminar projects for CSUCI COMP-599. Includes a highway scene, a bunker scene, and multiple interactive 3D experiences — Campus Explorer (3D campus tour), Paper Plane Assault, Plane vs AI, and OrbitScope (satellite tracker) — alongside a seminar paper and capability showcase presentation.",
        scenario: "A graduate WebGL seminar required building multiple distinct interactive 3D browser experiences demonstrating different rendering techniques, scene management, and user interaction patterns.",
        problemSolved: "Each project targets a specific WebGL concept: scene graph navigation (Campus Explorer), real-time collision and game logic (Paper Plane Assault / Plane vs AI), and orbital mechanics visualization (OrbitScope) — all delivered as a unified Next.js app.",
        howToUse: [
            "Navigate to each project route in the Next.js app (highway, bunker, and the main showcase).",
            "Interact with 3D scenes using mouse and keyboard controls specific to each experience.",
            "Review the seminar paper and WebGL capabilities presentation in the docs folder.",
        ],
        outcomes: [
            "Four distinct WebGL experiences: Campus Explorer, Paper Plane Assault, Plane vs AI, OrbitScope.",
            "Hosted as a Next.js application with TypeScript and dedicated route-based scene loading.",
            "Includes seminar paper (DOCX) and WebGL Capabilities Showcase presentation (PPTX).",
        ],
        progress: [
            { title: "Campus Explorer", detail: "Interactive 3D campus tour scene complete.", state: "done" },
            { title: "Paper Plane Assault & Plane vs AI", detail: "Real-time flight and collision game modes complete.", state: "done" },
            { title: "OrbitScope", detail: "Satellite orbital tracking visualization complete.", state: "done" },
        ],
        futureGoals: [],
        tech: [
            { name: "JavaScript", icon: "devicon-javascript-plain colored" },
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "HTML5", icon: "devicon-html5-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/comp-599-webgl" },
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: []
    },
    {
        slug: "file-system-engine",
        title: "File System Engine",
        tagline: "Electron + React 19 desktop app with dual-pane file browsing, SQLite activity logging, and hardened IPC.",
        description: "A cross-platform desktop file manager built with Electron, React 19, and Material UI. Features dual-pane file browsing, smart breadcrumb navigation, quick-access sidebar, and a hardened architecture with context-isolated IPC, strict Content Security Policy, and SQLite-backed activity logging. Targets macOS and Windows.",
        scenario: "Standard OS file managers lack the dual-pane workflows, activity audit trails, and secure IPC boundaries required for power users and agentic automation tooling.",
        problemSolved: "File System Engine delivers a dual-pane Electron desktop experience with type-safe IPC between main and renderer processes, SQLite activity records for every file operation, and a strict CSP that allows MUI dynamic styling without external script execution.",
        howToUse: [
            "Launch the app on macOS or Windows (grant Full Disk Access on macOS or elevation on Windows if prompted).",
            "Use the dual-pane browser to navigate directories side by side and drag/copy between panes.",
            "Use the quick-access sidebar to jump to Home, Downloads, Documents, or mounted drives.",
            "Review the activity log for a persistent record of all file operations performed.",
        ],
        outcomes: [
            "Dual-pane file browser with smart breadcrumbs and quick-access sidebar — macOS and Windows.",
            "Type-safe Electron IPC with context isolation: renderer has no direct Node.js access.",
            "SQLite activity log persisting every file operation for audit and replay.",
            "Strict Content Security Policy configured to allow MUI dynamic styles while blocking external scripts.",
        ],
        progress: [
            { title: "Dual-pane file browser", detail: "Side-by-side browsing, breadcrumb nav, and sidebar implemented.", state: "done" },
            { title: "Hardened IPC & CSP", detail: "Context-isolated preload API and strict CSP configured.", state: "done" },
            { title: "SQLite activity logging", detail: "Persistent file operation records via SQLite.", state: "done" },
            { title: "Agentic Agent Pack", detail: "Integrated agent roles for automated maintenance — Phase 5/6 foundation in place.", state: "in-progress" },
        ],
        futureGoals: [
            "Complete Agent Pack roles for automated file maintenance and organization.",
            "Add cloud drive mounting (Google Drive, OneDrive).",
            "Ship signed macOS and Windows installers.",
        ],
        tech: [
            { name: "Electron", icon: "devicon-electron-original colored" },
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "SQLite", icon: "devicon-sqlite-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/file-system-engine" },
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: []
    },
    {
        slug: "logic-sprint",
        title: "Logic Sprint",
        tagline: "Flutter brain-training app with two mini-games, local high scores, and an optional Firestore global leaderboard.",
        description: "LogicSprint is a free Flutter (3.x) + Dart (3.12+) brain-training app for Android and iOS. Features two timed mini-games: Rocket Launch (dodge asteroids for 30 seconds) and Memory Lane (repeat flashing block sequences on 3×3 to 5×5 grids). Scores save locally via shared_preferences, with optional Firestore-backed Global Top 100 leaderboard — no login or ads required.",
        scenario: "Mobile users wanted quick sub-minute mental challenges they could play offline without accounts, with an optional path into competitive global rankings when Firebase is configured.",
        problemSolved: "Delivers two distinct timed mini-games in a single Flutter app with streak-based bonus scoring (+20 every 5-streak), per-game and per-difficulty local high scores, and a configurable Firestore leaderboard that activates only when Firebase credentials are provided.",
        howToUse: [
            "Install on Android or iOS. No login or account required.",
            "Play Rocket Launch: drag or use 3D direction buttons to dodge asteroids for 30 seconds.",
            "Play Memory Lane: watch a flashing block sequence and repeat the exact order on 3×3, 4×4, or 5×5 grids.",
            "High scores save locally per game and difficulty. Submit a run to the Global Top 100 from the Result screen when Firebase is configured.",
        ],
        outcomes: [
            "Two shipped mini-games: Rocket Launch (dodge/survival) and Memory Lane (sequence memory).",
            "Streak bonus scoring: +10 per correct action, +20 bonus every 5-streak of flawless performance.",
            "Local high scores via shared_preferences; optional Firestore Global Top 100 leaderboard.",
            "Brand asset system under assets/brand/ with brand tokens, per-game tiles, and Play Store graphics.",
        ],
        progress: [
            { title: "Rocket Launch mini-game", detail: "30-second asteroid dodge game with drag and 3D direction button controls.", state: "done" },
            { title: "Memory Lane mini-game", detail: "Sequence memory game on 3×3 to 5×5 grids with Easy/Medium/Hard difficulty.", state: "done" },
            { title: "Firestore global leaderboard", detail: "Optional Global Top 100 leaderboard — activates when Firebase config is provided.", state: "done" },
            { title: "Additional mini-games", detail: "v1 ships two games; further game types are planned for future releases.", state: "planned" },
        ],
        futureGoals: [
            "Add more mini-game types beyond v1's two.",
            "Publish to Google Play Store and Apple App Store.",
            "Add in-app ads simulation mode toggle for monetization testing.",
        ],
        tech: [
            { name: "Flutter", icon: "devicon-flutter-plain colored" },
            { name: "Dart", icon: "devicon-dart-plain colored" },
            { name: "Firebase", icon: "devicon-firebase-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/logic-sprint" },
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: []
    }
];
