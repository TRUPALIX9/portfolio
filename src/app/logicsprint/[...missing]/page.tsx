import { notFound } from 'next/navigation';

/**
 * Any other path on logicsprint.* ends the run: src/proxy.ts rewrites unknown product paths to
 * /logicsprint/_missing, which only this catch-all can match.
 * notFound() renders ../not-found.tsx inside the LogicSprint layout, with a 404 status.
 */
export default function MissingLogicSprintPage(): never {
    notFound();
}
