// src/app/sign-up/page.tsx  
import { AuthForm } from "@/components/AuthForm"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Sign Up</CardTitle>
          <p className="text-center text-sm text-gray-600">
            Join CoWork@mps-Kovan today
          </p>
        </CardHeader>
        <AuthForm type="signUp" />
      </Card>
    </div>
  )
}

export default SignUpPage