import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>Your account is not properly set up</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Your account exists but is not properly linked to either a customer or employee profile. 
          Please contact support or create a new account with the correct role.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/register">Register New Account</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 