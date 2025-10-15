import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { SprintService } from '@/services/sprintService';
import { SprintValidation } from '@/validations/SprintValidation';

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const parse = SprintValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const sprintData = {
      ...parse.data,
      startDate: parse.data.startDate ? new Date(parse.data.startDate) : null,
      endDate: parse.data.endDate ? new Date(parse.data.endDate) : null,
    };

    const sprint = await SprintService.createSprint(sprintData, user.id);

    logger.info('Sprint has been created', { sprintId: sprint.id });

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating sprint:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create sprint' },
      { status: 500 },
    );
  }
};
