"use client";
import master from '../data/master.json';
import ExperienceTimeline from './ExperienceTimeline';
import VoiceAssistant from './VoiceAssistant';
import CertificationsSection from './CertificationsSection';
import { User, GraduationCap } from 'lucide-react';
import Reveal, { Stagger, StaggerItem } from '@/components/motion/Reveal';

type Skill = { name: string; class: string };

const techArsenal: Record<string, Skill[] | Record<string, Skill[]>> = {
    "Languages": [
        { name: "TypeScript", class: "devicon-typescript-plain colored" },
        { name: "JavaScript", class: "devicon-javascript-plain colored" },
        { name: "Python", class: "devicon-python-plain colored" },
        { name: "Java", class: "devicon-java-plain colored" },
        { name: "C#", class: "devicon-csharp-plain colored" },
        { name: "Dart", class: "devicon-dart-plain colored" },
        { name: "HTML5 / CSS3", class: "devicon-html5-plain colored" }
    ],
    "Cloud": [
        { name: "AWS", class: "devicon-amazonwebservices-plain colored" },
        { name: "Google Cloud", class: "devicon-googlecloud-plain colored" },
        { name: "Azure", class: "devicon-azure-plain colored" },
        { name: "Vercel", class: "devicon-vercel-original" },
        { name: "Docker", class: "devicon-docker-plain colored" }
    ],
    "Frontend": {
        "Web": [
            { name: "React", class: "devicon-react-original colored" },
            { name: "Next.js", class: "devicon-nextjs-plain" },
            { name: "Angular", class: "devicon-angularjs-plain colored" },
            { name: "Vue.js", class: "devicon-vuejs-plain colored" }
        ],
        "Mobile": [
            { name: "React Native", class: "devicon-react-original colored" },
            { name: "Flutter", class: "devicon-flutter-plain colored" }
        ],
        "Desktop": [
            { name: "Electron", class: "devicon-electron-original colored" },
            { name: "WinForms", class: "devicon-windows8-original colored" }
        ],
        "Libraries": [
            { name: "Tailwind CSS", class: "devicon-tailwindcss-original colored" },
            { name: "Three.js", class: "devicon-threejs-original" },
            { name: "Redux & RTK", class: "devicon-redux-original colored" },
            { name: "D3.js", class: "devicon-d3js-plain colored" }
        ]
    },
    "Backend": [
        { name: "Node.js", class: "devicon-nodejs-plain colored" },
        { name: ".NET", class: "devicon-dotnetcore-plain colored" },
        { name: "Django", class: "devicon-django-plain colored" },
        { name: "Flask", class: "devicon-flask-original colored" },
        { name: "Windows Services", class: "devicon-windows8-original colored" },
        { name: "GraphQL", class: "devicon-graphql-plain colored" }
    ],
    "Tool": [
        { name: "Git", class: "devicon-git-plain colored" },
        { name: "Jest", class: "devicon-jest-plain colored" },
        { name: "Pandas", class: "devicon-pandas-original colored" },
        { name: "OpenCV", class: "devicon-opencv-plain colored" }
    ],
    "Database": [
        { name: "PostgreSQL", class: "devicon-postgresql-plain colored" },
        { name: "MongoDB", class: "devicon-mongodb-plain colored" },
        { name: "SQL & MySQL", class: "devicon-mysql-plain colored" },
        { name: "Oracle", class: "devicon-oracle-original" },
        { name: "Redis", class: "devicon-redis-plain colored" },
        { name: "Firebase", class: "devicon-firebase-plain colored" }
    ]
};

/** Shared shell for the three stacked panels (About, Education, Certifications): section-panel level. */
const PANEL = 'rounded-3xl border border-line-1 bg-surface-1 p-8 lg:p-10 shadow-[var(--shadow-card)]';
const PANEL_TITLE = 'text-2xl font-bold text-ink-1 uppercase tracking-wider m-0';
const SECTION_TITLE_STYLE = { fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 } as const;

function SkillGrid({ skills }: { skills: Skill[] }) {
    return (
        <ul className="grid flex-grow grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {skills.map((skill) => (
                <li
                    key={skill.name}
                    className="flex min-w-0 cursor-default items-center gap-2.5 rounded-xl border border-line-1 bg-surface-2 px-3.5 py-2.5 text-ink-2 transition-colors duration-150 ease-out-expo hover:border-line-2 hover:bg-surface-3 hover:text-ink-1"
                >
                    <i className={skill.class} aria-hidden="true" style={{ fontSize: '1.2rem' }} />
                    <span className="truncate text-sm font-medium">{skill.name}</span>
                </li>
            ))}
        </ul>
    );
}

