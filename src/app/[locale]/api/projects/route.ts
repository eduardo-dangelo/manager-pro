import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { ProjectService } from '@/services/projectService';
import { ProjectValidation } from '@/validations/ProjectValidation';

export const GET = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await ProjectService.getProjectsByUserId(user.id);

    return NextResponse.json({ projects });
  } catch (error) {
    logger.error(`Error fetching projects: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Full fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user with database to ensure userId foreign key constraint is satisfied
    const { UserService } = await import('@/services/userService');
    await UserService.upsertUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });

    const json = await request.json();
    const parse = ProjectValidation.safeParse(json);
    console.error('parse', parse);
    console.error('json', json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const project = await ProjectService.createProject(parse.data, user.id);

    if (!project) {
      throw new Error('Failed to create project - no project returned');
    }

    logger.info('Project has been created', { projectId: project.id });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logger.error(`Error creating project: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Full error details:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
};
