import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { assetsSchema, todosSchema } from '@/models/Schema';

export type TodoData = {
  name: string;
  description: string;
  assetId: number;
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
   * Verify asset ownership
   */
  private static async verifyAssetOwnership(assetId: number, userId: string) {
    const asset = await db
      .select()
      .from(assetsSchema)
      .where(
        and(
          eq(assetsSchema.id, assetId),
          eq(assetsSchema.userId, userId),
        ),
      )
      .limit(1);

    return asset.length > 0;
  }

  /**
   * Create a new todo
   */
  static async createTodo(todoData: TodoData, userId: string) {
    try {
      // Verify asset ownership
      const hasAccess = await this.verifyAssetOwnership(todoData.assetId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Asset not found or access denied');
      }

      const newTodo = await db.insert(todosSchema).values({
        name: todoData.name,
        description: todoData.description,
        assetId: todoData.assetId,
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
   * Get all todos for an asset
   */
  static async getTodosByAssetId(assetId: number, userId: string) {
    try {
      // Verify asset ownership
      const hasAccess = await this.verifyAssetOwnership(assetId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Asset not found or access denied');
      }

      const todos = await db
        .select()
        .from(todosSchema)
        .where(eq(todosSchema.assetId, assetId))
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
