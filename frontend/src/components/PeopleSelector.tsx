// src/components/PeopleSelector.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
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
  showBreakdown?: boolean
  onBreakdownChange?: (breakdown: UserCounts & { total: number }) => void
}

export function PeopleSelector({
  min = 1,
  max = 15,
  step = 1,
  value: controlledValue,
  onChange,
  showBreakdown = false,
  onBreakdownChange,
}: PeopleSelectorProps) {
  // 🔑 Stable storage key
  const componentKey = `people-selector`

  // Load breakdown from localStorage or use default
  const getInitialBreakdown = (): UserCounts => {
    if (typeof window === 'undefined') {
      return {
        coWorkers: min,
        coTutors: 0,
        coStudents: 0,
      }
    }

    const saved = localStorage.getItem(componentKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (
          parsed &&
          typeof parsed.coWorkers === 'number' &&
          typeof parsed.coTutors === 'number' &&
          typeof parsed.coStudents === 'number'
        ) {
          return parsed
        }
      } catch (e) {
        console.log('Failed to parse saved breakdown:', e)
      }
    }

    return {
      coWorkers: min,
      coTutors: 0,
      coStudents: 0,
    }
  }

  const [breakdown, setBreakdown] = useState<UserCounts>(getInitialBreakdown)

  // Save breakdown to localStorage whenever it changes
  const saveBreakdown = (newBreakdown: UserCounts) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(componentKey, JSON.stringify(newBreakdown))
    }
  }

  // Track if we've already sent the initial breakdown to parent
  const hasNotifiedParent = useRef(false)

  const total = breakdown.coWorkers + breakdown.coTutors + breakdown.coStudents

  // Notify parent only once when component mounts
  useEffect(() => {
    if (!hasNotifiedParent.current && onBreakdownChange) {
      hasNotifiedParent.current = true
      onBreakdownChange({ ...breakdown, total })
    }
  }, []) // Empty dependency array - only run once

  const update = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal))
    const newBreakdown = {
      coWorkers: clamped,
      coTutors: 0,
      coStudents: 0,
    }

    setBreakdown(newBreakdown)
    saveBreakdown(newBreakdown)

    if (!showBreakdown) {
      onChange?.(clamped)
    }
  }

  const updateBreakdown = (type: keyof UserCounts, newVal: number) => {
    const clamped = Math.max(0, newVal)
    const newBreakdown = { ...breakdown, [type]: clamped }

    // Ensure at least one person
    const newTotal =
      newBreakdown.coWorkers + newBreakdown.coTutors + newBreakdown.coStudents
    if (newTotal === 0) {
      newBreakdown.coWorkers = 1
    }

    // Ensure we don't exceed max
    const finalTotal =
      newBreakdown.coWorkers + newBreakdown.coTutors + newBreakdown.coStudents
    if (finalTotal <= max && finalTotal >= min) {
      setBreakdown(newBreakdown)
      saveBreakdown(newBreakdown)

      // Notify parent
      onChange?.(finalTotal)
      onBreakdownChange?.({ ...newBreakdown, total: finalTotal })
    }
  }

  const getUserTypeIcon = (type: keyof UserCounts) => {
    switch (type) {
      case 'coWorkers':
        return '💼'
      case 'coTutors':
        return '👩‍🏫'
      case 'coStudents':
        return '🎓'
      default:
        return '👤'
    }
  }

  const getUserTypeLabel = (type: keyof UserCounts) => {
    switch (type) {
      case 'coWorkers':
        return 'Co-Workers'
      case 'coTutors':
        return 'Co-Tutors'
      case 'coStudents':
        return 'Co-Students'
      default:
        return 'Users'
    }
  }

  if (!showBreakdown) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Total People</Label>
          <div className="inline-flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => update(breakdown.coWorkers - step)}
              disabled={breakdown.coWorkers - step < min}
            >
              –
            </Button>
            <span className="w-8 text-center font-medium">
              {breakdown.coWorkers}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => update(breakdown.coWorkers + step)}
              disabled={breakdown.coWorkers + step > max}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 min-w-[280px]">
      {/* Total Count Display */}
      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <Label className="font-semibold text-orange-800">Total People</Label>
        </div>
        <div className="text-xl font-bold text-orange-800">{total}</div>
      </div>

      <Separator />

      {/* Breakdown by User Type */}
      <div className="space-y-3">
        {(Object.keys(breakdown) as Array<keyof UserCounts>).map((type) => (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{getUserTypeIcon(type)}</span>
              <Label className="text-sm font-medium">
                {getUserTypeLabel(type)}
              </Label>
            </div>
            <div className="inline-flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateBreakdown(type, breakdown[type] - 1)}
                disabled={
                  breakdown[type] === 0 ||
                  (total === 1 && breakdown[type] === 1)
                }
                className="h-8 w-8 p-0"
              >
                –
              </Button>
              <span className="w-8 text-center font-medium">
                {breakdown[type]}
              </span>
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
        <p>• Your selection is saved automatically</p>
      </div>
    </div>
  )
}
