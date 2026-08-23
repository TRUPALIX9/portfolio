"use client";
import { motion } from 'framer-motion';
import master from '../data/master.json';
import ExperienceTimeline from './ExperienceTimeline';
import VoiceAssistant from './VoiceAssistant';
import { User, GraduationCap, Award } from 'lucide-react';

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

const rowStyle: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
    justifyContent: 'space-between', gap: '1.5rem',
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.04)',
};

const sectionDivider: React.CSSProperties = {
    paddingBottom: '3rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const sectionHeader = (emoji: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '1.8rem' }}>{emoji}</span>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {label}
        </h3>
    </div>
);

export default function AboutSection() {
    return (
        <section className="section container" style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-height) + 2rem)' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

                {/* ── ABOUT ME & EDUCATION STACK ───────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-6 pb-12 border-b border-[rgba(255,255,255,0.05)]"
                >
                    {/* ABOUT CARD (Full Width) */}
                    <div className="relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-3xl p-8 lg:p-10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12">
                            
                            {/* Left Side: Text */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-8">
                                    <User className="text-[#4ADE80]" size={28} />
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider m-0">About Me</h3>
                                </div>
                                
                                <div className="flex flex-col gap-5 text-neutral-300 text-[1.05rem] leading-relaxed">
                                    {master.personal.storyText.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="m-0 opacity-90">
                                            {idx === 0 ? (
                                                <span dangerouslySetInnerHTML={{ __html: paragraph.replace('Full-Stack Software Engineer', '<strong class="text-white font-bold">Full-Stack Software Engineer</strong>').replace('AI-driven platforms', '<strong class="text-white font-bold">AI-driven platforms</strong>') }} />
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
                                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Audio Intro</span>
                                    <VoiceAssistant />
                                </div>

                                {/* Bottom Right: Certification */}
                                <div id="certifications" className="flex flex-col items-start sm:items-end md:items-end text-left sm:text-right w-full">
                                    <div className="mb-3">
                                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest m-0 mb-1">Certification</h3>
                                        <h4 className="text-[0.95rem] font-semibold text-white m-0 leading-tight">Meta Front-End Developer</h4>
                                    </div>
                                    <a 
                                        href="https://www.credly.com/badges/8acca941-de83-466e-b754-0518b0f25e25" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="transition-transform duration-300 hover:scale-110 flex items-center justify-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 self-start sm:self-end"
                                        title="Verify on Credly"
                                    >
                                        <img 
                                            src="https://images.credly.com/size/680x680/images/e91ed0b0-842b-417f-8d2f-b07535febdda/image.png" 
                                            alt="Meta Front-End Developer Badge" 
                                            className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EDUCATION CARD (Full Width) */}
                    <div id="education" className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-3xl p-8 lg:p-10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <GraduationCap className="text-[#4ADE80]" size={28} />
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider m-0">Education</h3>
                        </div>
                        
                        <div className="flex flex-col gap-6 w-full">
                            {/* Master */}
                            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-colors rounded-xl">
                                <div>
                                    <h4 className="text-[1.1rem] font-bold text-white m-0">Master of Science in Computer Science</h4>
                                    <p className="text-[0.95rem] text-neutral-400 m-0 mt-1">CSU, Channel Islands</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xs text-[#4ADE80] bg-[rgba(74,222,128,0.1)] px-3 py-1.5 rounded font-bold tracking-wider">3.7 GPA</span>
                                    <span className="text-[0.85rem] text-neutral-500 font-mono font-semibold">2025-2026</span>
                                </div>
                            </div>
                            
                            {/* Bachelor */}
                            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-colors rounded-xl">
                                <div>
                                    <h4 className="text-[1.1rem] font-bold text-white m-0">Bachelor of Engineering in Computer Engineering</h4>
                                    <p className="text-[0.95rem] text-neutral-400 m-0 mt-1">Gujarat Tech University</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xs text-neutral-300 bg-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded font-bold tracking-wider">8.38 CGPA</span>
                                    <span className="text-[0.85rem] text-neutral-500 font-mono font-semibold">2019-2023</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── 1. WHERE I WORKED (Detailed Timeline) ──────────────────── */}
                <div style={{ paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <ExperienceTimeline />
                </div>

                {/* ── 4. TECH STACK ────────────────────────────────────────────── */}
                <motion.div
                    id="tech-stack"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                    >
                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                            The <span className="gradient-text">Tech Stack.</span>
                        </h1>
                    </motion.div>

                    <div className="flex flex-col gap-6 w-full">
                        {Object.entries(techArsenal).map(([category, content]) => {
                            const isNested = !Array.isArray(content);
                            return (
                                <div
                                    key={category}
                                    className="flex flex-col md:flex-row md:items-start gap-4 pb-6 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 last:pb-0"
                                >
                                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider md:w-[150px] shrink-0 pt-2">
                                        {category}
                                    </h4>
                                    {isNested ? (
                                        <div className="flex flex-col gap-4 flex-grow w-full">
                                            {Object.entries(content as Record<string, Skill[]>).map(([subCategory, skills]) => (
                                                <div key={subCategory} className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest sm:w-[90px] shrink-0">
                                                        {subCategory}
                                                    </span>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flexGrow: 1 }}>
                                                        {skills.map((skill) => (
                                                            <div
                                                                key={skill.name}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease', cursor: 'default' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                                                            >
                                                                <i className={skill.class} style={{ fontSize: '1.25rem' }} />
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{skill.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flexGrow: 1 }}>
                                            {(content as Skill[]).map((skill) => (
                                                <div
                                                    key={skill.name}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease', cursor: 'default' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                                                >
                                                    <i className={skill.class} style={{ fontSize: '1.25rem' }} />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{skill.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
