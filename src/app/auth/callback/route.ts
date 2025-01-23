// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function GET(request: NextRequest) {
//   const requestUrl = new URL(request.url)
//   const code = requestUrl.searchParams.get('code')

//   if (code) {
//     const response = NextResponse.next()
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           get(name: string) {
//             return request.cookies.get(name)?.value
//           },
//           set(name: string, value: string, options: CookieOptions) {
//             response.cookies.set({
//               name,
//               value,
//               ...options,
//             })
//           },
//           remove(name: string, options: CookieOptions) {
//             response.cookies.set({
//               name,
//               value: '',
//               ...options,
//             })
//           },
//         },
//       }
//     )

//     const { error } = await supabase.auth.exchangeCodeForSession(code)
    
//     if (!error) {
//       // Get user session
//       const { data: { session } } = await supabase.auth.getSession()
      
//       if (session) {
//         // Check if user is a customer or employee
//         const { data: customer } = await supabase
//           .from('customers')
//           .select()
//           .eq('id', session.user.id)
//           .single()

//         const { data: employee } = await supabase
//           .from('employees')
//           .select()
//           .eq('id', session.user.id)
//           .single()

//         // Redirect based on role
//         if (customer) {
//           return NextResponse.redirect(new URL('/', request.url))
//         } else if (employee) {
//           return NextResponse.redirect(new URL('/dashboard/agent', request.url))
//         } else {
//           // User exists in auth but not in our tables
//           return NextResponse.redirect(new URL('/auth/unauthorized', request.url))
//         }
//       }
//     }
//   }

//   // Return the user to an error page with some instructions
//   return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
// } 