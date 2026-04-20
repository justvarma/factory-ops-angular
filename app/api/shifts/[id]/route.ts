import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  const { id } = await params;

  if (!authUser || (authUser.role !== 'Admin' && authUser.role !== 'Manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }
    const body = JSON.parse(text);
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

    // Check for global overlap with other shifts
    const existingShifts = await prisma.shift.findMany({
      where: { NOT: { id: parseInt(id) } }
    });
    for (const s of existingShifts) {
      const sStart = toMinutes(s.start_time as any);
      let sEnd = toMinutes(s.end_time as any);
      if (sEnd <= sStart) sEnd += 24 * 60;

      if (Math.max(startMin, sStart) < Math.min(endMin, sEnd)) {
        return NextResponse.json({ error: `Shift overlaps with existing shift: ${s.name}` }, { status: 400 });
      }
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

      let adjBStart = bStart;
      let adjBEnd = bEnd;
      if (adjBStart < startMin) adjBStart += 24 * 60;
      if (adjBEnd < startMin) adjBEnd += 24 * 60;

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

    const updatedShift = await prisma.$transaction(async (tx) => {
      // 1. Delete existing breaks for this shift
      await tx.renamedbreak.deleteMany({
        where: { shift_id: parseInt(id) },
      });

      // 2. Update the current shift
      const current = await tx.shift.update({
        where: { id: parseInt(id) },
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

      // 3. Enforce back-to-back: Update NEXT shift if it exists
      // Logic: If this is "Shift N", find "Shift N+1"
      const currentNumMatch = name?.match(/\d+/);
      if (currentNumMatch) {
        const nextNum = parseInt(currentNumMatch[0]) + 1;
        const nextName = `Shift ${nextNum}`;
        const nextShift = await tx.shift.findFirst({
          where: { name: nextName }
        });

        if (nextShift) {
          const nextStartMin = endMinOrig; // Next shift starts at current end
          const nextEndMinOrig = toMinutes(nextShift.end_time);

          const next_st_flag = nextStartMin < 6 * 60;
          const next_et_flag = nextEndMinOrig < nextStartMin;

          await tx.shift.update({
            where: { id: nextShift.id },
            data: {
              start_time: toISOTime(end_time),
              st_flag: next_st_flag,
              et_flag: next_et_flag
            }
          });
        }
      }

      return current;
    });

    return NextResponse.json(updatedShift);
  } catch (error: any) {
    console.error('Update shift error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update shift' }, { status: 400 });
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  const { id } = await params;

  if (!authUser || (authUser.role !== 'Admin' && authUser.role !== 'Manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.shift.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}
