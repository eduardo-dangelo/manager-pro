import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { TaskService } from '@/services/taskService';
import { UpdateTaskValidation } from '@/validations/TaskValidation';

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
    const taskId = Number.parseInt(id, 10);

    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateTaskValidation.safeParse({ ...json, id: taskId });

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const taskData = {
      ...parse.data,
      dueDate: parse.data.dueDate ? new Date(parse.data.dueDate) : undefined,
    };

    const task = await TaskService.updateTask(taskId, taskData, user.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    logger.info('Task has been updated', { taskId: task.id });

    return NextResponse.json({ task });
  } catch (error) {
    logger.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
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
    const taskId = Number.parseInt(id, 10);

    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    await TaskService.deleteTask(taskId, user.id);

    logger.info('Task has been deleted', { taskId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 },
    );
  }
};
