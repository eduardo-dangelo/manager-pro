import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { ObjectiveService } from '@/services/objectiveService';
import { ObjectiveValidation } from '@/validations/ObjectiveValidation';

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const parse = ObjectiveValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const objective = await ObjectiveService.createObjective(parse.data, user.id);

    logger.info('Objective has been created', { objectiveId: objective.id });

    return NextResponse.json({ objective }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating objective:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create objective' },
      { status: 500 },
    );
  }
};
