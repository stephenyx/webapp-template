import { env } from '@/lib/env';
import { Button, PageHeader, Card, CardContent } from '@repo/ui';

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl">
        <CardContent className="py-8">
          <PageHeader
            title={env.VITE_APP_NAME}
            subtitle="React 19 + Vite + Express + PostgreSQL"
          />
          <div className="mt-4 flex justify-center gap-4">
            <Button
              asChild
              variant="default"
            >
              <a href="/api/health">API Health</a>
            </Button>
            <Button
              asChild
              variant="outline"
            >
              <a href="/api/v1/example/echo">Zod Example</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
