import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      theme: user.theme || 'light',
      projectsViewMode: user.projectsViewMode,
      projectsCardSize: user.projectsCardSize,
      projectsSortBy: user.projectsSortBy,
      hoverSoundEnabled: user.hoverSoundEnabled || 'true',
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme, projectsViewMode, projectsCardSize, projectsSortBy, hoverSoundEnabled } = body;

    // Validate the input
    const validThemes = ['light', 'dark', 'system'];
    const validViewModes = ['folder', 'list', 'columns'];
    const validCardSizes = ['small', 'medium', 'large'];
    const validSortBy = ['dateCreated', 'dateModified', 'name', 'type', 'status'];
    const validHoverSoundEnabled = ['true', 'false'];

    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    if (projectsViewMode && !validViewModes.includes(projectsViewMode)) {
      return NextResponse.json({ error: 'Invalid view mode' }, { status: 400 });
    }

    if (projectsCardSize && !validCardSizes.includes(projectsCardSize)) {
      return NextResponse.json({ error: 'Invalid card size' }, { status: 400 });
    }

    if (projectsSortBy && !validSortBy.includes(projectsSortBy)) {
      return NextResponse.json({ error: 'Invalid sort option' }, { status: 400 });
    }

    if (hoverSoundEnabled && !validHoverSoundEnabled.includes(hoverSoundEnabled)) {
      return NextResponse.json({ error: 'Invalid hover sound enabled value' }, { status: 400 });
    }

    // Update user preferences
    const updateData: any = {};
    if (theme) {
      updateData.theme = theme;
    }
    if (projectsViewMode) {
      updateData.projectsViewMode = projectsViewMode;
    }
    if (projectsCardSize) {
      updateData.projectsCardSize = projectsCardSize;
    }
    if (projectsSortBy) {
      updateData.projectsSortBy = projectsSortBy;
    }
    if (hoverSoundEnabled) {
      updateData.hoverSoundEnabled = hoverSoundEnabled;
    }

    const updatedUser = await UserService.updateUser(userId, updateData);

    return NextResponse.json({
      success: true,
      preferences: {
        theme: updatedUser.theme,
        projectsViewMode: updatedUser.projectsViewMode,
        projectsCardSize: updatedUser.projectsCardSize,
        projectsSortBy: updatedUser.projectsSortBy,
        hoverSoundEnabled: updatedUser.hoverSoundEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
