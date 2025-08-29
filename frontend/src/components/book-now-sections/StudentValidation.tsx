// src/components/book-now-sections/StudentValidation.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Users, GraduationCap, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Real API response type
export type StudentVerificationResponse = {
  isStudent: boolean
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_FOUND'
  message: string
  email: string
  name: string
}

export type StudentValidationStatus = {
  id: string
  studentId: string
  isValidating: boolean
  isValid: boolean
  studentData: {
    id: string
    email: string
    name: string
    memberType: string
    verifiedAt?: string
  } | null
  error: string | null
}

type StudentValidationProps = {
  numberOfStudents: number
  onValidationChange: (allValid: boolean, validatedStudents: StudentValidationStatus[]) => void
}

// Real API call to validate student
const validateStudentAccount = async (email: string): Promise<StudentVerificationResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/student/check-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
    })

    const data = await response.json()
    return data
             } catch (error) {
         console.error('Student validation error:', error)
         return {
           isStudent: false,
           verificationStatus: 'NOT_FOUND',
           message: 'Network error. Please try again.',
           email: email,
           name: 'Unknown'
         }
       }
}

export function StudentValidation({ numberOfStudents, onValidationChange }: StudentValidationProps) {
  const { toast } = useToast()
  const [validations, setValidations] = useState<StudentValidationStatus[]>([])

  useEffect(() => {
    // Adjust slots when number changes
    setValidations(prev => {
      const slots: StudentValidationStatus[] = []
      for (let i = 0; i < numberOfStudents; i++) {
        slots.push(
          prev[i] || { 
            id: `student-${i+1}`, 
            studentId: '', 
            isValidating: false, 
            isValid: false, 
            studentData: null, 
            error: null 
          }
        )
      }
      return slots
    })
  }, [numberOfStudents])

  useEffect(() => {
    // Notify parent only when slots update
    const allValid = validations.length > 0 && validations.every(v => v.isValid)
    const validList = validations.filter(v => v.isValid)
    onValidationChange(allValid, validList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validations])

  const updateSlot = (i: number, data: Partial<StudentValidationStatus>) => {
    setValidations(prev => prev.map((v, idx) => idx === i ? { ...v, ...data } : v))
  }

  const handleValidate = async (i: number) => {
    const slot = validations[i]
    if (!slot.studentId.trim()) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(slot.studentId.trim())) {
      updateSlot(i, { 
        isValidating: false, 
        isValid: false, 
        error: 'Please enter a valid email address' 
      })
      return
    }

    updateSlot(i, { isValidating: true, error: null })
    
    try {
      const res = await validateStudentAccount(slot.studentId.trim())
      
                      if (res.isStudent && res.verificationStatus === 'VERIFIED') {
         updateSlot(i, { 
           isValidating: false, 
           isValid: true, 
           studentData: {
             id: 'verified',
             email: res.email,
             name: res.name,
             memberType: 'STUDENT',
             verifiedAt: new Date().toISOString()
           }, 
           error: null 
         })
         
         toast({
           title: "Student Validated",
           description: `${res.name} (${res.email}) is a verified student.`,
         })
       } else {
        updateSlot(i, { 
          isValidating: false, 
          isValid: false, 
          studentData: null, 
          error: res.message 
        })
        
        toast({
          title: "Validation Failed",
          description: res.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      updateSlot(i, { 
        isValidating: false, 
        isValid: false, 
        studentData: null, 
        error: 'Validation failed. Please try again.' 
      })
      
      toast({
        title: "Error",
        description: "Failed to validate student. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearValidation = (i: number) => {
    updateSlot(i, { 
      studentId: '', 
      isValidating: false, 
      isValid: false, 
      studentData: null, 
      error: null 
    })
  }

  if (numberOfStudents === 0) return null

     return (
     <Card className="bg-orange-50 border-orange-200">
       <CardHeader>
         <CardTitle className="flex items-center text-orange-800">
           <GraduationCap className="h-5 w-5 mr-2" /> 
           Validate {numberOfStudents} Student{numberOfStudents > 1 ? 's' : ''}
         </CardTitle>
         <p className="text-sm text-orange-600 font-normal">
           Enter student email addresses to verify their student status
         </p>
       </CardHeader>
      <CardContent className="space-y-4">
        {validations.map((v, i) => (
          <div key={v.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter student email address"
                value={v.studentId}
                onChange={e => updateSlot(i, { 
                  studentId: e.target.value, 
                  isValid: false, 
                  error: null 
                })}
                disabled={v.isValidating || v.isValid}
                className="flex-1"
                type="email"
              />
              
                             {!v.isValid ? (
                 <Button 
                   onClick={() => handleValidate(i)} 
                   disabled={!v.studentId.trim() || v.isValidating}
                   size="sm"
                   className="bg-orange-500 hover:bg-orange-600"
                 >
                   {v.isValidating ? (
                     <Loader2 className="animate-spin h-4 w-4" />
                   ) : (
                     'Validate'
                   )}
                 </Button>
              ) : (
                <Button 
                  onClick={() => clearValidation(i)} 
                  variant="outline"
                  size="sm"
                >
                  Change
                </Button>
              )}
            </div>

                         {/* Validation Status */}
             {v.isValid && v.studentData && (
               <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                 <CheckCircle className="text-green-500 h-4 w-4" />
                 <div className="text-sm text-green-800">
                   <div className="font-medium">{v.studentData.name}</div>
                   <div className="text-xs">{v.studentData.email} • {v.studentData.memberType}</div>
                   <div className="text-xs text-green-600">✓ Verified Student</div>
                   {v.studentData.verifiedAt && (
                     <div className="text-xs text-green-600">
                       Verified: {new Date(v.studentData.verifiedAt).toLocaleDateString()}
                     </div>
                   )}
                 </div>
               </div>
             )}

                         {/* Error Message */}
             {v.error && (
               <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                 <XCircle className="text-red-500 h-4 w-4" />
                 <div className="text-sm text-red-800">{v.error}</div>
               </div>
             )}

             {/* Help Text */}
             {!v.studentId && !v.isValid && !v.error && (
               <div className="flex items-center space-x-2 text-xs text-orange-600">
                 <AlertCircle className="h-3 w-3" />
                 <span>Enter the student's email address to verify their status</span>
               </div>
             )}
           </div>
         ))}
       </CardContent>
     </Card>
   )
 }
