import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="text-foreground/80 mb-4">
        Your account exists but is not properly linked to either a customer or employee profile.
        This could happen if:
      </p>
      <ul className="list-disc list-inside mb-6 text-foreground/80">
        <li>Your account was created without selecting a role</li>
        <li>There was an error during account creation</li>
        <li>Your profile was deleted</li>
      </ul>
      <p className="text-foreground/80 mb-6">
        Please try creating a new account with the correct role or contact support for assistance.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href="/auth/register"
          className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 text-center"
        >
          Create New Account
        </Link>
        <Link
          href="/auth/login"
          className="border rounded-md px-4 py-2 text-foreground mb-2 text-center"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
} 