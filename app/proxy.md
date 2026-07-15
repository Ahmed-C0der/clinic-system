// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Exact public paths only — /doctors/:id is intentionally NOT included
const PUBLIC_PATHS = ['/', '/about', '/contact', '/services', '/doctors', "/api-docs"]

// كل prefix هنا لازم يتطابق مع الـ role بتاعه
// أي مسار مش موجود هنا بيتفحص فقط إنه مسجل دخول (بدون role check)
const ROLE_ROUTES: { prefix: string; role: string }[] = [
    { prefix: '/dashboard', role: 'patient' },        // (patientProtal)
    { prefix: '/admin-dashboard', role: 'admin' },
    { prefix: '/doctor-dashboard', role: 'doctor' },
    { prefix: '/reception-dashboard', role: 'reception' },
]

interface TokenPayload {
    role: string
    [key: string]: unknown
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next()
    }

    const token = request.cookies.get('access_token')?.value

    if (!token) {
        return redirectToLogin(request, pathname)
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload

        // تحقق من الـ role لو المسار محمي بـ role معين
        const matchedRoute = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix))

        if (matchedRoute && payload.role !== matchedRoute.role) {
            return redirectToUnauthorized(request)
        }

        return NextResponse.next()
    } catch {
        return redirectToLogin(request, pathname)
    }
}

function redirectToLogin(request: NextRequest, pathname: string) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
}

function redirectToUnauthorized(request: NextRequest) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
}

export const config = {

    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}