'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, RefreshCw, MoveUp, MoveDown } from 'lucide-react'
import {
    getAllAnnouncementsAdmin,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    formatAnnouncementDate,
    type Announcement,
    type CreateAnnouncementPayload,
    type UpdateAnnouncementPayload
} from '@/lib/announcementService'

export function AnnouncementManagement() {
    const { toast } = useToast()
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
    const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        order: 0,
        isActive: true
    })

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    const fetchAnnouncements = async () => {
        setIsLoading(true)
        try {
            const response = await getAllAnnouncementsAdmin()
            if (response.success && Array.isArray(response.data)) {
                setAnnouncements(response.data)
            } else {
                toast({
                    title: 'Error',
                    description: response.error || 'Failed to fetch announcements',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch announcements',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenDialog = (announcement?: Announcement) => {
        if (announcement) {
            setEditingAnnouncement(announcement)
            setFormData({
                title: announcement.title,
                description: announcement.description || '',
                imageUrl: announcement.imageUrl || '',
                order: announcement.order,
                isActive: announcement.isActive
            })
        } else {
            setEditingAnnouncement(null)
            setFormData({
                title: '',
                description: '',
                imageUrl: '',
                order: announcements.length + 1,
                isActive: true
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingAnnouncement(null)
        setFormData({
            title: '',
            description: '',
            imageUrl: '',
            order: 0,
            isActive: true
        })
    }

    const handleSaveAnnouncement = async () => {
        if (!formData.title.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Title is required',
                variant: 'destructive',
            })
            return
        }

        setIsSaving(true)
        try {
            let response

            if (editingAnnouncement) {
                // Update existing announcement
                const payload: UpdateAnnouncementPayload = {
                    title: formData.title,
                    description: formData.description || undefined,
                    imageUrl: formData.imageUrl || undefined,
                    order: formData.order,
                    isActive: formData.isActive
                }
                response = await updateAnnouncement(editingAnnouncement.id, payload)
            } else {
                // Create new announcement
                const payload: CreateAnnouncementPayload = {
                    title: formData.title,
                    description: formData.description || undefined,
                    imageUrl: formData.imageUrl || undefined,
                    order: formData.order,
                    isActive: formData.isActive
                }
                response = await createAnnouncement(payload)
            }

            if (response.success) {
                toast({
                    title: 'Success',
                    description: editingAnnouncement
                        ? 'Announcement updated successfully'
                        : 'Announcement created successfully',
                })
                handleCloseDialog()
                fetchAnnouncements()
            } else {
                toast({
                    title: 'Error',
                    description: response.error || 'Failed to save announcement',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save announcement',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteClick = (announcement: Announcement) => {
        setDeletingAnnouncement(announcement)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingAnnouncement) return

        setIsSaving(true)
        try {
            const response = await deleteAnnouncement(deletingAnnouncement.id)

            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Announcement deleted successfully',
                })
                setIsDeleteDialogOpen(false)
                setDeletingAnnouncement(null)
                fetchAnnouncements()
            } else {
                toast({
                    title: 'Error',
                    description: response.error || 'Failed to delete announcement',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete announcement',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleMoveUp = async (announcement: Announcement) => {
        if (announcement.order <= 1) return

        const newOrder = announcement.order - 1
        const response = await updateAnnouncement(announcement.id, { order: newOrder })

        if (response.success) {
            fetchAnnouncements()
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update announcement order',
                variant: 'destructive',
            })
        }
    }

    const handleMoveDown = async (announcement: Announcement) => {
        const newOrder = announcement.order + 1
        const response = await updateAnnouncement(announcement.id, { order: newOrder })

        if (response.success) {
            fetchAnnouncements()
        } else {
            toast({
                title: 'Error',
                description: 'Failed to update announcement order',
                variant: 'destructive',
            })
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Latest Announcements</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchAnnouncements}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button size="sm" onClick={() => handleOpenDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Announcement
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Loading announcements...</span>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500">No announcements found</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog()}
                                className="mt-4"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Announcement
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Order</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[150px]">Updated</TableHead>
                                        <TableHead className="text-right w-[200px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {announcements.map((announcement) => (
                                        <TableRow key={announcement.id}>
                                            <TableCell className="font-medium">{announcement.order}</TableCell>
                                            <TableCell className="font-medium">{announcement.title}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {announcement.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={announcement.isActive ? 'default' : 'secondary'}
                                                    className={
                                                        announcement.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }
                                                >
                                                    {announcement.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-500">
                                                {formatAnnouncementDate(announcement.updatedAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveUp(announcement)}
                                                        disabled={announcement.order <= 1}
                                                        title="Move Up"
                                                    >
                                                        <MoveUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMoveDown(announcement)}
                                                        title="Move Down"
                                                    >
                                                        <MoveDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDialog(announcement)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(announcement)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAnnouncement
                                ? 'Update the announcement details below.'
                                : 'Fill in the details to create a new announcement.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter announcement title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter announcement description (optional)"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="imageUrl" className="text-sm font-medium">
                                Image URL
                            </label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="/mock_img/announcement1.png"
                            />
                            <p className="text-xs text-gray-500">
                                Enter the path to the image (e.g., /mock_img/announcement1.png)
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="order" className="text-sm font-medium">
                                    Display Order
                                </label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="1"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="isActive" className="text-sm font-medium">
                                    Status
                                </label>
                                <select
                                    id="isActive"
                                    value={formData.isActive ? 'active' : 'inactive'}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isActive: e.target.value === 'active' })
                                    }
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAnnouncement} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Announcement</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingAnnouncement?.title}"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setDeletingAnnouncement(null)
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
