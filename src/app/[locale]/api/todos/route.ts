import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { TodoService } from '@/services/todoService';
import { TodoValidation } from '@/validations/TodoValidation';

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

    const parse = TodoValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const todoData = {
      ...parse.data,
      dueDate: parse.data.dueDate ? new Date(parse.data.dueDate) : null,
    };

    const todo = await TodoService.createTodo(todoData, user.id);

    logger.info('Todo has been created', { todoId: todo.id });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating todo:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 },
    );
  }
};
