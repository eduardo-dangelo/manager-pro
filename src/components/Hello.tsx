import { currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { UserService } from '@/services/userService';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const user = await currentUser();

  // Sync user with database - creates if doesn't exist, updates if it does
  let dbUser = null;
  if (user) {
    const result = await UserService.upsertUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });
    dbUser = result.user;
  }

  return (
    <>
      <p>
        {`👋 `}
        {t('hello_message', { email: user?.primaryEmailAddress?.emailAddress ?? '' })}
        {t('hello_db_message', { email: dbUser?.email ?? '' })}
      </p>
    </>
  );
};
