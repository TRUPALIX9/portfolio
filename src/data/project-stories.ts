// Narrative layer for /projects/[slug]. Everything here is derived from the facts in
// projects.ts (architecture, metrics, milestones) — review and add personal detail freely.

export type ProjectChallenge = {
    title: string;
    problem: string;
    resolution: string;
};

export type ProjectStory = {
    /** How the pieces were wired together end to end. */
    integration: string;
    challenges: ProjectChallenge[];
    learnings: string[];
};

export const projectStories: Record<string, ProjectStory> = {
    retailsync: {
        integration:
            'RetailSync is a TypeScript monorepo: a React + Redux Toolkit client and an Express API share one schema package, so a domain type is defined exactly once. Interactive requests stay fast because heavy work, such as PDF rendering, OCR, and artifact generation, runs as background jobs that write results to cloud storage. Google Sheets and QuickBooks sit behind their own service layers so each integration can fail on its own.',
        challenges: [
            {
                title: 'OCR is slow, users are not patient',
                problem: 'Extracting a multi-page bank statement inside a request would freeze the UI and time out.',
                resolution: 'Built an async pipeline (PDF → storage → OCR jobs → artifact model → review UI) so uploads return immediately and results surface when ready.',
            },
            {
                title: 'One platform, many companies',
                problem: 'Multiple retail operators share the system, and any cross-tenant leak would be unacceptable.',
                resolution: 'Scoped every workspace (Dashboard, POS, Accounting, QuickBooks, Settings, Access) to the company through role-based access control.',
            },
            {
                title: 'Types drifting between client and server',
                problem: 'Separate definitions for validation, state, and domain models slowly disagree.',
                resolution: 'Moved the schemas into a shared monorepo package consumed by both sides.',
            },
        ],
        learnings: [
            'Anything slow belongs outside the request path; background jobs plus a status model keep the product responsive.',
            'Tenant isolation has to be designed into the data layer from day one, not added to the UI later.',
            'Third-party integrations should be isolated so one failing API degrades a feature, not the whole platform.',
        ],
    },
    'web-warehouse': {
        integration:
            'The physical warehouse is modelled in MongoDB Atlas as a Unit → Row → Column hierarchy, alongside items, vendors/suppliers, and purchase orders with embedded pallets. Next.js 15 App Router API routes serve that structure to the client, which renders it as a Three.js 3D scene and an ApexCharts dashboard. A dbScript seeder generates a realistic dataset so the whole flow can be demonstrated end to end.',
        challenges: [
            {
                title: 'Tables hide space',
                problem: 'A flat inventory table tells you what exists, not where it sits or how full a row is.',
                resolution: 'Modelled the storage hierarchy explicitly so the same data could be projected into an interactive 3D view.',
            },
            {
                title: 'Demoing without real data',
                problem: 'A warehouse UI with an empty database shows nothing useful.',
                resolution: 'Wrote a seed runner that generates parties, the layout, 50 items, and 10 purchase orders with pallets.',
            },
        ],
        learnings: [
            'The data model decides what visualizations are even possible; get the hierarchy right first.',
            'A good seed script is part of the product: it makes features testable and demoable.',
            'Scoping matters: role tiers are scaffolded, and enforcing them everywhere is tracked as its own milestone.',
        ],
    },
    'card-snap': {
        integration:
            'The Expo (React Native) client captures a card with expo-camera and sends it as base64 to a Node.js backend. The backend runs Tesseract OCR, then regex-based parsing that pulls out name, title, company, email, and phone, and returns structured fields for the user to review before saving. The backend URL comes from .env, so one codebase targets local, staging, or production.',
        challenges: [
            {
                title: 'OCR output is noisy',
                problem: 'Logos, fonts, and layouts make raw OCR text unreliable to save as-is.',
                resolution: 'Added a review step: parsed fields are shown for correction before anything is stored.',
            },
            {
                title: 'Keeping the phone app light',
                problem: 'Running OCR on-device would bloat the app and vary wildly by hardware.',
                resolution: 'Moved OCR and parsing server-side; the client only captures, sends, and displays.',
            },
        ],
        learnings: [
            'When extraction can be wrong, a human-in-the-loop review step beats pretending the model is perfect.',
            'Splitting heavy processing to the server keeps a cross-platform client simple.',
            'Environment-driven configuration makes the same build usable across local and deployed backends.',
        ],
    },
    'shipping-agent-aws': {
        integration:
            'A Python Streamlit chat app calls a deployed AWS Bedrock Agent through boto3 with IAM-scoped invocation. All AWS credentials, the region, and agent/alias IDs load from environment variables, and quick-action buttons send common shipping requests without typing.',
        challenges: [
            {
                title: 'Portal hopping',
                problem: 'Comparing rates and checking tracking meant bouncing between carrier sites, spreadsheets, and email.',
                resolution: 'Put a single conversational entry point in front of the agent so questions are asked in plain language.',
            },
            {
                title: 'Credentials in a demo app',
                problem: 'Agent tools tend to end up with keys pasted into code.',
                resolution: 'Loaded every secret from the environment and scoped invocation through IAM.',
            },
        ],
        learnings: [
            'Conversational tools still need shortcuts; quick actions cover the most common requests faster than typing.',
            'Least-privilege IAM is worth setting up even for internal tools.',
            'Production agents need observability and fallbacks, which is the next milestone here.',
        ],
    },
    'fire-forecasting': {
        integration:
            'Makefile targets ingest NASA FIRMS VIIRS detections (75K+ records, 2019–2024), RAWS weather, and CAL FIRE FRAP perimeters. A feature step builds 7-day lags, rolling stats, seasonality, and neighbour features. Models (baselines, an ANN, and a 14-day LSTM) train behind a FastAPI service with 9 endpoints, and a Next.js dashboard shows metrics, PR/ROC curves, and per-site predictions on a Leaflet map.',
        challenges: [
            {
                title: 'Fire days are rare',
                problem: 'With heavily imbalanced labels, a model can look accurate by always predicting "no fire".',
                resolution: 'Computed class weights automatically and used PR-AUC as the primary metric instead of accuracy.',
            },
            {
                title: 'Time-series leakage',
                problem: 'Random splits and scalers fit on all data quietly leak the future into training.',
                resolution: 'Predicted t+1, fit the scaler on the training set only, and used a chronological 70/15/15 split.',
            },
            {
                title: 'Three datasets, three shapes',
                problem: 'Satellite points, station weather, and polygon perimeters do not line up on their own.',
                resolution: 'Automated the joins in a reproducible pipeline so every run rebuilds the same dataset.',
            },
        ],
        learnings: [
            'Choosing the evaluation metric is a modelling decision, especially with imbalanced classes.',
            'Leakage hygiene matters more than model size; the split strategy is part of the model.',
            'Baselines (logistic regression, random forest) first make it clear whether a neural network is earning its complexity.',
        ],
    },
    'motion-detection': {
        integration:
            'The WinForms app talks to cameras over ONVIF: the device service discovers media profiles, the media service provides RTSP stream URIs, and the PTZ service handles continuous, absolute, and relative moves. EmguCV (OpenCV for .NET) runs frame differencing on the live RTSP feed, and an FFMPEG forwarding module supports running as a Windows service.',
        challenges: [
            {
                title: 'Vendor lock-in',
                problem: 'Each camera brand ships its own management software.',
                resolution: 'Implemented the ONVIF standard directly in C#, so any compliant camera works through one tool.',
            },
            {
                title: 'Messy connection details',
                problem: 'Operators have credentials and RTSP URLs in inconsistent formats.',
                resolution: 'Added RTSP URL auto-parsing alongside manual IP/port/credential entry.',
            },
        ],
        learnings: [
            'Building against an open standard pays off across hardware you have never tested.',
            'Simple frame differencing is a great start, but false positives are the real problem to solve next.',
        ],
    },
    'vehicle-log': {
        integration:
            'A C# WinForms front end handles record entry and management, while a Windows service (managed through NSSM) runs scheduled work in the background. ServiceManager and UpdateManager classes own the service lifecycle and updates.',
        challenges: [
            {
                title: 'Work that runs when the app is closed',
                problem: 'Scheduled operations cannot depend on someone keeping a window open.',
                resolution: 'Split background work into a Windows service managed via NSSM.',
            },
        ],
        learnings: [
            'Separating the UI from background services keeps each simpler and more reliable.',
            'Owning service lifecycle and updates in dedicated classes avoids scattered, fragile logic.',
        ],
    },
    'comp-599-webgl': {
        integration:
            'One Next.js + TypeScript application hosts four WebGL experiences with route-based scene loading, so each scene loads only when visited. The seminar paper and capabilities presentation live alongside the code.',
        challenges: [
            {
                title: 'Four concepts, one codebase',
                problem: 'Scene-graph navigation, real-time collision, and orbital visualization each need different structure.',
                resolution: 'Gave every experience its own route and scene lifecycle inside a shared app shell.',
            },
        ],
        learnings: [
            'Route-level code splitting keeps several heavy 3D scenes from slowing each other down.',
            'Building the same fundamentals four ways deepened my understanding of the WebGL rendering pipeline.',
        ],
    },
    'file-system-engine': {
        integration:
            'Electron’s main process owns the file system and a SQLite activity log. The React 19 + Material UI renderer never touches Node directly; it calls a typed, context-isolated preload API over IPC. A strict Content Security Policy allows MUI’s dynamic styles while blocking external scripts.',
        challenges: [
            {
                title: 'A renderer with file-system power',
                problem: 'Giving the UI direct Node access turns any injected script into full disk access.',
                resolution: 'Enabled context isolation and exposed only a small, type-safe IPC surface from the preload script.',
            },
            {
                title: 'Strict CSP versus dynamic styling',
                problem: 'MUI injects styles at runtime, which a naive strict CSP blocks.',
                resolution: 'Tuned the policy to permit style injection while still refusing external script execution.',
            },
        ],
        learnings: [
            'Electron security is mostly about what the renderer is not allowed to do.',
            'An audit log (SQLite) is cheap to add early and invaluable for debugging and automation later.',
        ],
    },
};
