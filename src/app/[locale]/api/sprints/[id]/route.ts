import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { SprintService } from '@/services/sprintService';
import { UpdateSprintValidation } from '@/validations/SprintValidation';

export const PUT = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const sprintId = Number.parseInt(id, 10);

    if (Number.isNaN(sprintId)) {
      return NextResponse.json({ error: 'Invalid sprint ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateSprintValidation.safeParse({ ...json, id: sprintId });

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const sprintData = {
      ...parse.data,
      startDate: parse.data.startDate ? new Date(parse.data.startDate) : undefined,
      endDate: parse.data.endDate ? new Date(parse.data.endDate) : undefined,
    };

    const sprint = await SprintService.updateSprint(sprintId, sprintData, user.id);

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    logger.info('Sprint has been updated', { sprintId: sprint.id });

    return NextResponse.json({ sprint });
  } catch (error) {
    logger.error('Error updating sprint:', error);
    return NextResponse.json(
      { error: 'Failed to update sprint' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const sprintId = Number.parseInt(id, 10);

    if (Number.isNaN(sprintId)) {
      return NextResponse.json({ error: 'Invalid sprint ID' }, { status: 400 });
    }

    await SprintService.deleteSprint(sprintId, user.id);

    logger.info('Sprint has been deleted', { sprintId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting sprint:', error);
    return NextResponse.json(
      { error: 'Failed to delete sprint' },
      { status: 500 },
    );
  }
};
