"use client";

import { ExternalLink } from 'lucide-react';
import type { CourseCertificate } from '@/data/certifications';
import Carousel from './Carousel';

export default function CourseCarousel({ courses, label }: { courses: CourseCertificate[]; label: string }) {
    return (
        <Carousel
            label={label}
            itemName="course"
            title={<p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-2 m-0">{courses.length} course certificates</p>}
            slideClassName="w-[78%] sm:w-[220px]"
            slideLabels={courses.map((c) => c.title)}
        >
            {courses.map((course, i) => (
                <div
                    key={course.url}
                    className="flex w-full flex-col justify-between gap-4 rounded-xl border border-line-1 bg-surface-1 p-4 transition-colors duration-200 hover:border-line-2"
                >
                    <div>
                        <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-[0.875rem] font-semibold text-ink-1 leading-snug m-0 mt-1">{course.title}</p>
                    </div>
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <p className="text-[1.15rem] font-extrabold text-accent leading-none m-0">{course.grade}</p>
                            <p className="text-xs text-ink-3 m-0 mt-1">{course.completed}</p>
                        </div>
                        <a
                            href={course.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View ${course.title} certificate`}
                            className="shrink-0 rounded-full border border-line-2 p-2 text-ink-2 transition-colors duration-150 hover:text-accent hover:border-accent/40"
                        >
                            <ExternalLink size={13} aria-hidden="true" />
                        </a>
                    </div>
                </div>
            ))}
        </Carousel>
    );
}
