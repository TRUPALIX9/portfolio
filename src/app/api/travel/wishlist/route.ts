import { NextResponse } from 'next/server';
import { bingeDb } from '@/utils/binge';

export const revalidate = 300;

/** Public: visitor suggestions Trupal approved, for the "visitors say go here" strip on /travel. Names only, no contact details. */
export async function GET() {
    try {
        const db = await bingeDb();
        const docs = await db.collection('travel_suggestions')
            .find({ status: 'approved' }, { projection: { place: 1, kind: 1, country: 1, state: 1, city: 1, note: 1, name: 1, reviewedAt: 1 } })
            .sort({ reviewedAt: -1 })
            .limit(24)
            .toArray();
        return NextResponse.json(docs.map(({ _id, ...d }) => ({ id: String(_id), ...d })));
    } catch {
        return NextResponse.json([]);
    }
}
