import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserService } from '@/services/userService';

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectsViewMode, projectsCardSize, projectsSortBy } = body;

    // Validate the input
    const validViewModes = ['folder', 'list', 'columns'];
    const validCardSizes = ['small', 'medium', 'large'];
    const validSortBy = ['dateCreated', 'dateModified', 'name', 'type', 'status'];

    if (projectsViewMode && !validViewModes.includes(projectsViewMode)) {
      return NextResponse.json({ error: 'Invalid view mode' }, { status: 400 });
    }

    if (projectsCardSize && !validCardSizes.includes(projectsCardSize)) {
      return NextResponse.json({ error: 'Invalid card size' }, { status: 400 });
    }

    if (projectsSortBy && !validSortBy.includes(projectsSortBy)) {
      return NextResponse.json({ error: 'Invalid sort option' }, { status: 400 });
    }

    // Update user preferences
    const updateData: any = {};
    if (projectsViewMode) updateData.projectsViewMode = projectsViewMode;
    if (projectsCardSize) updateData.projectsCardSize = projectsCardSize;
    if (projectsSortBy) updateData.projectsSortBy = projectsSortBy;

    const updatedUser = await UserService.updateUser(userId, updateData);

    return NextResponse.json({ 
      success: true, 
      preferences: {
        projectsViewMode: updatedUser.projectsViewMode,
        projectsCardSize: updatedUser.projectsCardSize,
        projectsSortBy: updatedUser.projectsSortBy,
      }
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
