import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/unauthorized', // Add unauthorized to public routes
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    return supabaseResponse
  }

  // If no user and not a public route, redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // For authenticated routes, verify user has a valid role
  if (!isPublicRoute) {
    try {
      // Check if user exists in customers table
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .single()

      if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking customer:', customerError)
        return supabaseResponse // Allow access if query fails
      }

      // If customer exists, allow access
      if (customer) {
        return supabaseResponse
      }

      // Check if user exists in employees table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', user.id)
        .single()

      if (employeeError && employeeError.code !== 'PGRST116') {
        console.error('Error checking employee:', employeeError)
        return supabaseResponse // Allow access if query fails
      }

      // If employee exists, allow access
      if (employee) {
        return supabaseResponse
      }

      // If user is not in either table, redirect to unauthorized
      const url = request.nextUrl.clone()
      url.pathname = '/auth/unauthorized'
      return NextResponse.redirect(url)
    } catch (error) {
      console.error('Error in role check:', error)
      return supabaseResponse // Allow access if check fails
    }
  }

  return supabaseResponse
}