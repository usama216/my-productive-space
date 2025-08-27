
// src/app/login/page.tsx
import { AuthForm } from "@/components/AuthForm"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { RecaptchaProvider } from "@/components/captcha/CaptchaProvider"

function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-4">
          <CardTitle className="text-center text-3xl">Login</CardTitle>
          <p className="text-center text-sm text-gray-600">
            Welcome back to CoWork@mps-Kovan
          </p>
        </CardHeader>
          <AuthForm type="login" />
      </Card>
    </div>
  )
}

export default LoginPage