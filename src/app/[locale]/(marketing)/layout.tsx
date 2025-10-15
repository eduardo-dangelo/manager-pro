import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const _t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <>
      <div className=" text-xl [&_p]:my-6">{props.children}</div>
    </>
  );
}
