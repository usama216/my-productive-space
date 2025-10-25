"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface Package {
  id: string;
  name: string;
  description: string;
  packageType: 'HALF_DAY' | 'FULL_DAY' | 'SEMESTER_BUNDLE';
  targetRole: 'MEMBER' | 'TUTOR' | 'STUDENT';
  price: number;
  originalPrice?: number;
  passCount: number;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hoursAllowed?: number;
}

interface PackageFormData {
  name: string;
  description: string;
  packageType: 'HALF_DAY' | 'FULL_DAY' | 'SEMESTER_BUNDLE';
  targetRole: 'MEMBER' | 'TUTOR' | 'STUDENT';
  price: string;
  originalPrice: string;
  passCount: string;
  validityDays: string;
  isActive: boolean;
  hoursAllowed: string;
}

const PackageManagement: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    packageType: 'HALF_DAY',
    targetRole: 'MEMBER',
    price: '',
    originalPrice: '',
    passCount: '1',
    validityDays: '30',
    isActive: true,
    hoursAllowed: '4'
  });

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://productive-space-backend.vercel.app/api';
      const response = await fetch(`${API_BASE_URL}/admin/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch packages",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check for duplicate package name before submission
      const trimmedName = formData.name.trim().toLowerCase();
      const isDuplicate = packages.some(pkg => {
        // When editing, exclude the current package from duplicate check
        if (editingPackage && pkg.id === editingPackage.id) {
          return false;
        }
        return pkg.name.trim().toLowerCase() === trimmedName;
      });

      if (isDuplicate) {
        toast({
          title: "Duplicate Package Name",
          description: `A package with the name "${formData.name}" already exists. Please use a different name.`,
          variant: "destructive"
        });
        return;
      }

      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        outletFee: 0.00,
        passCount: parseInt(formData.passCount),
        validityDays: parseInt(formData.validityDays),
        hoursAllowed: parseInt(formData.hoursAllowed)
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://productive-space-backend.vercel.app/api';
      const url = editingPackage ? `${API_BASE_URL}/admin/packages/${editingPackage.id}` : `${API_BASE_URL}/admin/packages`;
      const method = editingPackage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingPackage ? "Package updated successfully" : "Package created successfully"
        });
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save package",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive"
      });
    }
  };

  // Handle edit
  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      packageType: pkg.packageType,
      targetRole: pkg.targetRole,
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice?.toString() || '',
      passCount: pkg.passCount.toString(),
      validityDays: pkg.validityDays.toString(),
      isActive: pkg.isActive,
      hoursAllowed: (pkg as any).hoursAllowed?.toString() || '4'
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (packageId: string, force: boolean = false) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://productive-space-backend.vercel.app/api';
      const url = force 
        ? `${API_BASE_URL}/admin/packages/${packageId}?force=true`
        : `${API_BASE_URL}/admin/packages/${packageId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Package deleted successfully"
        });
        fetchPackages();
      } else {
        const errorData = await response.json();
        
        // If error message says to use force=true, show option to force delete
        if (!force && errorData?.message?.includes('force=true')) {
          const confirmForce = window.confirm(
            `Package has existing purchases. Do you want to force delete it?\n\nWarning: This will delete the package even though it has purchases.`
          );
          
          if (confirmForce) {
            await handleDelete(packageId, true); // Await the force delete
          }
          return;
        }
        
        toast({
          title: "Error",
          description: errorData?.message || "Failed to delete package",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive"
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      packageType: 'HALF_DAY',
      targetRole: 'MEMBER',
      price: '',
      originalPrice: '',
      passCount: '1',
      validityDays: '30',
      isActive: true,
      hoursAllowed: '4'
    });
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const getPackageTypeColor = (type: string) => {
    switch (type) {
      case 'HALF_DAY': return 'bg-blue-100 text-blue-800';
      case 'FULL_DAY': return 'bg-green-100 text-green-800';
      case 'SEMESTER_BUNDLE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetRoleColor = (role: string) => {
    switch (role) {
      case 'MEMBER': return 'bg-orange-100 text-orange-800';
      case 'TUTOR': return 'bg-indigo-100 text-indigo-800';
      case 'STUDENT': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Manage count-based packages for your space</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Package List</CardTitle>
          <CardDescription>
            Manage your packages and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-600">Create your first package to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Role</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Pass Count</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          {pkg.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {pkg.description.length > 50 
                                ? `${pkg.description.substring(0, 50)}...` 
                                : pkg.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPackageTypeColor(pkg.packageType)}>
                          {pkg.packageType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTargetRoleColor(pkg.targetRole)}>
                          {pkg.targetRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${pkg.price}</div>
                          {pkg.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              ${pkg.originalPrice}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            +${pkg.outletFee} fee
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{pkg.passCount}</div>
                        <div className="text-xs text-gray-500">packages</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {(pkg as any).hoursAllowed ? `${(pkg as any).hoursAllowed}h` : 'Not set'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{pkg.validityDays} days</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pkg.isActive ? "default" : "secondary"}>
                          {pkg.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pkg)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Package</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pkg.id)}
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
            </div>
          )}
        </CardContent>
      </Card>


      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
            <DialogDescription>
              Create a new count-based package for your space
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Half Day Pass"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type *</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value: 'HALF_DAY' | 'FULL_DAY' | 'SEMESTER_BUNDLE') =>
                    setFormData({ ...formData, packageType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HALF_DAY">Half Day</SelectItem>
                    <SelectItem value="FULL_DAY">Full Day</SelectItem>
                    <SelectItem value="SEMESTER_BUNDLE">Semester Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Package description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role *</Label>
                <Select
                  value={formData.targetRole}
                  onValueChange={(value: 'MEMBER' | 'TUTOR' | 'STUDENT') =>
                    setFormData({ ...formData, targetRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TUTOR">Tutor</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passCount">Pass Count *</Label>
                <Input
                  id="passCount"
                  type="number"
                  min="1"
                  value={formData.passCount}
                  onChange={(e) => setFormData({ ...formData, passCount: e.target.value })}
                  placeholder="Number of packages"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validityDays">Validity Days</Label>
              <Input
                id="validityDays"
                type="number"
                min="1"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursAllowed">Hours Allowed</Label>
              <Input
                id="hoursAllowed"
                type="number"
                min="1"
                max="24"
                value={formData.hoursAllowed}
                onChange={(e) => setFormData({ ...formData, hoursAllowed: e.target.value })}
                placeholder="4"
                required
              />
              <p className="text-xs text-gray-500">Number of hours this package allows</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Package</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Package</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update the package details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Package Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Half Day Pass"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-packageType">Package Type *</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value: 'HALF_DAY' | 'FULL_DAY' | 'SEMESTER_BUNDLE') =>
                    setFormData({ ...formData, packageType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HALF_DAY">Half Day</SelectItem>
                    <SelectItem value="FULL_DAY">Full Day</SelectItem>
                    <SelectItem value="SEMESTER_BUNDLE">Semester Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Package description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetRole">Target Role *</Label>
                <Select
                  value={formData.targetRole}
                  onValueChange={(value: 'MEMBER' | 'TUTOR' | 'STUDENT') =>
                    setFormData({ ...formData, targetRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TUTOR">Tutor</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-passCount">Pass Count *</Label>
                <Input
                  id="edit-passCount"
                  type="number"
                  min="1"
                  value={formData.passCount}
                  onChange={(e) => setFormData({ ...formData, passCount: e.target.value })}
                  placeholder="Number of packages"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-originalPrice">Original Price</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-validityDays">Validity Days</Label>
              <Input
                id="edit-validityDays"
                type="number"
                min="1"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-hoursAllowed">Hours Allowed</Label>
              <Input
                id="edit-hoursAllowed"
                type="number"
                min="1"
                max="24"
                value={formData.hoursAllowed}
                onChange={(e) => setFormData({ ...formData, hoursAllowed: e.target.value })}
                placeholder="4"
                required
              />
              <p className="text-xs text-gray-500">Number of hours this package allows</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Active Package</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Package</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;
