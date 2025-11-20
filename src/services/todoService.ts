import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { projectsSchema, todosSchema } from '@/models/Schema';

export type TodoData = {
  name: string;
  description: string;
  projectId: number;
  objectiveId?: number | null;
  parentTaskId?: number | null;
  status?: string;
  priority?: string;
  dueDate?: Date | null;
  assigneeId?: string | null;
  sprintIds?: number[] | null;
};

export class TodoService {
  /**
   * Verify project ownership
   */
  private static async verifyProjectOwnership(projectId: number, userId: string) {
    const project = await db
      .select()
      .from(projectsSchema)
      .where(
        and(
          eq(projectsSchema.id, projectId),
          eq(projectsSchema.userId, userId),
        ),
      )
      .limit(1);

    return project.length > 0;
  }

  /**
   * Create a new todo
   */
  static async createTodo(todoData: TodoData, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(todoData.projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const newTodo = await db.insert(todosSchema).values({
        name: todoData.name,
        description: todoData.description,
        projectId: todoData.projectId,
        objectiveId: todoData.objectiveId || null,
        parentTaskId: todoData.parentTaskId || null,
        status: todoData.status || 'todo',
        priority: todoData.priority || 'medium',
        dueDate: todoData.dueDate || null,
        assigneeId: todoData.assigneeId || null,
        sprintIds: todoData.sprintIds || null,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newTodo[0];
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  /**
   * Get all todos for a project
   */
  static async getTodosByProjectId(projectId: number, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const todos = await db
        .select()
        .from(todosSchema)
        .where(eq(todosSchema.projectId, projectId))
        .orderBy(todosSchema.createdAt);

      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  /**
   * Get a single todo by ID
   */
  static async getTodoById(todoId: number, userId: string) {
    try {
      const todo = await db
        .select()
        .from(todosSchema)
        .where(
          and(
            eq(todosSchema.id, todoId),
            eq(todosSchema.userId, userId),
          ),
        )
        .limit(1);

      return todo[0] || null;
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  }

  /**
   * Update a todo
   */
  static async updateTodo(
    todoId: number,
    todoData: Partial<TodoData>,
    userId: string,
  ) {
    try {
      const updatedTodo = await db
        .update(todosSchema)
        .set({
          ...todoData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(todosSchema.id, todoId),
            eq(todosSchema.userId, userId),
          ),
        )
        .returning();

      return updatedTodo[0] || null;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  /**
   * Delete a todo
   */
  static async deleteTodo(todoId: number, userId: string) {
    try {
      await db
        .delete(todosSchema)
        .where(
          and(
            eq(todosSchema.id, todoId),
            eq(todosSchema.userId, userId),
          ),
        );

      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }
}
