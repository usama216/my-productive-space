// src/components/book-now-sections/StudentValidation.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Users, GraduationCap } from 'lucide-react'

// Mock student data for validation
const MOCK_STUDENTS = [
  { id: 'STU001', email: 'john.doe@university.edu', name: 'John Doe', status: 'active' },
  { id: 'STU002', email: 'jane.smith@university.edu', name: 'Jane Smith', status: 'active' },
  { id: 'STU003', email: 'mike.johnson@university.edu', name: 'Mike Johnson', status: 'active' },
  { id: 'STU004', email: 'sarah.wilson@university.edu', name: 'Sarah Wilson', status: 'active' },
  { id: 'STU005', email: 'alex.brown@university.edu', name: 'Alex Brown', status: 'suspended' },
]

type StudentValidationStatus = {
  id: string
  studentId: string
  isValidating: boolean
  isValid: boolean
  studentData: any | null
  error: string | null
}

type StudentValidationProps = {
  numberOfStudents: number
  onValidationChange: (allValid: boolean, validatedStudents: StudentValidationStatus[]) => void
}

// Replace this with your Supabase validation logic
const validateStudentAccount = async (studentId: string): Promise<{ success: boolean; student?: any; error?: string }> => {
  await new Promise(res => setTimeout(res, 800 + Math.random() * 400))
  const student = MOCK_STUDENTS.find(s => s.id.toLowerCase() === studentId.toLowerCase() || s.email.toLowerCase() === studentId.toLowerCase())
  if (!student) return { success: false, error: 'Account not found' }
  if (student.status !== 'active') return { success: false, error: 'Account suspended' }
  return { success: true, student }
}

export function StudentValidation({ numberOfStudents, onValidationChange }: StudentValidationProps) {
  const [validations, setValidations] = useState<StudentValidationStatus[]>([])

  useEffect(() => {
    // Adjust slots when number changes
    setValidations(prev => {
      const slots: StudentValidationStatus[] = []
      for (let i = 0; i < numberOfStudents; i++) {
        slots.push(
          prev[i] || { id: `student-${i+1}`, studentId: '', isValidating: false, isValid: false, studentData: null, error: null }
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
    updateSlot(i, { isValidating: true, error: null })
    const res = await validateStudentAccount(slot.studentId.trim())
    updateSlot(i, { isValidating: false, isValid: res.success, studentData: res.student || null, error: res.error || null })
  }

  if (numberOfStudents === 0) return null

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <GraduationCap className="w-5 h-5 mr-2" /> Validate {numberOfStudents} Student{numberOfStudents>1?'s':''}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validations.map((v, i) => (
          <div key={v.id} className="flex items-center space-x-2">
            <Input
              placeholder="ID or Email"
              value={v.studentId}
              onChange={e => updateSlot(i, { studentId: e.target.value, isValid: false, error: null })}
              disabled={v.isValidating || v.isValid}
            />
            <Button onClick={() => handleValidate(i)} disabled={!v.studentId.trim() || v.isValidating || v.isValid}>
              {v.isValidating ? <Loader2 className="animate-spin w-4 h-4" /> : v.isValid ? '✔️' : 'Validate'}
            </Button>
            {v.isValid && <CheckCircle className="text-green-500 w-5 h-5" />}
            {v.error && <XCircle className="text-red-500 w-5 h-5" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
