import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { ObjectiveService } from '@/services/objectiveService';
import { UpdateObjectiveValidation } from '@/validations/ObjectiveValidation';

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
    const objectiveId = Number.parseInt(id, 10);

    if (Number.isNaN(objectiveId)) {
      return NextResponse.json({ error: 'Invalid objective ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateObjectiveValidation.safeParse({ ...json, id: objectiveId });

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const objective = await ObjectiveService.updateObjective(
      objectiveId,
      parse.data,
      user.id,
    );

    if (!objective) {
      return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
    }

    logger.info('Objective has been updated', { objectiveId: objective.id });

    return NextResponse.json({ objective });
  } catch (error) {
    logger.error('Error updating objective:', error);
    return NextResponse.json(
      { error: 'Failed to update objective' },
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
    const objectiveId = Number.parseInt(id, 10);

    if (Number.isNaN(objectiveId)) {
      return NextResponse.json({ error: 'Invalid objective ID' }, { status: 400 });
    }

    await ObjectiveService.deleteObjective(objectiveId, user.id);

    logger.info('Objective has been deleted', { objectiveId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting objective:', error);
    return NextResponse.json(
      { error: 'Failed to delete objective' },
      { status: 500 },
    );
  }
};
