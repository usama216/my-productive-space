// src/components/PeopleSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type UserCounts = {
  coWorkers: number
  coTutors: number
  coStudents: number
}

type PeopleSelectorProps = {
  min?: number
  max?: number
  step?: number
  value?: number
  onChange?: (newVal: number) => void
  // New props for detailed breakdown
  showBreakdown?: boolean
  onBreakdownChange?: (breakdown: UserCounts & { total: number }) => void
}

export function PeopleSelector({
  min = 1,
  max = 20,
  step = 1,
  value: controlledValue,
  onChange,
  showBreakdown = false,
  onBreakdownChange,
}: PeopleSelectorProps) {
  const [uncontrolled, setUncontrolled] = useState(min)
  const [breakdown, setBreakdown] = useState<UserCounts>({
    coWorkers: 1,
    coTutors: 0,
    coStudents: 0
  })



  const value = controlledValue ?? uncontrolled
  const total = breakdown.coWorkers + breakdown.coTutors + breakdown.coStudents

// Update total when breakdown changes
  useEffect(() => {
    if (showBreakdown) {
      const newTotal = breakdown.coWorkers + breakdown.coTutors + breakdown.coStudents
      const clamped = Math.max(min, Math.min(max, newTotal))
      
      if (controlledValue == null) setUncontrolled(clamped)
      onChange?.(clamped)
      // Only call onBreakdownChange if the total actually changed
      if (newTotal !== value) {
        onBreakdownChange?.({ ...breakdown, total: clamped })
      }
    }
  }, [breakdown, showBreakdown, min, max]) // Remove onChange and onBreakdownChange from dependencies

  const update = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal))
    if (controlledValue == null) setUncontrolled(clamped)
    onChange?.(clamped)
  }

  const updateBreakdown = (type: keyof UserCounts, newVal: number) => {
    const clamped = Math.max(0, newVal)
    const newBreakdown = { ...breakdown, [type]: clamped }
    
    // Ensure at least one person
    const newTotal = newBreakdown.coWorkers + newBreakdown.coTutors + newBreakdown.coStudents
    if (newTotal === 0) {
      newBreakdown.coWorkers = 1
    }
    
    // Ensure we don't exceed max
    const finalTotal = newBreakdown.coWorkers + newBreakdown.coTutors + newBreakdown.coStudents
    if (finalTotal <= max) {
      setBreakdown(newBreakdown)
    }
  }

  const getUserTypeIcon = (type: keyof UserCounts) => {
    switch (type) {
      case 'coWorkers': return '💼'
      case 'coTutors': return '👩‍🏫'
      case 'coStudents': return '🎓'
      default: return '👤'
    }
  }

  const getUserTypeLabel = (type: keyof UserCounts) => {
    switch (type) {
      case 'coWorkers': return 'Co-Workers'
      case 'coTutors': return 'Co-Tutors'
      case 'coStudents': return 'Co-Students'
      default: return 'Users'
    }
  }

  if (!showBreakdown) {
    // Simple mode - original functionality
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Total People</Label>
          <div className="inline-flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => update(value - step)}
              disabled={value - step < min}
            >
              –
            </Button>
            <span className="w-8 text-center font-medium">{value}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => update(value + step)}
              disabled={value + step > max}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced mode with breakdown
  return (
    <div className="space-y-4 min-w-[280px]">
      {/* Total Count Display */}
      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <Label className="font-semibold text-orange-800">Total People</Label>
        </div>
        <div className="text-xl font-bold text-orange-800">
          {total}
        </div>
      </div>

      <Separator />

      {/* Breakdown by User Type */}
      <div className="space-y-3">
        {(Object.keys(breakdown) as Array<keyof UserCounts>).map((type) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{getUserTypeIcon(type)}</span>
              <Label className="text-sm font-medium">{getUserTypeLabel(type)}</Label>
            </div>
            <div className="inline-flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateBreakdown(type, breakdown[type] - 1)}
                disabled={breakdown[type] === 0 || (total === 1 && breakdown[type] === 1)}
                className="h-8 w-8 p-0"
              >
                –
              </Button>
              <span className="w-8 text-center font-medium">{breakdown[type]}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateBreakdown(type, breakdown[type] + 1)}
                disabled={total >= max}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        <p>• At least one person is required</p>
        <p>• Maximum {max} people total</p>
      </div>
    </div>
  )
}