
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Layers, Warehouse, ArrowLeft } from 'lucide-react';
import Link from 'next/link';


import type { User } from '@supabase/supabase-js';

type InventoryItem = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price_usd: number;
  stock: number;
  features: string;
};

const demoInventory: InventoryItem[] = [
    { id: 1, name: 'Laptop Pro', brand: 'TechBrand', category: 'Laptops', price_usd: 1200.00, stock: 50, features: '16GB RAM, 512GB SSD' },
    { id: 2, name: 'Smartphone X', brand: 'ConnectIt', category: 'Smartphones', price_usd: 800.00, stock: 150, features: '6.5" OLED, 128GB' },
    { id: 3, name: 'Wireless Headphones', brand: 'SoundWave', category: 'Audio', price_usd: 250.00, stock: 300, features: 'Noise Cancelling' },
    { id: 4, name: '4K Monitor', brand: 'ViewMax', category: 'Monitors', price_usd: 600.00, stock: 75, features: '27-inch, IPS Panel' },
    { id: 5, name: 'Mechanical Keyboard', brand: 'TypeFast', category: 'Peripherals', price_usd: 150.00, stock: 200, features: 'RGB Backlight, Red Switches' },
];

const inventorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  price_usd: z.coerce.number().min(0, 'Price must be a positive number'),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive integer'),
  features: z.string().optional(),
});

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const { toast } = useToast();

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
  });

  const dashboardStats = useMemo(() => {
    const totalProducts = inventory.length;
    const totalStockValue = inventory.reduce((sum, item) => sum + item.price_usd * item.stock, 0);
    const uniqueCategories = new Set(inventory.map(item => item.category)).size;
    const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);

    return {
      totalProducts,
      totalStockValue,
      uniqueCategories,
      totalUnits
    };
  }, [inventory]);

  useEffect(() => {
    if (isDemo) {
      setInventory(demoInventory);
      setLoading(false);
    } else {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
              router.push('/login');
            } else {
              setUser(data.user);
            }
        };
        fetchUser();
    }
  }, [router, isDemo]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('makers tech inventory')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch inventory.',
        variant: 'destructive',
      });
    } else {
      setInventory(data as InventoryItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        brand: editingItem.brand,
        category: editingItem.category,
        price_usd: editingItem.price_usd,
        stock: editingItem.stock,
        features: editingItem.features || '',
      });
    } else {
      form.reset({ name: '', brand: '', category: '', price_usd: 0, stock: 0, features: ''});
    }
  }, [editingItem, form]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  }

  const onSubmit = async (values: z.infer<typeof inventorySchema>) => {
    if (isDemo) {
        toast({ title: 'Demo Mode', description: 'Changes are not saved in demo mode.' });
        handleDialogClose();
        // Optionally update state to reflect change in UI
        if (editingItem) {
          setInventory(inventory.map(item => item.id === editingItem.id ? {...editingItem, ...values} : item));
        }
        return;
    }
    if (!editingItem) return;

    const { error } = await supabase
      .from('makers tech inventory')
      .update(values)
      .eq('id', editingItem.id);

    if (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Item updated successfully.',
      });
      handleDialogClose();
      fetchInventory(); // Re-fetch inventory to show updated data
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
       <div className="absolute top-4 left-4">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Link>
        </Button>
      </div>
      <div className="flex justify-end items-center mb-6">
        {!isDemo && <Button onClick={handleLogout}>Logout</Button>}
      </div>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard {isDemo && <span className="text-sm font-normal text-muted-foreground">(Demo)</span>}</h1>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.uniqueCategories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units in Stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUnits.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price (USD)</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">${item.price_usd.toFixed(2)}</TableCell>
                <TableCell className="text-right">{item.stock}</TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        {editingItem && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit: {editingItem.name}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Name</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Brand</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Category</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="price_usd"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Price (USD)</Label>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Stock</Label>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Features</Label>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={handleDialogClose}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
