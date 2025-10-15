import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { TaskService } from '@/services/taskService';
import { TaskValidation } from '@/validations/TaskValidation';

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();

    // Convert dueDate string to Date if provided
    if (json.dueDate) {
      json.dueDate = new Date(json.dueDate);
    }

    const parse = TaskValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const taskData = {
      ...parse.data,
      dueDate: parse.data.dueDate ? new Date(parse.data.dueDate) : null,
    };

    const task = await TaskService.createTask(taskData, user.id);

    logger.info('Task has been created', { taskId: task.id });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating task:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 },
    );
  }
};
