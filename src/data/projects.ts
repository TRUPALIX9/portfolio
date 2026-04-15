export type ProjectStatus = "Completed" | "In Progress";

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
    status: ProjectStatus;
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
};

export const projects: Project[] = [
    {
        slug: "retailsync",
        title: "RetailSync SaaS",
        tagline: "Multi-tenant retail operations, accounting, and bookkeeping in one production workflow.",
        status: "In Progress",
        description: "Multi-Tenant Retail Operations & Accounting SaaS Platform. Features strict tenant-isolated architecture, Google OAuth (RBAC), POS ingestion pipelines, and immutable bookkeeping ledgers with QuickBooks sync.",
        scenario: "Retail operators needed one place to reconcile sales, keep tenant data isolated, and remove spreadsheet-heavy bookkeeping from daily store workflows.",
        problemSolved: "RetailSync reduces manual accounting handoffs by connecting POS ingestion, role-based access, and ledger synchronization into a single operational flow.",
        howToUse: [
            "Sign in with the correct role and tenant context so each team member sees only their own store data.",
            "Import or sync POS transactions to normalize sales, inventory, and accounting events.",
            "Review exceptions, approve bookkeeping entries, and push finalized records into downstream accounting systems.",
        ],
        outcomes: [
            "Improves trust in financial data across multiple tenants.",
            "Reduces duplicate entry between operations and accounting.",
            "Makes audit trails and reconciliation easier to explain to stakeholders.",
        ],
        progress: [
            { title: "Tenant-aware RBAC flows", detail: "Core authentication, role checks, and store isolation are in place.", state: "done" },
            { title: "POS ingestion and ledgers", detail: "Pipeline architecture is built and handling operational transaction mapping.", state: "in-progress" },
            { title: "QuickBooks sync hardening", detail: "Edge-case handling and deeper reconciliation workflows are being refined.", state: "in-progress" },
        ],
        futureGoals: [
            "Add richer exception dashboards for accounting review.",
            "Expand automated reconciliation insights across tenant organizations.",
            "Ship polished onboarding flows for new retail operators.",
        ],
        tech: [
            { name: "React", icon: "devicon-react-original colored" },
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Node.js", icon: "devicon-nodejs-plain colored" },
            { name: "MongoDB", icon: "devicon-mongodb-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9" },
        image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
                title: "Retail operations overview",
                caption: "Use this slot for your dashboard screenshot or workflow image.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&w=1200&q=80",
                title: "Accounting workflow detail",
                caption: "A second screenshot can show ledger review, approvals, or exception handling.",
            },
            {
                type: "video",
                src: "/project-media/retailsync/demo.mp4",
                poster: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&w=1200&q=80",
                title: "RetailSync walkthrough",
                caption: "Replace this with a short product demo showing import, review, and sync.",
            },
        ]
    },
    {
        slug: "web-warehouse",
        title: "Web-Warehouse 3D",
        tagline: "Warehouse visibility with a 3D inventory model teams can actually navigate.",
        status: "In Progress",
        description: "A full-stack warehouse management system featuring real-time 3D visualization of inventory layouts using Three.js and automated pallet tracking workflows.",
        scenario: "Warehouse teams often struggle to understand storage state from flat tables alone, especially when pallet movement and slot utilization change throughout the day.",
        problemSolved: "This project translates inventory and pallet status into a visual 3D warehouse model so operators can inspect layout, bottlenecks, and item placement faster.",
        howToUse: [
            "Open the warehouse view and choose a zone, aisle, or storage area to inspect.",
            "Interact with the 3D scene to identify occupied slots, pallet movement, and inventory placement.",
            "Drill into a pallet or storage node to review the underlying operational data.",
        ],
        outcomes: [
            "Turns dense warehouse data into a spatial workflow.",
            "Makes bottlenecks and empty capacity easier to spot.",
            "Supports operations demos for non-technical stakeholders.",
        ],
        progress: [
            { title: "3D layout visualization", detail: "Warehouse geometry and scene navigation patterns are working.", state: "done" },
            { title: "Inventory overlays", detail: "Linking real inventory state into the scene is under active iteration.", state: "in-progress" },
            { title: "Operator workflow polish", detail: "Tooltips, drill-downs, and performance tuning are planned next.", state: "planned" },
        ],
        futureGoals: [
            "Add path-based picking simulations.",
            "Introduce heatmaps for slot utilization and congestion.",
            "Create a stronger mobile-friendly view for quick floor checks.",
        ],
        tech: [
            { name: "Next.js", icon: "devicon-nextjs-plain" },
            { name: "Three.js", icon: "devicon-threejs-original" },
            { name: "MongoDB", icon: "devicon-mongodb-plain colored" },
            { name: "Tailwind CSS", icon: "devicon-tailwindcss-original colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/web-warehouse" },
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310c?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310c?auto=format&fit=crop&w=1200&q=80",
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
        ]
    },
    {
        slug: "card-snap",
        title: "Card-Snap OCR Suite",
        tagline: "Business-card scanning that turns pictures into structured contact data.",
        status: "Completed",
        description: "Comprehensive OCR ecosystem including a React Native (Expo) mobile frontend and a TypeScript backend. Scans business cards to extract structured contact data using Tesseract.js and NLP.",
        scenario: "Sales and networking workflows often leave teams with piles of business cards and no fast path into usable CRM-ready contacts.",
        problemSolved: "Card-Snap removes manual contact entry by extracting structured fields from mobile scans and preparing them for organized follow-up.",
        howToUse: [
            "Capture a business card photo from the mobile app or upload an existing image.",
            "Review extracted fields such as name, title, company, email, and phone number.",
            "Correct low-confidence fields and export the clean contact record.",
        ],
        outcomes: [
            "Speeds up lead capture after events and meetings.",
            "Reduces manual retyping errors.",
            "Creates a better handoff from networking to outreach.",
        ],
        progress: [
            { title: "OCR extraction pipeline", detail: "Business-card parsing and structured field extraction are implemented.", state: "done" },
            { title: "Mobile scanning flow", detail: "Users can capture and review business cards from a React Native interface.", state: "done" },
            { title: "Confidence feedback loop", detail: "Future quality scoring improvements remain optional enhancements.", state: "planned" },
        ],
        futureGoals: [
            "Add smarter field confidence visualizations.",
            "Support direct CRM export presets.",
            "Expand parsing for multilingual card layouts.",
        ],
        tech: [
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "React Native", icon: "devicon-react-original colored" },
            { name: "Node.js", icon: "devicon-nodejs-plain colored" },
            { name: "Tesseract.js", icon: "" }
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
        ]
    },
    {
        slug: "shipping-agent-aws",
        title: "AWS Shipping Agent",
        tagline: "Conversational logistics workflows for shipping decisions and tracking.",
        status: "In Progress",
        description: "AI-Powered logistics tool using conversational workflows via AWS Bedrock to automate procurement, shipping rate comparisons, and tracking.",
        scenario: "Operations teams often bounce between carrier sites, spreadsheets, and procurement emails when evaluating shipments or checking delivery status.",
        problemSolved: "This agent centralizes shipping questions into a guided workflow that can compare options, surface tracking details, and reduce context switching.",
        howToUse: [
            "Start a shipping request conversation with route, package, and delivery requirements.",
            "Compare rate and service options generated from the agent workflow.",
            "Continue the thread to check status, exceptions, or recommended next actions.",
        ],
        outcomes: [
            "Shortens repetitive logistics decision-making.",
            "Makes shipping comparisons easier to present to stakeholders.",
            "Creates a reusable pattern for AI-assisted operations tooling.",
        ],
        progress: [
            { title: "Conversational workflow design", detail: "The core agent interaction model is defined and functioning.", state: "done" },
            { title: "Carrier and tracking coverage", detail: "Broader workflow integration is still being expanded.", state: "in-progress" },
            { title: "Production-grade observability", detail: "Traceability and error handling remain on the roadmap.", state: "planned" },
        ],
        futureGoals: [
            "Add cost-history comparisons over time.",
            "Improve exception handling for delayed shipments.",
            "Create an approval flow for procurement teams.",
        ],
        tech: [
            { name: "Python", icon: "devicon-python-plain colored" },
            { name: "AWS", icon: "devicon-amazonwebservices-original colored" },
            { name: "Pandas", icon: "devicon-pandas-original colored" }
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
        tagline: "Environmental data turned into a readable fire-risk forecasting workflow.",
        status: "Completed",
        description: "Predictive analytics platform built with TypeScript to forecast fire spread and intensity using environmental data streams.",
        scenario: "Emergency planning teams need a clearer way to interpret environmental signals when assessing where fire behavior may intensify.",
        problemSolved: "The system translates environmental inputs into a forecast view that helps people reason about spread risk and response planning.",
        howToUse: [
            "Load current or historical environmental datasets into the forecasting view.",
            "Review the modeled intensity and spread outputs on the dashboard.",
            "Use the visualized trend changes to support scenario planning discussions.",
        ],
        outcomes: [
            "Makes modeled risk easier to interpret.",
            "Supports faster scenario comparisons.",
            "Improves communication between technical and non-technical viewers.",
        ],
        progress: [
            { title: "Forecasting model workflow", detail: "The main predictive flow is complete.", state: "done" },
            { title: "Visualization layer", detail: "Charts and interpretation views are implemented.", state: "done" },
            { title: "Additional live inputs", detail: "Future integrations remain possible but are not required.", state: "planned" },
        ],
        futureGoals: [
            "Add more real-time environmental feeds.",
            "Explore map overlays for response planning.",
            "Expand historical scenario comparison tools.",
        ],
        tech: [
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Node.js", icon: "devicon-nodejs-plain colored" },
            { name: "D3.js", icon: "devicon-d3js-plain colored" }
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
        slug: "aivid-cv",
        title: "AIVID.AI CV Platform",
        tagline: "A real-time computer vision dashboard built for scale and continuous monitoring.",
        status: "Completed",
        description: "Real-time Computer Vision dashboard handling 350+ bots. Optimized Elasticsearch aggregations and built RTSP live-stream viewing components.",
        scenario: "Operators needed a responsive dashboard for large-scale bot and stream monitoring without drowning in slow queries or fragmented views.",
        problemSolved: "The platform improved visibility into real-time computer vision activity by tightening Elasticsearch performance and stream usability at scale.",
        howToUse: [
            "Open the monitoring dashboard and choose the bot group or operational slice to inspect.",
            "Review live metrics and stream data to identify abnormal behavior or status changes.",
            "Use optimized aggregations to pivot into large datasets without stalling the interface.",
        ],
        outcomes: [
            "Better responsiveness under heavy data volume.",
            "More usable real-time stream monitoring.",
            "Stronger operator confidence in large-scale dashboards.",
        ],
        progress: [
            { title: "Elasticsearch optimization", detail: "Aggregation performance improvements were delivered.", state: "done" },
            { title: "RTSP monitoring workflows", detail: "Live-view components were implemented for operational use.", state: "done" },
            { title: "Extended analytics surfaces", detail: "Additional workflow layers could be added later.", state: "planned" },
        ],
        futureGoals: [
            "Add deeper anomaly surfacing for operators.",
            "Improve cross-stream investigation workflows.",
            "Expand dashboard storytelling for executive views.",
        ],
        tech: [
            { name: "React", icon: "devicon-react-original colored" },
            { name: "Elasticsearch", icon: "devicon-elasticsearch-plain colored" },
            { name: "MQTT", icon: "" }
        ],
        links: { live: "https://aivid.ai", github: "#" },
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                title: "Realtime monitoring concept",
                caption: "Replace this with a metrics dashboard screenshot or product walkthrough video.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
                title: "Stream operations panel",
                caption: "Use another screen to show live streams, filters, or bot groups.",
            },
        ]
    },
    {
        slug: "mrcleanex",
        title: "MrCleanEx Architecture",
        tagline: "A modular architecture playground focused on maintainability and clean boundaries.",
        status: "In Progress",
        description: "A TypeScript-based framework or service demonstrating advanced clean architecture patterns and highly modular code structure.",
        scenario: "Teams often need a reference implementation that shows how to keep domain, infrastructure, and application concerns separated as systems grow.",
        problemSolved: "MrCleanEx demonstrates clean boundaries and modular design so larger codebases can evolve without collapsing into tightly coupled logic.",
        howToUse: [
            "Browse the domain and application layers to understand how responsibilities are separated.",
            "Follow the request flow from entry points through use cases and adapters.",
            "Reuse the structure as a reference when starting or refactoring modular services.",
        ],
        outcomes: [
            "Clarifies clean architecture patterns in practical code.",
            "Makes system growth easier to reason about.",
            "Provides a reusable blueprint for future services.",
        ],
        progress: [
            { title: "Core layering and modular boundaries", detail: "The architecture foundation is defined and working.", state: "done" },
            { title: "Reference examples", detail: "More concrete feature examples are being added.", state: "in-progress" },
            { title: "Documentation depth", detail: "Explanatory walkthroughs are still growing.", state: "in-progress" },
        ],
        futureGoals: [
            "Add richer examples for testing and infrastructure adapters.",
            "Publish clearer architectural decision notes.",
            "Expand the template into a more complete starter kit.",
        ],
        tech: [
            { name: "TypeScript", icon: "devicon-typescript-plain colored" },
            { name: "Jest", icon: "devicon-jest-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/mrcleanex" },
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "grid",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
                title: "Architecture reference view",
                caption: "A good place for a diagram, code map, or layered architecture screenshot.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
                title: "Module structure detail",
                caption: "Use a second asset to show the file layout or request flow.",
            },
        ]
    },
    {
        slug: "motion-detection",
        title: "Motion Detection VMS",
        tagline: "Desktop video monitoring with automated motion awareness and alerting.",
        status: "Completed",
        description: "C# Windows application implementing real-time frame differencing (OpenCV) for automated security alerts and bounding box tracking.",
        scenario: "Security workflows need lightweight automated detection so operators do not have to watch every feed manually.",
        problemSolved: "This application surfaces movement in real time, highlights active regions, and supports faster human review when motion matters.",
        howToUse: [
            "Connect the video source or camera feed from the desktop application.",
            "Start monitoring to detect frame-to-frame motion changes.",
            "Review highlighted bounding boxes and alert behavior for relevant events.",
        ],
        outcomes: [
            "Reduces constant manual feed monitoring.",
            "Makes motion events easier to review.",
            "Provides a practical desktop-based surveillance workflow.",
        ],
        progress: [
            { title: "Realtime frame differencing", detail: "Core motion detection and tracking behavior are complete.", state: "done" },
            { title: "Desktop operator flow", detail: "The Windows-based interaction model is complete.", state: "done" },
            { title: "Alert tuning", detail: "Sensitivity and classification improvements remain optional future work.", state: "planned" },
        ],
        futureGoals: [
            "Add event history review tools.",
            "Improve false-positive reduction strategies.",
            "Explore more advanced object classification integrations.",
        ],
        tech: [
            { name: "C#", icon: "devicon-csharp-plain colored" },
            { name: ".NET", icon: "devicon-dot-net-plain colored" },
            { name: "OpenCV", icon: "devicon-opencv-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/Motion-Detection-Windows-App" },
        image: "https://images.unsplash.com/photo-1557597774-9d273e3f60bc?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1557597774-9d273e3f60bc?auto=format&fit=crop&w=1200&q=80",
                title: "Monitoring workflow preview",
                caption: "Replace this with your Windows app screenshot or motion alert demo clip.",
            },
            {
                type: "video",
                src: "/project-media/motion-detection/detection-demo.mp4",
                poster: "https://images.unsplash.com/photo-1557597774-9d273e3f60bc?auto=format&fit=crop&w=1200&q=80",
                title: "Motion detection demo",
                caption: "A short recording can show movement highlights and alert behavior in action.",
            },
        ]
    },
    {
        slug: "study-reports",
        title: "Cyber Bio/Security Labs",
        tagline: "Research-heavy security lab work documented as readable experiments and reports.",
        status: "Completed",
        description: "A repository of academic cybersecurity research, threat modeling, and HTML-based data visualization for security labs.",
        scenario: "Course and lab work can be hard to present clearly when findings, visualizations, and takeaways are spread across isolated reports.",
        problemSolved: "This repository organizes security experiments and research into a more navigable reference that is easier to review and discuss.",
        howToUse: [
            "Browse a lab topic or report to see the specific security question being explored.",
            "Review the supporting analysis, visuals, and documentation.",
            "Use the materials as a research reference or portfolio artifact.",
        ],
        outcomes: [
            "Makes academic work easier to present.",
            "Collects research and visuals in one place.",
            "Improves narrative clarity around lab findings.",
        ],
        progress: [
            { title: "Research collection", detail: "Core reports and materials are already organized.", state: "done" },
            { title: "Visualization support", detail: "HTML-based visuals are included for selected labs.", state: "done" },
            { title: "Extended topic coverage", detail: "Additional lab write-ups can continue over time.", state: "planned" },
        ],
        futureGoals: [
            "Add more concise summaries for each lab.",
            "Expand visual explanations for complex findings.",
            "Group related labs into themed learning paths.",
        ],
        tech: [
            { name: "HTML5", icon: "devicon-html5-plain colored" },
            { name: "CSS3", icon: "devicon-css3-plain colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/study-reports" },
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "grid",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
                title: "Security lab showcase",
                caption: "Use this slot for screenshots of your report pages or visualizations.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
                title: "Threat analysis detail",
                caption: "Add another asset to show research notes, diagrams, or lab outputs.",
            },
        ]
    },
    {
        slug: "little-lemon",
        title: "Little Lemon Restaurant",
        tagline: "A polished restaurant experience focused on accessible booking and UI quality.",
        status: "Completed",
        description: "Pixel-perfect React web application for restaurant management. Capstone project focused on accessibility and performant UI interaction.",
        scenario: "Restaurant sites need to balance visual polish with accessible navigation and booking-related usability.",
        problemSolved: "This project demonstrates an accessible front-end flow for browsing, interacting with the brand, and completing restaurant tasks smoothly.",
        howToUse: [
            "Land on the homepage to explore featured sections and restaurant information.",
            "Navigate through the booking or interaction flow with responsive, accessible UI states.",
            "Review the interface as a front-end implementation focused on performance and polish.",
        ],
        outcomes: [
            "Shows strong front-end execution and accessibility awareness.",
            "Creates a cohesive product-style presentation for a capstone.",
            "Demonstrates clean interaction design in React.",
        ],
        progress: [
            { title: "Accessible UI flow", detail: "Core pages and interactions are complete.", state: "done" },
            { title: "Responsive implementation", detail: "The visual system is complete and functional.", state: "done" },
            { title: "Additional reservations depth", detail: "Feature expansion remains optional future work.", state: "planned" },
        ],
        futureGoals: [
            "Add a richer booking confirmation workflow.",
            "Expand restaurant operations features behind the UI.",
            "Introduce more content personalization patterns.",
        ],
        tech: [
            { name: "React", icon: "devicon-react-original colored" },
            { name: "Javascript", icon: "devicon-javascript-plain colored" },
            { name: "Tailwind CSS", icon: "devicon-tailwindcss-original colored" }
        ],
        links: { live: "#", github: "https://github.com/TRUPALIX9/little-lemon-restaurant" },
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "storyboard",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
                title: "Restaurant UI preview",
                caption: "Replace this with homepage, menu, or booking screenshots from your build.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
                title: "Booking flow screen",
                caption: "A second image works well for reservations or accessibility-focused interactions.",
            },
        ]
    },
    {
        slug: "vehicle-log",
        title: "Vehicle Log System",
        tagline: "Fleet recordkeeping and maintenance workflows for operational teams.",
        status: "Completed",
        description: "Enterprise C# management system for vehicle logging, maintenance scheduling, and fleet tracking workflows.",
        scenario: "Fleet operations need a reliable way to log usage, track maintenance, and reduce missed service windows.",
        problemSolved: "This system centralizes fleet records and maintenance scheduling so teams can keep vehicles compliant and operational.",
        howToUse: [
            "Register vehicles and their relevant fleet metadata.",
            "Track service history, upcoming maintenance, and usage records.",
            "Review fleet status to identify overdue or at-risk vehicles.",
        ],
        outcomes: [
            "Improves operational visibility for fleet management.",
            "Supports maintenance planning and audit readiness.",
            "Reduces dependence on disconnected manual logs.",
        ],
        progress: [
            { title: "Vehicle and maintenance records", detail: "Core management workflows are complete.", state: "done" },
            { title: "Scheduling support", detail: "Maintenance scheduling is part of the delivered workflow.", state: "done" },
            { title: "Broader analytics", detail: "Future dashboard enhancements remain possible.", state: "planned" },
        ],
        futureGoals: [
            "Add service cost reporting.",
            "Introduce richer fleet analytics dashboards.",
            "Expand operational alerts for upcoming maintenance.",
        ],
        tech: [
            { name: "C#", icon: "devicon-csharp-plain colored" },
            { name: "SQL", icon: "devicon-mysql-plain colored" }
        ],
        links: { live: "#", github: "#" },
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "grid",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
                title: "Fleet workflow preview",
                caption: "Use this slot for a maintenance schedule, vehicle table, or workflow diagram.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80",
                title: "Maintenance planning view",
                caption: "Add another screen to show upcoming services, logs, or fleet status.",
            },
        ]
    },
    {
        slug: "powerball-lab",
        title: "Powerball Simulation Lab",
        tagline: "A probability sandbox for running large simulation experiments in TypeScript.",
        status: "Completed",
        description: "Logic-heavy TypeScript simulator exploring probability, statistics, and large-scale data randomizations.",
        scenario: "Probability concepts become easier to explain when simulations can be run repeatedly and visualized in a clear, approachable way.",
        problemSolved: "This lab turns abstract probability ideas into repeatable experiments with observable outcomes and trend patterns.",
        howToUse: [
            "Choose the simulation configuration or experiment parameters.",
            "Run a large number of iterations to produce trend data.",
            "Inspect the output to compare expected and observed distributions.",
        ],
        outcomes: [
            "Makes probability experiments easier to teach and inspect.",
            "Shows strength in algorithmic thinking and simulation design.",
            "Creates a useful technical storytelling artifact.",
        ],
        progress: [
            { title: "Simulation engine", detail: "Core randomization and probability logic are complete.", state: "done" },
            { title: "Experiment output review", detail: "The lab supports result inspection and comparison.", state: "done" },
            { title: "Interactive visual expansion", detail: "Additional presentation layers remain optional future work.", state: "planned" },
        ],
        futureGoals: [
            "Add more visual summaries of result distributions.",
            "Expand experiment presets for teaching scenarios.",
            "Introduce side-by-side strategy comparison tools.",
        ],
        tech: [
            { name: "TypeScript", icon: "devicon-typescript-plain colored" }
        ],
        links: { live: "#", github: "#" },
        image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=1200&q=80",
        mediaDisplay: "spotlight",
        media: [
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=1200&q=80",
                title: "Simulation preview",
                caption: "Replace this with charts, iteration output, or a short explainer video.",
            },
            {
                type: "image",
                src: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80",
                title: "Probability output detail",
                caption: "Use a second asset for charts, result logs, or comparison tables.",
            },
        ]
    }
];
