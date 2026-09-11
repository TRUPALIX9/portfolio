export type CourseCertificate = {
    title: string;
    completed: string;
    grade: string;
    url: string;
};

export type Certification = {
    title: string;
    issuer: string;
    /** Platform the credential was delivered through, when different from the issuer. */
    platform?: string;
    issued?: string;
    credentialId?: string;
    credentialUrl?: string;
    skills: string[];
    summary?: string;
    featured?: boolean;
    /** Individual course certificates earned as part of a specialization. */
    courses?: CourseCertificate[];
};

// Coursera credential URLs were checked against coursera.org/verify/<id>: each page
// resolves and names the matching course.
export const certifications: Certification[] = [
    {
        title: 'AI Mastery Certificate',
        issuer: 'Cal Poly Digital Transformation Hub',
        platform: 'DXHub AI Summer Camp 2025 · AWS & Cal Poly',
        issued: 'Aug 2025',
        credentialUrl: 'https://www.linkedin.com/in/trupalix/overlay/Certifications/1176663445/treasury/?profileId=ACoAADBkH-IB-pgiUOLnmlMa2oRBF0XBtJoJbHs',
        skills: ['LLMs', 'Vector Databases', 'Prompt Engineering', 'LangChain', 'Hugging Face', 'Streamlit', 'AWS Bedrock', 'AWS Lambda', 'Amazon Textract', 'Team Building'],
        summary: 'Awarded by AWS & Cal Poly for mastering LLMs, vector databases, prompt engineering, and full-stack AI. Built real-world AI apps with LangChain, Hugging Face, Streamlit, and AWS (S3, Lambda, Bedrock, Textract). Recognized as an AI Champion for technical excellence, ethical AI practices, and a standout presentation.',
        featured: true,
    },
    {
        title: 'Meta Front-End Developer Specialization',
        issuer: 'Meta',
        platform: 'Coursera',
        issued: 'Jun 2024',
        credentialId: 'FNJ8FB8ESHJ5',
        credentialUrl: 'https://www.coursera.org/verify/specialization/FNJ8FB8ESHJ5',
        skills: ['React', 'JavaScript', 'HTML & CSS', 'UI/UX Design', 'User Research', 'Accessibility (WCAG)', 'Unit Testing', 'Version Control'],
        summary: 'Completed June 13, 2024 — a 9-course specialization covering front-end fundamentals, JavaScript, version control, HTML/CSS in depth, React basics and advanced React, UX/UI principles, a capstone project, and coding interview prep.',
        featured: true,
        courses: [
            { title: 'Introduction to Front-End Development', completed: 'May 21, 2024', grade: '95%', url: 'https://www.coursera.org/account/accomplishments/certificate/HFX7RT2BW9N5' },
            { title: 'Programming with JavaScript', completed: 'May 22, 2024', grade: '98.40%', url: 'https://www.coursera.org/account/accomplishments/certificate/BVJSWLDKEFH9' },
            { title: 'Version Control', completed: 'May 22, 2024', grade: '88.12%', url: 'https://www.coursera.org/account/accomplishments/certificate/LQDC2SZCXEZ5' },
            { title: 'HTML and CSS in depth', completed: 'May 27, 2024', grade: '88%', url: 'https://www.coursera.org/account/accomplishments/certificate/GNKABEFJAMTG' },
            { title: 'React Basics', completed: 'May 29, 2024', grade: '90.71%', url: 'https://www.coursera.org/account/accomplishments/certificate/3PGMAV4V5MXT' },
            { title: 'Advanced React', completed: 'June 1, 2024', grade: '92%', url: 'https://www.coursera.org/account/accomplishments/certificate/FY3CCJHHJVES' },
            { title: 'Principles of UX/UI Design', completed: 'June 6, 2024', grade: '92.25%', url: 'https://www.coursera.org/account/accomplishments/certificate/WK4HE7ZHV8NE' },
            { title: 'Front-End Developer Capstone', completed: 'June 12, 2024', grade: '89.51%', url: 'https://www.coursera.org/account/accomplishments/certificate/97K2Q8ADCV2B' },
            { title: 'Coding Interview Preparation', completed: 'June 13, 2024', grade: '80%', url: 'https://www.coursera.org/account/accomplishments/certificate/JFJ4DSPUMBUX' },
        ],
    },
    {
        title: 'Elastic Stack',
        issuer: 'Great Learning',
        credentialUrl: 'https://dtmvamahs40ux.cloudfront.net/ComplementaryCourseCertificate/4055073/original/Trupal_Yogendrakumar_Patel20240126-70-nxnl99.jpg',
        skills: ['Elasticsearch', 'Kibana'],
    },
    {
        title: 'AWS S3 Basics',
        issuer: 'Coursera',
        issued: 'Sep 2023',
        credentialId: 'WQFG7K383FG2',
        credentialUrl: 'https://www.coursera.org/verify/WQFG7K383FG2',
        skills: ['Amazon S3'],
    },
    {
        title: 'Basic Image Classification with TensorFlow',
        issuer: 'Coursera',
        issued: 'Aug 2023',
        credentialId: 'FAN58S8YVJ2M',
        credentialUrl: 'https://www.coursera.org/verify/FAN58S8YVJ2M',
        skills: ['Image Classification', 'TensorFlow'],
    },
    {
        title: 'Introduction to Bash Shell Scripting',
        issuer: 'Coursera',
        issued: 'Aug 2023',
        credentialId: 'DWQEHW2DMN6K',
        credentialUrl: 'https://www.coursera.org/verify/DWQEHW2DMN6K',
        skills: ['Bash'],
    },
    {
        title: 'Command Line in Linux',
        issuer: 'Coursera',
        issued: 'Aug 2023',
        credentialId: 'YEQYU8FEVFFE',
        credentialUrl: 'https://www.coursera.org/verify/YEQYU8FEVFFE',
        skills: ['Linux'],
    },
    {
        title: 'Modern JavaScript: ES6 Basics',
        issuer: 'Coursera',
        issued: 'Aug 2023',
        // Guided-project credential: uses the accomplishments/certificate path, not /verify.
        credentialId: '5KYQRVX3XXQR',
        credentialUrl: 'https://www.coursera.org/account/accomplishments/certificate/5KYQRVX3XXQR',
        skills: ['JavaScript', 'Node.js'],
    },
    {
        title: 'HTML, CSS, and JavaScript for Web Developers',
        issuer: 'Johns Hopkins University',
        platform: 'Coursera',
        issued: 'Nov 2021',
        credentialId: '3D5M5RTPG88G',
        credentialUrl: 'https://www.coursera.org/verify/3D5M5RTPG88G',
        skills: ['HTML', 'CSS', 'JavaScript'],
    },
    {
        title: 'Operating Systems and You: Becoming a Power User',
        issuer: 'Google',
        platform: 'Coursera',
        issued: 'Oct 2020',
        credentialId: 'PKHNJJZQEYRG',
        credentialUrl: 'https://www.coursera.org/verify/PKHNJJZQEYRG',
        skills: ['Linux', 'Windows'],
    },
    {
        title: 'Programming Fundamentals',
        issuer: 'Duke University',
        platform: 'Coursera',
        issued: 'Jun 2020',
        credentialId: 'LBVJNUEA645V',
        credentialUrl: 'https://www.coursera.org/verify/LBVJNUEA645V',
        skills: ['Programming Fundamentals'],
    },
    {
        title: 'Technical Support Fundamentals',
        issuer: 'Google',
        platform: 'Coursera',
        issued: 'Apr 2020',
        credentialId: 'XKB43Q444PDH',
        credentialUrl: 'https://www.coursera.org/verify/XKB43Q444PDH',
        skills: ['Technical Support'],
    },
    {
        title: 'The Bits and Bytes of Computer Networking',
        issuer: 'Google',
        platform: 'Coursera',
        issued: 'Apr 2020',
        credentialId: '3MK79ERA8HXS',
        credentialUrl: 'https://www.coursera.org/verify/3MK79ERA8HXS',
        skills: ['Networking'],
    },
];
