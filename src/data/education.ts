export type Degree = {
    school: string;
    degree: string;
    /** Month the degree was finished, e.g. "May 2026". */
    graduated: string;
    url: string;
    logo: string;
};

/** Degrees, newest first. From the résumé. */
export const EDUCATION: Degree[] = [
    {
        school: 'California State University Channel Islands',
        degree: 'Master of Science, Computer Science',
        graduated: 'May 2026',
        url: 'https://www.csuci.edu',
        logo: '/csuci-icon.png',
    },
    {
        school: 'Gujarat Technological University',
        degree: 'Bachelor of Engineering, Computer Engineering',
        graduated: 'Jul 2023',
        url: 'https://www.gtu.ac.in',
        logo: '/gtu-icon.png',
    },
];
