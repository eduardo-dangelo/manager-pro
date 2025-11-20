import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://www.prisma.io/?via=nextjsboilerplate
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const usersSchema = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  theme: text('theme').notNull().default('system'),
  projectsViewMode: text('projects_view_mode').notNull().default('folder'),
  projectsCardSize: text('projects_card_size').notNull().default('medium'),
  projectsSortBy: text('projects_sort_by').notNull().default('dateModified'),
  hoverSoundEnabled: text('hover_sound_enabled').notNull().default('true'),
});

export const workSpacesSchema = pgTable('work_spaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const projectsSchema = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  color: text('color').notNull().default('gray'),
  status: text('status').notNull().default('active'),
  type: text('type').notNull(),
  tabs: text('tabs').array().notNull().default(['overview']),
});

export const objectivesSchema = pgTable('objectives', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  projectId: integer('project_id').references(() => projectsSchema.id),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  status: text('status').notNull().default('active'),
  priority: text('priority').notNull().default('medium'),
  startDate: timestamp('start_date', { mode: 'date' }),
  dueDate: timestamp('due_date', { mode: 'date' }),
});

export const todosSchema = pgTable('todos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  objectiveId: integer('objective_id').references((): any => objectivesSchema.id),
  projectId: integer('project_id').references((): any => projectsSchema.id),
  parentTaskId: integer('parent_task_id').references((): any => todosSchema.id),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate((): Date => new Date())
    .notNull(),
  status: text('status').notNull().default('todo'),
  dueDate: timestamp('due_date', { mode: 'date' }),
  assigneeId: text('assignee_id').references(() => usersSchema.id),
  priority: text('priority').notNull().default('medium'),
  sprintIds: integer('sprint_ids').array(),
});

export const sprintsSchema = pgTable('sprints', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  userId: text('user_id').references(() => usersSchema.id).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  projectId: integer('project_id').references(() => projectsSchema.id),
  workSpaceId: integer('work_space_id').references(() => workSpacesSchema.id),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  status: text('status').notNull().default('planned'),
});

// Define relationships
export const userRelations = relations(usersSchema, ({ many }) => ({
  projects: many(projectsSchema),
  objectives: many(objectivesSchema),
  createdTodos: many(todosSchema, { relationName: 'createdTodos' }),
  assignedTodos: many(todosSchema, { relationName: 'assignedTodos' }),
  sprints: many(sprintsSchema),
  workSpaces: many(workSpacesSchema),
}));

export const workSpacesRelations = relations(workSpacesSchema, ({ many }) => ({
  users: many(usersSchema),
  projects: many(projectsSchema),
  sprints: many(sprintsSchema),
}));

export const projectsRelations = relations(projectsSchema, ({ many, one }) => ({
  objectives: many(objectivesSchema),
  todos: many(todosSchema),
  sprints: many(sprintsSchema),
  user: one(usersSchema, {
    fields: [projectsSchema.userId],
    references: [usersSchema.id],
  }),
}));

export const objectivesRelations = relations(objectivesSchema, ({ one, many }) => ({
  project: one(projectsSchema, {
    fields: [objectivesSchema.projectId],
    references: [projectsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [objectivesSchema.userId],
    references: [usersSchema.id],
  }),
  todos: many(todosSchema),
}));

export const todosRelations = relations(todosSchema, ({ one, many }) => ({
  objective: one(objectivesSchema, {
    fields: [todosSchema.objectiveId],
    references: [objectivesSchema.id],
  }),
  project: one(projectsSchema, {
    fields: [todosSchema.projectId],
    references: [projectsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [todosSchema.userId],
    references: [usersSchema.id],
    relationName: 'createdTodos',
  }),
  assignee: one(usersSchema, {
    fields: [todosSchema.assigneeId],
    references: [usersSchema.id],
    relationName: 'assignedTodos',
  }),
  parentTodo: one(todosSchema, {
    fields: [todosSchema.parentTaskId],
    references: [todosSchema.id],
    relationName: 'subtodos',
  }),
  subtodos: many(todosSchema, {
    relationName: 'subtodos',
  }),
  sprints: many(sprintsSchema),
}));

export const sprintsRelations = relations(sprintsSchema, ({ many, one }) => ({
  todos: many(todosSchema),
  workSpace: one(workSpacesSchema, {
    fields: [sprintsSchema.workSpaceId],
    references: [workSpacesSchema.id],
  }),
  project: one(projectsSchema, {
    fields: [sprintsSchema.projectId],
    references: [projectsSchema.id],
  }),
  user: one(usersSchema, {
    fields: [sprintsSchema.userId],
    references: [usersSchema.id],
  }),
}));
