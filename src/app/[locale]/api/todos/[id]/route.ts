import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { TodoService } from '@/services/todoService';
import { UpdateTodoValidation } from '@/validations/TodoValidation';

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
    const todoId = Number.parseInt(id, 10);

    if (Number.isNaN(todoId)) {
      return NextResponse.json({ error: 'Invalid todo ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateTodoValidation.safeParse({ ...json, id: todoId });

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const todoData = {
      ...parse.data,
      dueDate: parse.data.dueDate ? new Date(parse.data.dueDate) : undefined,
    };

    const todo = await TodoService.updateTodo(todoId, todoData, user.id);

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    logger.info('Todo has been updated', { todoId: todo.id });

    return NextResponse.json({ todo });
  } catch (error) {
    logger.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
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
    const todoId = Number.parseInt(id, 10);

    if (Number.isNaN(todoId)) {
      return NextResponse.json({ error: 'Invalid todo ID' }, { status: 400 });
    }

    await TodoService.deleteTodo(todoId, user.id);

    logger.info('Todo has been deleted', { todoId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 },
    );
  }
};