export default function AboutSection() {
    return (
        <section className="section container" style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-height) + 2rem)' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

                {/* ── ABOUT ME & EDUCATION STACK ───────────────────────────────────────────── */}
                <div className="flex flex-col gap-6 pb-12 border-b border-line-1">
                    {/* ABOUT CARD (Full Width) — a large panel: it enters once but never moves on hover */}
                    <Reveal className={`relative ${PANEL}`}>
                        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12">

                            {/* Left Side: Text */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-8">
                                    <User className="text-accent" size={28} aria-hidden="true" />
                                    <h3 className={PANEL_TITLE}>About Me</h3>
                                </div>

                                <div className="measure flex flex-col gap-5 text-ink-2 text-[1.0625rem] leading-[1.75]">
                                    {master.personal.storyText.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="m-0">
                                            {idx === 0 ? (
                                                <span dangerouslySetInnerHTML={{ __html: paragraph.replace('Full-Stack Software Engineer', '<strong class="text-ink-1 font-semibold">Full-Stack Software Engineer</strong>').replace('AI-driven platforms', '<strong class="text-ink-1 font-semibold">AI-driven platforms</strong>') }} />
                                            ) : (
                                                paragraph
                                            )}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Play & Badge */}
                            <div className="flex flex-col sm:flex-row md:flex-col justify-between items-start sm:items-center md:items-end gap-8 md:min-w-[220px]">
                                {/* Top Right: Audio Intro */}
                                <div className="flex items-center gap-3 md:self-end">
                                    <span className="text-xs font-semibold text-ink-3 uppercase tracking-widest">Audio Intro</span>
                                    <VoiceAssistant />
                                </div>

                                {/* Bottom Right: Certification */}
                                <div className="flex flex-col items-start sm:items-end md:items-end text-left sm:text-right w-full">
                                    <div className="mb-3">
                                        <h3 className="text-xs font-bold text-ink-3 uppercase tracking-widest m-0 mb-1.5">Certification</h3>
                                        <h4 className="text-[0.95rem] font-semibold text-ink-1 m-0 leading-tight">Meta Front-End Developer</h4>
                                    </div>
                                    <a
                                        href="https://www.credly.com/badges/8acca941-de83-466e-b754-0518b0f25e25"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="card card-interactive spotlight flex items-center justify-center rounded-2xl p-4 self-start sm:self-end"
                                        title="Verify on Credly"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="https://images.credly.com/size/680x680/images/e91ed0b0-842b-417f-8d2f-b07535febdda/image.png"
                                            alt="Meta Front-End Developer Badge"
                                            className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* EDUCATION CARD (Full Width) */}
                    <Reveal id="education" className={PANEL}>
                        <div className="flex items-center gap-3 mb-8">
                            <GraduationCap className="text-accent" size={28} aria-hidden="true" />
                            <h3 className={PANEL_TITLE}>Education</h3>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            {/* Master */}
                            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-line-1 bg-surface-2 transition-colors duration-200 ease-out-expo hover:border-line-2">
                                <div>
                                    <h4 className="text-[1.1rem] font-bold text-ink-1 m-0">Master of Science in Computer Science</h4>
                                    <p className="text-[0.95rem] text-ink-2 m-0 mt-1">CSU, Channel Islands</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xs text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-md font-bold tracking-wider">3.7 GPA</span>
                                    <span className="text-[0.85rem] text-ink-3 font-mono font-semibold">2025-2026</span>
                                </div>
                            </div>

                            {/* Bachelor */}
                            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-line-1 bg-surface-2 transition-colors duration-200 ease-out-expo hover:border-line-2">
                                <div>
                                    <h4 className="text-[1.1rem] font-bold text-ink-1 m-0">Bachelor of Engineering in Computer Engineering</h4>
                                    <p className="text-[0.95rem] text-ink-2 m-0 mt-1">Gujarat Tech University</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xs text-ink-1 bg-surface-3 border border-line-2 px-3 py-1.5 rounded-md font-bold tracking-wider">8.38 CGPA</span>
                                    <span className="text-[0.85rem] text-ink-3 font-mono font-semibold">2019-2023</span>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* CERTIFICATIONS */}
                    <Reveal>
                        <CertificationsSection />
                    </Reveal>
                </div>

                {/* ── 1. WHERE I WORKED (Detailed Timeline) ──────────────────── */}
                <div className="pb-12 border-b border-line-1">
                    <ExperienceTimeline />
                </div>

                {/* ── 4. TECH STACK ────────────────────────────────────────────── */}
                <div id="tech-stack">
                    <Reveal className="text-center mb-12">
                        <p className="eyebrow mb-3">Toolkit</p>
                        <h2 className="text-ink-1" style={SECTION_TITLE_STYLE}>
                            The <span className="text-accent">Tech Stack.</span>
                        </h2>
                    </Reveal>

                    <Stagger className="flex flex-col w-full">
                        {Object.entries(techArsenal).map(([category, content]) => {
                            const isNested = !Array.isArray(content);
                            return (
                                <StaggerItem
                                    key={category}
                                    className="flex flex-col md:flex-row md:items-start gap-4 py-6 border-b border-line-1 first:pt-0 last:border-b-0 last:pb-0"
                                >
                                    <h4 className="text-sm font-semibold text-ink-1 uppercase tracking-wider md:w-[150px] shrink-0 md:pt-3">
                                        {category}
                                    </h4>
                                    {isNested ? (
                                        <div className="flex flex-col gap-4 flex-grow w-full min-w-0">
                                            {Object.entries(content as Record<string, Skill[]>).map(([subCategory, skills]) => (
                                                <div key={subCategory} className="flex flex-col sm:flex-row sm:items-start gap-3">
                                                    <span className="text-xs font-bold text-ink-3 uppercase tracking-widest sm:w-[90px] shrink-0 sm:pt-3.5">
                                                        {subCategory}
                                                    </span>
                                                    <SkillGrid skills={skills} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <SkillGrid skills={content as Skill[]} />
                                    )}
                                </StaggerItem>
                            );
                        })}
                    </Stagger>
                </div>

            </div>
        </section>
    );
}
