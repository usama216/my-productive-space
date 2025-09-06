// src/components/admin/UserVerificationModal.tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye } from 'lucide-react'
import RejectionConfirmationModal from './RejectionConfirmationModal'

interface UserVerificationModalProps {
  selectedUser: any | null
  setSelectedUser: (user: any | null) => void
  handleUserVerification: (user: any, action: 'verify' | 'reject', rejectionReason?: string) => void
  isLoading: boolean
}

export default function UserVerificationModal({
  selectedUser,
  setSelectedUser,
  handleUserVerification,
  isLoading
}: UserVerificationModalProps) {
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  const handleRejectClick = () => {
    setShowRejectionModal(true)
  }

  const handleConfirmRejection = (userId: string, rejectionReason: string) => {
    handleUserVerification(selectedUser, 'reject', rejectionReason)
    setShowRejectionModal(false)
  }

  const handleCloseUserModal = () => {
    setSelectedUser(null)
    setShowRejectionModal(false)
  }

  const handleVerifyClick = () => {
    handleUserVerification(selectedUser, 'verify')
  }

  return (
    <>
      <Dialog open={!!selectedUser && !showRejectionModal} onOpenChange={handleCloseUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Verification Review</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Member Type:</strong> 
                    <Badge className="ml-2 bg-blue-100 text-blue-800 capitalize">
                      {selectedUser.memberType}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p><strong>Join Date:</strong> {new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                  <p><strong>Total Bookings:</strong> {selectedUser.totalBookings}</p>
                  <p><strong>Total Spent:</strong> ${selectedUser.totalSpent}</p>
                </div>
              </div>

              {/* Student Document Section */}
              {selectedUser.memberType === 'student' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Student verification requires manual review of uploaded documents.
                    </AlertDescription>
                  </Alert>
                  
                  {/* Document Preview */}
                  {selectedUser.studentVerificationImageUrl && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-orange-800">Student Verification Document</p>
                            <p className="text-sm text-orange-600">Click to view the uploaded document</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedUser.studentVerificationImageUrl, '_blank')}
                          className="bg-white hover:bg-orange-50 border-orange-300 text-orange-700 hover:text-orange-800"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleCloseUserModal}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectClick}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button 
                  onClick={handleVerifyClick}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Processing...' : 'Verify User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Confirmation Modal */}
      <RejectionConfirmationModal
        isOpen={showRejectionModal}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        onConfirmRejection={handleConfirmRejection}
        isLoading={isLoading}
      />
    </>
  )
}

