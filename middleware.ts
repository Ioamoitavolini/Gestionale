import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
    const token = (request as any).nextauth?.token;

    // Autorizzazione RBAC per rotte specifiche
    const adminOnlyRoutes = [
      '/api/reports',
      '/api/auth/register',
    ];

    const isAdminRoute = adminOnlyRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isAdminRoute && token?.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Accesso negato' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public endpoints (no auth needed)
        const publicPaths = ['/login', '/register', '/api/auth/register'];
        if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
          return true;
        }

        // Protected: require token
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    // Proteggi dashboard
    '/dashboard/:path*',
    // Proteggi API routes (tranne login/register)
    '/api/:path*',
  ],
};
