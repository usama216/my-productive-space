// src/components/admin/PromoCodeManagement.tsx - Admin promo code management
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Edit, Trash2, Eye, Calendar, Users, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PromoCode, createPromoCode, updatePromoCode, deletePromoCode, getAllPromoCodes } from '@/lib/promoCodeService'

export function PromoCodeManagement() {
  const { toast } = useToast()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discounttype: 'percentage' as 'percentage' | 'fixed',
    discountvalue: 0,
    minimumamount: 0,
    maximumdiscount: 0,
    maxusageperuser: 1,
    maxtotalusage: 0,
    category: 'GENERAL' as 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL',
    isactive: true,
    activefrom: new Date().toISOString(),
    activeto: null as string | null
  })

  // Load promo codes
  const loadPromoCodes = async () => {
    try {
      setLoading(true)
      const response = await getAllPromoCodes()
      console.log('loadPromoCodes response:', response);
      if (response.success && response.data) {
        console.log('Setting promoCodes:', response.data);
        setPromoCodes(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load promo codes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error in loadPromoCodes:', error);
      toast({
        title: "Error",
        description: "Failed to load promo codes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromoCodes()
  }, [])

  // Filter promo codes
  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || promo.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories from promo codes
  const categories = ['all', ...Array.from(new Set(promoCodes.map(p => p.category)))]

  // Validate form data
  const validateFormData = () => {
    const now = new Date();
    const activeFrom = new Date(formData.activefrom);
    const activeTo = formData.activeto ? new Date(formData.activeto) : null;
    
    // Check if active from is in the future
    if (activeFrom <= now) {
      toast({
        title: "Validation Error",
        description: "Active From date must be in the future",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if active to is before active from
    if (activeTo && activeTo <= activeFrom) {
      toast({
        title: "Validation Error",
        description: "Active Until date must be after Active From date",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    // Validate form data first
    if (!validateFormData()) {
      return;
    }
    
    setIsSubmitting(true)
    
    try {
      if (editingPromo) {
        const response = await updatePromoCode(editingPromo.id, formData)
        console.log('Update response:', response);
        
        // Check if response has success property or if it's a direct success response
        if (response.success || response.message?.includes('success') || response.message?.includes('updated')) {
          toast({
            title: "Success",
            description: "Promo code updated successfully",
          })
          setIsCreateDialogOpen(false)
          setEditingPromo(null)
          resetForm()
          loadPromoCodes()
        } else {
          toast({
            title: "Error",
            description: response.message || response.error || "Failed to update promo code",
            variant: "destructive",
          })
        }
      } else {
        const response = await createPromoCode(formData)
        console.log('Create response:', response);
        
        // Check if response has success property or if it's a direct success response
        if (response.success || response.message?.includes('success') || response.message?.includes('created')) {
          toast({
            title: "Success",
            description: "Promo code created successfully",
          })
          setIsCreateDialogOpen(false)
          setEditingPromo(null)
          resetForm()
          loadPromoCodes()
        } else {
          toast({
            title: "Error",
            description: response.message || response.error || "Failed to create promo code",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await deletePromoCode(id)
      console.log('Delete response:', response);
      
      if (response.success || response.message?.includes('success') || response.message?.includes('deleted')) {
        toast({
          title: "Success",
          description: "Promo code deleted successfully",
        })
        loadPromoCodes()
      } else {
        toast({
          title: "Error",
          description: response.message || response.error || "Failed to delete promo code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      })
    }
  }

  // Handle deactivate (safer alternative to delete)
  const handleDeactivate = async (promo: PromoCode) => {
    try {
      const response = await updatePromoCode(promo.id, { isactive: false })
      console.log('Deactivate response:', response);
      
      if (response.success || response.message?.includes('success') || response.message?.includes('updated')) {
        toast({
          title: "Success",
          description: "Promo code deactivated successfully",
        })
        loadPromoCodes()
      } else {
        toast({
          title: "Error",
          description: response.message || response.error || "Failed to deactivate promo code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Deactivate error:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate promo code",
        variant: "destructive",
      })
    }
  }

  // Handle activate
  const handleActivate = async (promo: PromoCode) => {
    try {
      const response = await updatePromoCode(promo.id, { isactive: true })
      console.log('Activate response:', response);
      
      if (response.success || response.message?.includes('success') || response.message?.includes('updated')) {
        toast({
          title: "Success",
          description: "Promo code activated successfully",
        })
        loadPromoCodes()
      } else {
        toast({
          title: "Error",
          description: response.message || response.error || "Failed to activate promo code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Activate error:', error);
      toast({
        title: "Error",
        description: "Failed to activate promo code",
        variant: "destructive",
      })
    }
  }

  // Handle edit
  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      name: promo.name || '',
      description: promo.description,
      discounttype: promo.discounttype,
      discountvalue: promo.discountvalue,
      minimumamount: promo.minimumamount,
      maximumdiscount: promo.maximumdiscount || 0,
      maxusageperuser: promo.maxusageperuser,
      maxtotalusage: promo.maxtotalusage,
      category: promo.category || 'GENERAL',
      isactive: promo.isactive,
      activefrom: promo.activefrom,
      activeto: promo.activeto || null
    })
    setIsCreateDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Current time + 1 hour
    
    setFormData({
      code: '',
      name: '',
      description: '',
      discounttype: 'percentage' as 'percentage' | 'fixed',
      discountvalue: 0,
      minimumamount: 0,
      maximumdiscount: 0,
      maxusageperuser: 1,
      maxtotalusage: 0,
      category: 'GENERAL' as 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL',
      isactive: true,
      activefrom: oneHourFromNow.toISOString(),
      activeto: null
    })
  }

  // Calculate summary stats
  const totalPromoCodes = promoCodes.length
  const activePromoCodes = promoCodes.filter(p => p.isactive).length
  const totalUsage = promoCodes.reduce((sum, p) => sum + (p.currentusage || 0), 0)

  // Format date for display in local timezone
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry'
    try {
      const date = new Date(dateString);
      // Convert UTC to local timezone
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      
      return localDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short' // This will show the timezone abbreviation
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM) in local timezone
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString);
      // Convert UTC to local timezone for display
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const hours = String(localDate.getHours()).padStart(2, '0');
      const minutes = String(localDate.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promo Code Management</h2>
          <p className="text-gray-600">Manage promotional codes and discounts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPromo(null)
                resetForm()
              }}
              style={{ backgroundColor: '#ff6900' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
                     <DialogContent className="max-w-2xl">
             <DialogHeader>
               <DialogTitle>
                 {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
               </DialogTitle>
               {isSubmitting && (
                 <div className="flex items-center space-x-2 text-sm text-blue-600">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                   <span>Processing...</span>
                 </div>
               )}
             </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Discount"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get 20% off your first booking"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discounttype">Discount Type *</Label>
                  <Select value={formData.discounttype} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discounttype: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountvalue">Discount Value *</Label>
                  <Input
                    id="discountvalue"
                    type="number"
                    value={formData.discountvalue}
                    onChange={(e) => setFormData({ ...formData, discountvalue: parseFloat(e.target.value) || 0 })}
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumamount">Minimum Amount *</Label>
                  <Input
                    id="minimumamount"
                    type="number"
                    value={formData.minimumamount}
                    onChange={(e) => setFormData({ ...formData, minimumamount: parseFloat(e.target.value) || 0 })}
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maximumdiscount">Maximum Discount</Label>
                  <Input
                    id="maximumdiscount"
                    type="number"
                    value={formData.maximumdiscount}
                    onChange={(e) => setFormData({ ...formData, maximumdiscount: parseFloat(e.target.value) || 0 })}
                    placeholder="0 (no limit)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxusageperuser">Max Usage Per User *</Label>
                  <Input
                    id="maxusageperuser"
                    type="number"
                    value={formData.maxusageperuser}
                    onChange={(e) => setFormData({ ...formData, maxusageperuser: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxtotalusage">Max Total Usage</Label>
                  <Input
                    id="maxtotalusage"
                    type="number"
                    value={formData.maxtotalusage}
                    onChange={(e) => setFormData({ ...formData, maxtotalusage: parseInt(e.target.value) || 0 })}
                    placeholder="0 (no limit)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value: 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL') => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="WELCOME">Welcome</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="isactive">Status</Label>
                  <Select value={formData.isactive ? 'true' : 'false'} onValueChange={(value) => setFormData({ ...formData, isactive: value === 'true' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Time Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activefrom">Active From *</Label>
                  <Input
                    id="activefrom"
                    type="datetime-local"
                    value={formatDateForInput(formData.activefrom)}
                                         onChange={(e) => {
                       const selectedDate = e.target.value;
                       if (selectedDate) {
                         // Convert local datetime to UTC ISO string
                         const localDate = new Date(selectedDate);
                         // Add timezone offset to convert local to UTC
                         const utcDate = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));
                         setFormData({ ...formData, activefrom: utcDate.toISOString() });
                       }
                     }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">When the promo code becomes active</p>
                </div>
                <div>
                  <Label htmlFor="activeto">Active Until (Optional)</Label>
                  <Input
                    id="activeto"
                    type="datetime-local"
                    value={formatDateForInput(formData.activeto)}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      if (selectedDate) {
                        // Convert local datetime to ISO string
                        const date = new Date(selectedDate);
                        setFormData({ ...formData, activeto: date.toISOString() });
                      } else {
                        setFormData({ ...formData, activeto: null });
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingPromo(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                                 <Button 
                   type="submit"
                   disabled={isSubmitting}
                   style={{ backgroundColor: '#ff6900' }}
                   className="hover:opacity-90"
                 >
                   {isSubmitting ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       {editingPromo ? 'Updating...' : 'Creating...'}
                     </>
                   ) : (
                     <>{editingPromo ? 'Update' : 'Create'} Promo Code</>
                   )}
                 </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Promo Codes</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{totalPromoCodes}</div>
             <p className="text-xs text-muted-foreground">
               {totalPromoCodes === 0 ? 'No codes yet' : 'Manage your promotions'}
             </p>
           </CardContent>
         </Card>
                 <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Active Promo Codes</CardTitle>
             <Eye className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{activePromoCodes}</div>
             <p className="text-xs text-muted-foreground">
               {activePromoCodes === 0 ? 'No active codes' : `${totalPromoCodes - activePromoCodes} inactive`}
             </p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{totalUsage}</div>
             <p className="text-xs text-muted-foreground">
               {totalUsage === 0 ? 'No usage yet' : 'Across all codes'}
             </p>
           </CardContent>
         </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search promo codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0) + category.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Promo Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes ({filteredPromoCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
                     {loading ? (
             <div className="text-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
               <p className="text-gray-600">Loading promo codes...</p>
             </div>
           ) : filteredPromoCodes.length === 0 ? (
             <div className="text-center py-8">
               <div className="text-gray-400 mb-2">
                 <Search className="h-12 w-12 mx-auto" />
               </div>
               <p className="text-gray-500 text-lg">No promo codes found</p>
               <p className="text-gray-400 text-sm">Try adjusting your search or create a new promo code</p>
             </div>
           ) : (
            <Table>
              <TableHeader>
                                 <TableRow>
                   <TableHead>Code</TableHead>
                   <TableHead>Name</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead>Discount</TableHead>
                   <TableHead>Min Amount</TableHead>
                   <TableHead>Usage</TableHead>
                   <TableHead>Validity</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                                 {filteredPromoCodes.map((promo) => {
                   console.log('Rendering promo in table:', promo);
                   return (
                   <TableRow key={promo.id}>
                     <TableCell>
                       <div>
                         <div className="font-mono font-bold">{promo.code}</div>
                       </div>
                     </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{promo.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{promo.category || 'GENERAL'}</Badge>
                    </TableCell>
                                         <TableCell>
                       <div className="text-sm">
                         <div className="font-medium">
                           {promo.discounttype === 'percentage' ? `${promo.discountvalue}%` : `$${promo.discountvalue}`}
                         </div>
                         {promo.maximumdiscount && promo.maximumdiscount > 0 && (
                           <div className="text-xs text-gray-500">Max: ${promo.maximumdiscount}</div>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="text-sm">
                         ${promo.minimumamount}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="text-sm">
                         <div>{promo.currentusage || 0} / {promo.maxusageperuser}</div>
                         <div className="text-gray-500">
                           {promo.maxtotalusage ? 
                             `Global: ${promo.currentusage || 0} / ${promo.maxtotalusage}` : 
                             'No global limit'
                           }
                         </div>
                                                </div>
                       </TableCell>
                       <TableCell>
                         <div className="text-sm">
                           <div className="font-medium">From: {formatDate(promo.activefrom)}</div>
                           <div className="text-gray-500">To: {formatDate(promo.activeto)}</div>
                         </div>
                       </TableCell>
                                               <TableCell>
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: promo.isactive ? '#ff6900' : '#f3f4f6',
                              color: promo.isactive ? 'white' : '#6b7280',
                              borderColor: promo.isactive ? '#ff6900' : '#d1d5db'
                            }}
                          >
                            {promo.isactive ? "Active" : "Inactive"}
                          </Badge>
                                                     {(() => {
                             const now = new Date();
                             const activeFrom = new Date(promo.activefrom);
                             
                             if (activeFrom > now) {
                               return (
                                 <div className="text-xs text-gray-500 mt-1">
                                   🕐 Starts {formatDate(promo.activefrom)}
                                 </div>
                               );
                             }
                             return null;
                           })()}
                        </TableCell>
                                         <TableCell>
                       <div className="flex items-center gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEdit(promo)}
                           style={{ borderColor: '#ff6900', color: '#ff6900' }}
                           className="hover:bg-orange-50"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         
                                                   {/* Deactivate Button (safer option) */}
                          {promo.isactive && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                  className="hover:bg-amber-50"
                                  title="Deactivate promo code"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deactivate Promo Code</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <div className="space-y-2">
                                      <p>Are you sure you want to deactivate "{promo.code}"?</p>
                                      <p className="text-sm text-amber-600">
                                        ℹ️ <strong>Info:</strong> This will hide the promo code from users but keep all data intact.
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        You can reactivate it later if needed.
                                      </p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeactivate(promo)}
                                    className="bg-amber-600 hover:bg-amber-700"
                                  >
                                    Deactivate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {/* Activate Button for inactive promo codes */}
                          {!promo.isactive && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  style={{ borderColor: '#10b981', color: '#10b981' }}
                                  className="hover:bg-green-50"
                                  title="Activate promo code"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Activate Promo Code</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    <div className="space-y-2">
                                      <p>Are you sure you want to activate "{promo.code}"?</p>
                                      <p className="text-sm text-green-600">
                                        ℹ️ <strong>Info:</strong> This will make the promo code available to users again.
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Make sure the promo code is still valid and not expired.
                                      </p>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleActivate(promo)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Activate
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                         
                         {/* Delete Button (use with caution) */}
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button 
                               variant="outline" 
                               size="sm"
                               style={{ borderColor: '#dc2626', color: '#dc2626' }}
                               className="hover:bg-red-50"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </AlertDialogTrigger>
                                                       <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <div className="space-y-2">
                                    <p>Are you sure you want to delete "{promo.code}"?</p>
                                    <p className="text-sm text-red-600">
                                      ⚠️ <strong>Warning:</strong> This action cannot be undone and may fail if the promo code is in use.
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Consider deactivating it first instead of deleting.
                                    </p>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(promo.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Anyway
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </TableCell>
                   </TableRow>
                 );
                 })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
