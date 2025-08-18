// src/components/admin/UserVerificationModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function UserVerificationModal({
  selectedUser,
  setSelectedUser,
  handleUserVerification,
  isLoading
}) {
  return (
    <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Verification</DialogTitle>
        </DialogHeader>
        {selectedUser && (
          <div className="space-y-4">
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            {selectedUser.memberType === 'student' && (
              <Alert>
                <AlertDescription>
                  Student verification requires document review.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
              <Button variant="destructive" onClick={() => handleUserVerification(selectedUser, 'reject')} disabled={isLoading}>
                Reject
              </Button>
              <Button onClick={() => handleUserVerification(selectedUser, 'verify')} disabled={isLoading}>
                Verify User
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
