import type { CSSProperties, ReactNode } from 'react';
import { Download, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import masterData from '@/data/master.json';

const skills = {
    frontend: ['React.js', 'Next.js', 'Material UI', 'Tailwind CSS', 'Chakra UI', 'Redux', 'Elastic UI', 'HTML5', 'CSS3', 'Responsive Design', 'Jest', 'Webpack', 'Babel', 'Vite'],
    backend: ['Node.js', 'Express.js', 'Hapi.js', 'Django', 'Django REST Framework', 'REST APIs', 'GraphQL', 'SOAP', 'MQTT', 'WebSockets', 'OAuth', 'JWT', 'HLS', 'API Design', 'Third-Party Integrations', 'Webhooks', 'Query Optimization'],
    languages: ['JavaScript', 'TypeScript', 'Python', 'C#', 'C++', 'C', 'PHP'],
    databases: ['MongoDB', 'MySQL', 'SQLite', 'Elasticsearch', 'DynamoDB'],
    devops: ['Git', 'GitHub', 'Docker', 'Nginx', 'AWS S3', 'Linux', 'Windows', 'Cron Jobs', 'PowerShell', 'GitHub Actions', 'CI/CD Pipelines'],
    other: ['OpenCV', 'TensorFlow', 'Emgu CV', 'Wireshark', 'RTSP', 'ELK Stack', 'ApexCharts', 'PDF/Excel Reports', 'AWS Bedrock', 'Boto3', 'Streamlit', 'AI Tool Integration'],
};

const projects = [
    {
        name: 'Web-Warehouse',
        stack: 'Next.js, MongoDB, Mongoose, Tailwind CSS, ApexCharts, Three.js',
        description: 'Built a full-stack warehouse tracking system with role-based access, 3D visualization, and an optimized MongoDB schema for inventory and order management.',
    },
    {
        name: 'Little Lemon Restaurant App',
        stack: 'React.js, Figma, Tailwind CSS',
        description: 'Designed a fully responsive multi-page restaurant app as part of Meta’s capstone project with a smooth experience across devices.',
    },
    {
        name: 'Motion Detection Application',
        stack: 'C#, Emgu CV, Windows Forms',
        description: 'Created a real-time motion detection app using frame differencing, bounding boxes, and automated screenshot capture for security use cases.',
    },
    {
        name: 'Shipping Assistant',
        stack: 'Streamlit, Python, AWS Bedrock, ShipEngine, Pandas',
        description: 'Built an AI-powered logistics and procurement tool with shipping rate comparison, CSV upload workflows, and interactive analytics.',
    },
];

const certificates = [
    'Meta Frontend Professional Certificate',
    'Basic Image Classification with TensorFlow',
    'Programming Fundamentals',
];

const education = [
    {
        school: 'California State University, Channel Islands',
        degree: 'MS in Computer Science',
        period: 'January 2025 – Current',
        location: 'Camarillo, USA',
    },
    {
        school: 'Gujarat Technological University',
        degree: 'BE in Computer Engineering',
        period: 'August 2019 – July 2023',
        location: 'Ahmedabad, India',
    },
];

export default function ResumePage() {
    const { personal, experiences } = masterData;

    return (
        <main
            className="container"
            style={{
                paddingTop: 'calc(var(--nav-height) + 3rem)',
                paddingBottom: '4rem',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 className="heading-lg" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Resume</h1>
                    <p className="text-body" style={{ maxWidth: '780px' }}>
                        This page includes both versions of the resume: a digital resume for quick reading and the original PDF version for sharing or download.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href="/RESUME.pdf" target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Open PDF <ExternalLink size={18} />
                    </a>
                    <a href="/RESUME.pdf" download="Trupal_Patel_Resume.pdf" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Download PDF <Download size={18} />
                    </a>
                </div>
            </div>

            <section className="glass-card" style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent-primary)', fontWeight: 800 }}>Digital Resume</p>
                        <h2 style={{ fontSize: '2.2rem', margin: '0.5rem 0 0.35rem', color: '#fff' }}>{personal.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>{personal.title}</p>
                    </div>
                    <div style={{ display: 'grid', gap: '0.7rem', minWidth: '280px' }}>
                        <ResumeMeta icon={<Mail size={16} />} text={personal.email} />
                        <ResumeMeta icon={<Phone size={16} />} text={personal.phone} />
                        <ResumeMeta icon={<MapPin size={16} />} text={personal.location} />
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <ResumeBlock title="Summary">
                        <p style={bodyText}>
                            Full-Stack Software Engineer with experience building scalable, production-grade web applications and real-time systems. Strong expertise in React, TypeScript, Node.js, Python, MongoDB, and Elasticsearch, with a track record delivering secure role-based systems, data-heavy dashboards, and third-party integrations.
                        </p>
                    </ResumeBlock>

                    <ResumeBlock title="Experience">
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            {experiences.map((experience) => (
                                <div key={experience.slug} style={{ paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{experience.company}</h3>
                                            <p style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{experience.role}</p>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{experience.period}</p>
                                    </div>
                                    <ul style={listStyle}>
                                        {experience.deepDive.impact.map((item) => (
                                            <li key={item} style={listItemStyle}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </ResumeBlock>

                    <ResumeBlock title="Skills">
                        <div style={{ display: 'grid', gap: '0.85rem' }}>
                            <SkillRow label="Frontend" values={skills.frontend} />
                            <SkillRow label="Backend" values={skills.backend} />
                            <SkillRow label="Languages" values={skills.languages} />
                            <SkillRow label="Databases" values={skills.databases} />
                            <SkillRow label="DevOps & Tools" values={skills.devops} />
                            <SkillRow label="Other" values={skills.other} />
                        </div>
                    </ResumeBlock>

                    <ResumeBlock title="Projects">
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {projects.map((project) => (
                                <div key={project.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                        <h3 style={{ color: '#fff', fontSize: '1rem' }}>{project.name}</h3>
                                        <p style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>{project.stack}</p>
                                    </div>
                                    <p style={bodyText}>{project.description}</p>
                                </div>
                            ))}
                        </div>
                    </ResumeBlock>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <ResumeBlock title="Certificates">
                            <ul style={listStyle}>
                                {certificates.map((certificate) => (
                                    <li key={certificate} style={listItemStyle}>{certificate}</li>
                                ))}
                            </ul>
                        </ResumeBlock>

                        <ResumeBlock title="Education">
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {education.map((item) => (
                                    <div key={item.school}>
                                        <h3 style={{ color: '#fff', fontSize: '1rem' }}>{item.school}</h3>
                                        <p style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{item.degree}</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{item.period} | {item.location}</p>
                                    </div>
                                ))}
                            </div>
                        </ResumeBlock>
                    </div>
                </div>
            </section>

            <section className="glass-card" style={{ padding: '1rem', borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ padding: '1rem 1rem 0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent-primary)', fontWeight: 800 }}>PDF Resume</p>
                    <h2 style={{ color: '#fff', fontSize: '1.4rem', marginTop: '0.5rem' }}>Original PDF Version</h2>
                </div>
                <div
                    style={{
                        minHeight: '82vh',
                        width: '100%',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <object data="/RESUME.pdf#view=FitH" type="application/pdf" style={{ width: '100%', height: '82vh', border: 'none' }}>
                        <div style={{ padding: '2rem', color: '#111827' }}>
                            <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                                Your browser could not render the PDF inline.
                            </p>
                            <a href="/RESUME.pdf" target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontWeight: 700 }}>
                                Open the resume PDF in a new tab
                            </a>
                        </div>
                    </object>
                </div>
            </section>
        </main>
    );
}

function ResumeMeta({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-primary)', display: 'inline-flex' }}>{icon}</span>
            <span>{text}</span>
        </div>
    );
}

function ResumeBlock({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.9rem' }}>{title}</h2>
            {children}
        </section>
    );
}

function SkillRow({ label, values }: { label: string; values: string[] }) {
    return (
        <div>
            <p style={{ color: '#fff', fontWeight: 700, marginBottom: '0.35rem' }}>{label}</p>
            <p style={bodyText}>{values.join(', ')}</p>
        </div>
    );
}

const bodyText: CSSProperties = {
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
};

const listStyle: CSSProperties = {
    display: 'grid',
    gap: '0.55rem',
    paddingLeft: '1rem',
};

const listItemStyle: CSSProperties = {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
};
