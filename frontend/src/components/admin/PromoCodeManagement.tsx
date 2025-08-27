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
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discounttype: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountvalue: 0,
    minimumamount: 0,
    maximumdiscount: 0,
    maxusageperuser: 1,
    maxtotalusage: 0,
    category: 'GENERAL' as 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL',
    isactive: true,
    activefrom: new Date().toISOString(),
    activeto: null as string | null,
    remainingGlobalUses: null as number | null
  })

  // Load promo codes
  const loadPromoCodes = async () => {
    try {
      setLoading(true)
      const response = await getAllPromoCodes()
      if (response.success && response.data) {
        setPromoCodes(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load promo codes",
          variant: "destructive",
        })
      }
    } catch (error) {
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingPromo) {
        const response = await updatePromoCode(editingPromo.id, formData)
        if (response.success) {
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
            description: response.message || "Failed to update promo code",
            variant: "destructive",
          })
        }
      } else {
        const response = await createPromoCode(formData)
        if (response.success) {
          toast({
            title: "Success",
            description: "Promo code created successfully",
          })
          setIsCreateDialogOpen(false)
          resetForm()
          loadPromoCodes()
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to create promo code",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await deletePromoCode(id)
      if (response.success) {
        toast({
          title: "Success",
          description: "Promo code deleted successfully",
        })
        loadPromoCodes()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete promo code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      })
    }
  }

  // Handle edit
  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description,
      discounttype: promo.discounttype,
      discountvalue: promo.discountvalue,
      minimumamount: promo.minimumamount,
      maximumdiscount: promo.maximumdiscount || 0,
      maxusageperuser: promo.maxusageperuser,
      maxtotalusage: promo.maxtotalusage,
      category: promo.category,
      isactive: promo.isactive,
      activefrom: promo.activefrom,
      activeto: promo.activeto,
      remainingGlobalUses: promo.remainingGlobalUses
    })
    setIsCreateDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discounttype: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
      discountvalue: 0,
      minimumamount: 0,
      maximumdiscount: 0,
      maxusageperuser: 1,
      maxtotalusage: 0,
      category: 'GENERAL' as 'STUDENT' | 'WELCOME' | 'MEMBER' | 'GENERAL',
      isactive: true,
      activefrom: new Date().toISOString(),
      activeto: null,
      remainingGlobalUses: null
    })
  }

  // Calculate summary stats
  const totalPromoCodes = promoCodes.length
  const activePromoCodes = promoCodes.filter(p => p.isactive).length
  const totalUsage = promoCodes.reduce((sum, p) => sum + p.currentusage, 0)

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
                  <Select value={formData.discounttype} onValueChange={(value: 'PERCENTAGE' | 'FIXED') => setFormData({ ...formData, discounttype: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
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
                    value={formData.maxusageperuser}
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
                  style={{ backgroundColor: '#ff6900' }}
                  className="hover:opacity-90"
                >
                  {editingPromo ? 'Update' : 'Create'} Promo Code
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promo Codes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromoCodes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
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
            <div className="text-center py-8">Loading...</div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No promo codes found</div>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.map((promo) => (
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
                      <Badge variant="outline">{promo.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {promo.discounttype === 'PERCENTAGE' ? `${promo.discountvalue}%` : `$${promo.discountvalue}`}
                        </div>
                        {promo.maximumdiscount && (
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
                        <div>{promo.currentusage} / {promo.maxusageperuser}</div>
                        <div className="text-gray-500">Uses remaining: {promo.maxusageperuser - promo.currentusage}</div>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Promo Code</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{promo.code}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(promo.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
