import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const shifts = await prisma.shift.findMany({
      include: { renamedbreak: true },
    });
    return NextResponse.json(shifts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

const toISOTime = (timeStr: string) => {
  if (!timeStr) return null;
  if (timeStr.includes('T')) return timeStr;
  return `1970-01-01T${timeStr}:00.000Z`;
};

const toMinutes = (t: any) => {
  if (!t) return 0;
  if (t instanceof Date) {
    return t.getUTCHours() * 60 + t.getUTCMinutes();
  }
  const time = typeof t === 'string' && t.includes('T') ? t.split('T')[1] : String(t);
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const formatInterval = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser || (authUser.role !== 'Admin' && authUser.role !== 'Manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, start_time, end_time, breaks } = body;

    const startMin = toMinutes(start_time);
    const endMinOrig = toMinutes(end_time);
    let endMin = endMinOrig;

    const st_flag = startMin < 6 * 60;
    // If end_time is same as start_time, we treat it as 24h shift
    const et_flag = endMinOrig <= startMin;

    if (et_flag) endMin += 24 * 60;

    const shiftDuration = endMin - startMin;
    if (shiftDuration === 0) {
      throw new Error('Shift duration must be greater than 0');
    }

    // Check for global overlap with existing shifts
    const existingShifts = await prisma.shift.findMany();
    for (const s of existingShifts) {
      const sStart = toMinutes(s.start_time as any);
      let sEnd = toMinutes(s.end_time as any);
      if (sEnd <= sStart) sEnd += 24 * 60;

      // Check overlap (max of starts < min of ends)
      if (Math.max(startMin, sStart) < Math.min(endMin, sEnd)) {
        return NextResponse.json({ error: `Shift overlaps with existing shift: ${s.name}` }, { status: 400 });
      }
      // Also check if it wraps around and overlaps (e.g. 22-06 and 05-09)
      if (Math.max(startMin + 24*60, sStart) < Math.min(endMin + 24*60, sEnd)) {
        return NextResponse.json({ error: `Shift overlaps with existing shift: ${s.name}` }, { status: 400 });
      }
      if (Math.max(startMin, sStart + 24*60) < Math.min(endMin, sEnd + 24*60)) {
        return NextResponse.json({ error: `Shift overlaps with existing shift: ${s.name}` }, { status: 400 });
      }
    }

    let totalBreakMin = 0;
    const breakPortions: { start: number; end: number; type: string }[] = [];

    const processedBreaks = breaks?.map((b: any, index: number) => {
      const bStart = toMinutes(b.break_start);
      let bEnd = toMinutes(b.break_end);

      // Adjust break times relative to shift start
      let adjBStart = bStart;
      let adjBEnd = bEnd;
      if (adjBStart < startMin) adjBStart += 24 * 60;
      if (adjBEnd < startMin) adjBEnd += 24 * 60;

      // If after adjustment bEnd is still before/at bStart, it means it crosses the next midnight
      if (adjBEnd <= adjBStart) adjBEnd += 24 * 60;

      // Validation: Break must be within shift
      if (adjBStart < startMin || adjBEnd > endMin) {
        throw new Error(`Break ${index + 1} (${b.break_type}) is outside of shift hours (${start_time} - ${end_time})`);
      }

      // Validation: Break duration must be positive
      if (adjBEnd <= adjBStart) {
        throw new Error(`Break ${index + 1} (${b.break_type}) has invalid duration`);
      }

      totalBreakMin += (adjBEnd - adjBStart);
      breakPortions.push({ start: adjBStart, end: adjBEnd, type: b.break_type });

      return {
        break_start: toISOTime(b.break_start),
        break_end: toISOTime(b.break_end),
        break_type: b.break_type === 'Other' ? b.custom_reason : b.break_type,
      };
    });

    // Check for overlapping breaks
    breakPortions.sort((a, b) => a.start - b.start);
    for (let i = 0; i < breakPortions.length - 1; i++) {
      if (breakPortions[i].end > breakPortions[i + 1].start) {
        throw new Error(`Breaks overlap: ${breakPortions[i].type} and ${breakPortions[i + 1].type}`);
      }
    }

    const actualWorkMin = Math.max(0, shiftDuration - totalBreakMin);
    const formattedDuration = formatInterval(actualWorkMin);

    const newShift = await prisma.shift.create({
      data: {
        name,
        start_time: toISOTime(start_time),
        end_time: toISOTime(end_time),
        st_flag,
        et_flag,
        actual_work_time: formattedDuration,
        renamedbreak: {
          create: processedBreaks,
        },
      },
      include: { renamedbreak: true },
    });

    return NextResponse.json(newShift);
  } catch (error: any) {
    console.error('Create shift error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create shift' }, { status: 400 });
  }
}
