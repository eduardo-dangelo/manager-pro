import { db } from '@/libs/DB';
import { usersSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';

export interface UserData {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  theme?: string;
}

export class UserService {
  /**
   * Create a new user in the database
   */
  static async createUser(userData: UserData) {
    try {
      const newUser = await db.insert(usersSchema).values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        imageUrl: userData.imageUrl || null,
        theme: userData.theme || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newUser[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user in the database
   */
  static async updateUser(userId: string, userData: Partial<UserData>) {
    try {
      const updatedUser = await db
        .update(usersSchema)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(usersSchema.id, userId))
        .returning();

      return updatedUser[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get a user by ID
   */
  static async getUserById(userId: string) {
    try {
      const user = await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.id, userId))
        .limit(1);

      return user[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string) {
    try {
      const user = await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.email, email))
        .limit(1);

      return user[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Delete a user from the database
   */
  static async deleteUser(userId: string) {
    try {
      await db.delete(usersSchema).where(eq(usersSchema.id, userId));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Create or update user (upsert operation)
   * This is useful for handling both sign-up and sign-in events
   */
  static async upsertUser(userData: UserData) {
    try {
      // Check if user exists
      const existingUser = await this.getUserById(userData.id);

      if (existingUser) {
        // Update existing user
        return await this.updateUser(userData.id, userData);
      } else {
        // Create new user
        return await this.createUser(userData);
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }
}
