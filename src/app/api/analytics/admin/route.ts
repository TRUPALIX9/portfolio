import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthorizedRequest } from '@/utils/admin';
import { addOwnerIp, getAnalytics, getClientIp, getConfig, invalidateConfigCache, ownerIps, setVisitorsOwner } from '@/utils/analytics/server';

const RESET_PHRASE = 'RESET ANALYTICS';

const visitorId = z.string().regex(/^[\w-]{8,64}$/);
const ip = z.string().min(3).max(64).regex(/^[\w.:]+$/);

const actionSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('rename'), visitorId, name: z.string().max(60) }),
    z.object({ action: z.literal('set_owner'), visitorId, value: z.boolean() }),
    z.object({ action: z.literal('set_bot'), visitorId, value: z.boolean() }),
    z.object({ action: z.literal('block_ip'), ip }),
    z.object({ action: z.literal('unblock_ip'), ip }),
    z.object({ action: z.literal('delete_visitor'), visitorId }),
    z.object({ action: z.literal('reset_all'), confirm: z.literal(RESET_PHRASE) }),
    // Without an ip, the IP this request comes from (the admin's current network).
    z.object({ action: z.literal('add_owner_ip'), ip: ip.optional() }),
    z.object({ action: z.literal('remove_owner_ip'), ip }),
]);

/** Blocked IPs, owner IPs and the owner's own devices, for the Data tab. */
export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }
    try {
        const { db, visitors, events, sessions } = await getAnalytics();
        const config = await getConfig(db, true);
        const [owners, totals] = await Promise.all([
            visitors.find({ is_owner: true }, { projection: { _id: 0, visitor_id: 1, custom_name: 1, device: 1, geo: 1, ip: 1, last_seen: 1 } })
                .sort({ last_seen: -1 }).limit(50).toArray(),
            Promise.all([visitors.estimatedDocumentCount(), sessions.estimatedDocumentCount(), events.estimatedDocumentCount()]),
        ]);
        return NextResponse.json({
            blockedIps: config.blocked_ips,
            ownerIps: config.owner_ips,
            envOwnerIps: ownerIps(),
            currentIp: getClientIp(request),
            owners,
            totals: { visitors: totals[0], sessions: totals[1], events: totals[2] },
            resetPhrase: RESET_PHRASE,
        });
    } catch (error) {
        console.error('Analytics admin GET error:', error);
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    const body = parsed.data;

    try {
        const { visitors, sessions, events, pageviews, config } = await getAnalytics();

        switch (body.action) {
            case 'rename':
                await visitors.updateOne({ visitor_id: body.visitorId }, { $set: { custom_name: body.name.trim() } });
                break;
            case 'set_owner':
                await setVisitorsOwner([body.visitorId], body.value);
                break;
            case 'set_bot': {
                const visitorUpdate = body.value
                    ? { $set: { is_bot: true, bot_reason: 'manual' } }
                    : { $set: { is_bot: false }, $unset: { bot_reason: '' } };
                await Promise.all([
                    visitors.updateOne({ visitor_id: body.visitorId }, visitorUpdate),
                    sessions.updateMany({ visitor_id: body.visitorId }, visitorUpdate),
                    events.updateMany({ visitor_id: body.visitorId }, { $set: { bot: body.value } }),
                    pageviews.updateMany({ visitor_id: body.visitorId }, { $set: { bot: body.value } }),
                ]);
                break;
            }
            case 'block_ip': {
                await config.updateOne({ _id: 'main' }, { $addToSet: { blocked_ips: body.ip } }, { upsert: true });
                // Existing traffic from that IP is kept but hidden as bot traffic.
                const ids = (await visitors.find({ ip: body.ip }, { projection: { visitor_id: 1 } }).toArray()).map((v) => v.visitor_id);
                await Promise.all([
                    visitors.updateMany({ ip: body.ip }, { $set: { is_bot: true, bot_reason: 'blocked_ip' } }),
                    sessions.updateMany({ visitor_id: { $in: ids } }, { $set: { is_bot: true, bot_reason: 'blocked_ip' } }),
                    events.updateMany({ visitor_id: { $in: ids } }, { $set: { bot: true } }),
                    pageviews.updateMany({ visitor_id: { $in: ids } }, { $set: { bot: true } }),
                ]);
                invalidateConfigCache();
                break;
            }
            case 'unblock_ip':
                await config.updateOne({ _id: 'main' }, { $pull: { blocked_ips: body.ip } });
                invalidateConfigCache();
                break;
            case 'delete_visitor':
                await Promise.all([
                    visitors.deleteOne({ visitor_id: body.visitorId }),
                    sessions.deleteMany({ visitor_id: body.visitorId }),
                    events.deleteMany({ visitor_id: body.visitorId }),
                    pageviews.deleteMany({ visitor_id: body.visitorId }),
                ]);
                break;
            case 'add_owner_ip': {
                const target = body.ip ?? getClientIp(request);
                if (!target) return NextResponse.json({ error: 'Could not detect your IP' }, { status: 400 });
                await addOwnerIp(target);
                break;
            }
            case 'remove_owner_ip':
                // Existing records keep their owner tag; use "Not me" on a visitor to undo one.
                await config.updateOne({ _id: 'main' }, { $pull: { owner_ips: body.ip } });
                invalidateConfigCache();
                break;
            case 'reset_all':
                // Blocked IPs (config) survive a reset; everything recorded is removed.
                await Promise.all([visitors.deleteMany({}), sessions.deleteMany({}), events.deleteMany({}), pageviews.deleteMany({})]);
                break;
        }
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Analytics admin POST error:', error);
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}
