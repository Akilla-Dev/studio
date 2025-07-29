
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [router]);

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

  const onSubmit = async (values: z.infer<typeof inventorySchema>) => {
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
      setIsDialogOpen(false);
      setEditingItem(null);
      fetchInventory(); // Re-fetch inventory to show updated data
    }
  };

  if (!user || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>${item.price_usd}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
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
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
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
