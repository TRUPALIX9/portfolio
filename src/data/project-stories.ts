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
            'A Next.js 14 App Router front end with Material UI renders four views: the dashboard, a full-width map, ML History and Settings. The dashboard reads a small JSON dataset that a Python script builds from the committed trihourly weather CSV. Leaflet draws the Tri-County box and risk-coloured sites, and ApexCharts plots the selected site\'s risk with threshold and peak annotations. The original ML pipeline and FastAPI service live in the git history.',
        challenges: [
            {
                title: 'Showing a forecast without a model',
                problem: 'The backend had been removed, but an honest dashboard still needed realistic inputs.',
                resolution: 'Built a reproducible sample from the real weather CSV, labelled the fictional sites and risk values as sample data in the UI, and documented where the original pipeline lives.',
            },
            {
                title: 'A build that would not install',
                problem: 'A clean install failed on a peer-dependency conflict, and the production build loaded PostCSS plugins that were never installed.',
                resolution: 'Removed the leftover Tailwind and PostCSS config and resolved the dependency conflict so a clean install and production build work.',
            },
            {
                title: 'Unthemed components',
                problem: 'Material UI ran with no theme, so components fell back to Roboto and default spacing.',
                resolution: 'Added a ThemeProvider with Inter typography and the App Router style cache.',
            },
        ],
        learnings: [
            'Labelling sample data plainly keeps a prototype honest.',
            'A clean install and a production build are the first test any repo should pass.',
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
            'A single .NET 6 WinForms app drives the whole setup. It relaunches itself as administrator, then steps through a notice, an install location and an eight-step install: MongoDB and mongosh are extracted, Mosquitto installs silently as a service, mongod is registered with authentication, a mongosh script creates the database user, and the portal and bot are registered with NSSM. An update path reads installed versions from config.json and pulls newer component zips from S3.',
        challenges: [
            {
                title: 'Four services, one wizard',
                problem: 'Each component installs and registers differently, and the installer reported success even when a step failed.',
                resolution: 'Ran the install as ordered steps with a timestamped log and stopped at the first failed step instead of reporting completion.',
            },
            {
                title: 'Install or update',
                problem: 'Running the full install again on a working machine would overwrite it.',
                resolution: 'Detected the four existing Windows services and sent those machines straight to an S3-backed update screen.',
            },
            {
                title: 'Hard-coded environment values',
                problem: 'The S3 bucket, region and publish settings were baked into the code.',
                resolution: 'Moved them to environment variables so the proof of concept can point at any deployment.',
            },
        ],
        learnings: [
            'Installers need to fail loudly: a green "done" after a failed step costs more than an error.',
            'Keeping environment-specific values in configuration makes a proof of concept reusable.',
        ],
    },
    'comp-599-webgl': {
        integration:
            'One client component drives the deck: each slide pairs sidebar notes with a Three.js renderer created for that slide, and switching slides disposes the old renderer before building the next. The /highway and /bunker routes open the same deck on their slide. The seminar paper and slides sit in docs/.',
        challenges: [
            {
                title: 'Six renderers, one page',
                problem: 'Building a new WebGL scene on every slide change leaks GPU memory and listeners if the old one lingers.',
                resolution: 'Gave each scene a create and dispose lifecycle so only the active slide has a renderer.',
            },
            {
                title: 'Controls that fought the page',
                problem: 'The FPS slide listened on the whole window, so using the sidebar turned the camera and Back/Next fired a shot.',
                resolution: 'Scoped its input handling to the scene so the rest of the deck works normally.',
            },
            {
                title: 'A legend that vanished',
                problem: 'An unclosed CSS rule swallowed the chart legend and axis-label styles on the plotting slide.',
                resolution: 'Closed the rule so the legend and X/Y/Z labels render as designed.',
            },
        ],
        learnings: [
            'Live demos make a technical talk, but each slide has to be robust enough to run in front of an audience.',
            'Disposing WebGL resources matters as much as creating them.',
        ],
    },
    'file-system-engine': {
        integration:
            'Electron\'s main process owns the file system, Android devices over adb, the storage scanner and a SQLite activity log. The React 19 and Material UI renderer never touches Node directly: it calls a typed, context-isolated preload API whose requests are validated with Zod and checked to stay inside the chosen drive. The Storage Analyzer walks a folder in the main process and returns the largest folders for the treemap.',
        challenges: [
            {
                title: 'A renderer with file-system power',
                problem: 'Giving the UI direct Node access turns any injected script into full disk access.',
                resolution: 'Enabled context isolation and a sandboxed renderer, and exposed only a small, validated IPC surface from the preload script.',
            },
            {
                title: 'Shell commands built from file names',
                problem: 'adb copy, create-file and scan ran through the host shell, so a crafted file name could run commands.',
                resolution: 'Switched to execFile with single-quoted device arguments.',
            },
            {
                title: 'A treemap that added up to more than 100%',
                problem: 'Nested folders were counted twice, so block widths could exceed the scanned total.',
                resolution: 'Fixed the aggregation so the treemap blocks add up to the scanned total.',
            },
        ],
        learnings: [
            'Electron security is mostly about what the renderer is not allowed to do.',
            'A disk analyzer is only useful if its numbers add up; test the totals, not just the drawing.',
        ],
    },
};
