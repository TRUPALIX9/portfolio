import { NextResponse } from 'next/server';
import { isAuthorizedRequest } from '@/utils/admin';
import {
    DEVICE_FILTERS,
    RANGES,
    TRAFFIC_FILTERS,
    pageviewsReport,
    acquisitionReport,
    contentReport,
    intentReport,
    liveReport,
    overviewReport,
    visitorDetail,
    visitorsReport,
    type DeviceFilter,
    type RangeKey,
    type ReportOptions,
    type TrafficFilter,
} from '@/utils/analytics/reports';

function pick(allowed: readonly string[], value: string | null, fallback: string) {
    return value && allowed.includes(value) ? value : fallback;
}

export async function GET(request: Request) {
    if (!(await isAuthorizedRequest(request))) {
        return NextResponse.json({ error: 'Unauthorized key' }, { status: 401 });
    }

    const params = new URL(request.url).searchParams;
    const rangeParam = params.get('range') ?? '7d';
    const options: ReportOptions = {
        range: (rangeParam in RANGES ? rangeParam : '7d') as RangeKey,
        traffic: pick(TRAFFIC_FILTERS, params.get('traffic'), 'human') as TrafficFilter,
        device: pick(DEVICE_FILTERS, params.get('device'), 'all') as DeviceFilter,
        tz: (params.get('tz') || 'UTC').slice(0, 60),
    };

    try {
        switch (params.get('view')) {
            case 'overview':
                return NextResponse.json(await overviewReport(options));
            case 'acquisition':
                return NextResponse.json(await acquisitionReport(options));
            case 'content':
                return NextResponse.json(await contentReport(options));
            case 'intent':
                return NextResponse.json(await intentReport(options));
            case 'live':
                return NextResponse.json(await liveReport(options));
            case 'pageviews':
                return NextResponse.json(await pageviewsReport(
                    options,
                    Math.min(Math.max(Number(params.get('page')) || 0, 0), 1000),
                    params.get('path') ?? '',
                ));
            case 'visitors':
                return NextResponse.json(await visitorsReport(options, params.get('q') ?? ''));
            case 'visitor': {
                const detail = await visitorDetail((params.get('id') ?? '').slice(0, 64));
                return detail
                    ? NextResponse.json(detail)
                    : NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
            }
            default:
                return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
        }
    } catch (error) {
        console.error('Analytics report error:', error);
        return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }
}
