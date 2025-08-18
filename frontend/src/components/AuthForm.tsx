// src/components/AuthForm.tsx - Updated for client-side auth
"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhoneInput } from 'react-international-phone'
import { PhoneNumberUtil } from 'google-libphonenumber'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

import 'react-international-phone/style.css'

const phoneUtil = PhoneNumberUtil.getInstance()

const isPhoneValid = (phone: string): boolean => {
  try {
    const parsed = phoneUtil.parseAndKeepRawInput(phone, 'SG')
    return phoneUtil.isValidNumber(parsed)
  } catch {
    return false
  }
}

type Props = {
  type: 'login' | 'signUp'
}

export function AuthForm({ type }: Props) {
  const isLoginForm = type === 'login'
  const router = useRouter()
  const { toast } = useToast()
  
  // Form state
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [signupStep, setSignupStep] = useState(1)
  const [phoneTouched, setPhoneTouched] = useState(false)
  
  // hCaptcha
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const hcaptchaRef = useRef<HCaptcha>(null)

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Signup form data
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    memberType: 'professional' as 'student' | 'professional' | 'freelancer',
    acceptedTerms: false
  })

  const resetCaptcha = () => {
    hcaptchaRef.current?.resetCaptcha()
    setCaptchaToken(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the captcha verification",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
        options: {
          captchaToken
        }
      })

      if (error) throw error

      resetCaptcha()
      router.push(`/?toastType=login`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      })
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleBasicSignup = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the captcha verification",
        variant: "destructive",
      })
      return
    }

    // Validation
    if (!signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error", 
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }
    
    if (signupData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }
    
    if (!signupData.acceptedTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      })
      return
    }

    setSignupStep(2)
  }

  const handleFullSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!captchaToken) {
      toast({
        title: "Error",
        description: "Please complete the captcha verification",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!signupData.firstName || !signupData.lastName || !signupData.contactNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!isPhoneValid(signupData.contactNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            contactNumber: signupData.contactNumber,
            memberType: signupData.memberType
          },
          captchaToken
        }
      })

      if (error) throw error

      resetCaptcha()
      router.push(`/?toastType=signUp`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      })
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  if (!isLoginForm && signupStep === 1) {
    // Signup Step 1: Basic Info
    return (
      <form onSubmit={handleBasicSignup}>
        <CardContent className="grid w-full items-center gap-4">
          {/* hCaptcha */}
          <HCaptcha
            ref={hcaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
            onVerify={setCaptchaToken}
            onError={(err) => console.error('hCaptcha error:', err)}
          />

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="accept-terms"
              checked={signupData.acceptedTerms}
              onCheckedChange={(checked) => setSignupData({ ...signupData, acceptedTerms: !!checked })}
              disabled={loading}
            />
            <Label htmlFor="accept-terms" className="text-sm">
              I have read and accept the{' '}
              <Link href="/terms" target="_blank" className="text-orange-600 hover:underline">
                Terms and Conditions
              </Link>
            </Label>
          </div>
        </CardContent>

        <CardFooter className="mt-4 flex flex-col gap-6">
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={loading || !captchaToken}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Continue"}
          </Button>
          
          <p className="text-xs">
            Already have an account?{' '}
            <Link
              href="/login"
              className={`text-blue-500 underline ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    )
  }

  if (!isLoginForm && signupStep === 2) {
    // Signup Step 2: Detailed Info
    return (
      <form onSubmit={handleFullSignup}>
        <CardContent className="grid w-full items-center gap-4">
          {/* hCaptcha */}
          <HCaptcha
            ref={hcaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
            onVerify={setCaptchaToken}
            onError={(err) => console.error('hCaptcha error:', err)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={signupData.firstName}
                onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={signupData.lastName}
                onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={signupData.email}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="contact-number">Contact Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <PhoneInput
                defaultCountry="sg"
                value={signupData.contactNumber}
                onChange={(value) => {
                  setSignupData({ ...signupData, contactNumber: value })
                  setPhoneTouched(true)
                }}
                onFocus={() => setPhoneTouched(true)}
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>
            {phoneTouched && signupData.contactNumber && !isPhoneValid(signupData.contactNumber) && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid phone number.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="member-type">Member Type</Label>
            <Select
              value={signupData.memberType}
              onValueChange={(value: 'student' | 'professional' | 'freelancer') =>
                setSignupData({ ...signupData, memberType: value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="mt-4 flex flex-col gap-6">
          <div className="flex space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSignupStep(1)}
              className="flex-1"
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading || !captchaToken || !isPhoneValid(signupData.contactNumber)}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </Button>
          </div>

          <p className="text-xs">
            Already have an account?{' '}
            <Link
              href="/login"
              className={`text-blue-500 underline ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    )
  }

  // Login Form
  return (
    <form onSubmit={handleLogin}>
      <CardContent className="grid w-full items-center gap-4">
        {/* hCaptcha */}
        <HCaptcha
          ref={hcaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
          onVerify={setCaptchaToken}
          onError={(err) => console.error('hCaptcha error:', err)}
        />

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="pl-10"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="pl-10 pr-10"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* <div className="flex flex-col space-y-1.5">
          <Label htmlFor="user-type">Login As</Label>
          <Select
            value={loginData.userType}
            onValueChange={(value: 'user' | 'admin') => setLoginData({ ...loginData, userType: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={loginData.rememberMe}
            onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: !!checked })}
            disabled={loading}
          />
          <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
        </div>
      </CardContent>

      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600"
          disabled={loading || !captchaToken}
        >
          {loading ? <Loader2 className="animate-spin" /> : "Login"}
        </Button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-orange-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="text-xs">
          Don't have an account yet?{' '}
          <Link
            href="/sign-up"
            className={`text-blue-500 underline ${loading ? "pointer-events-none opacity-50" : ""}`}
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </form>
  )
}