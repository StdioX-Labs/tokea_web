'use client';

import { useState } from 'react';
import type { Event, Promotion } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddPromotionModal } from './add-promotion-modal';
import { format } from 'date-fns';

interface ManagePromotionsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: Event | null;
}

export function ManagePromotionsModal({ isOpen, onOpenChange, event }: ManagePromotionsModalProps) {
  const [addPromoModalOpen, setAddPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const handleAddPromotion = () => {
    setEditingPromo(null);
    setAddPromoModalOpen(true);
  };

  const handleEditPromotion = (promo: Promotion) => {
    setEditingPromo(promo);
    setAddPromoModalOpen(true);
  };
  
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="font-headline text-2xl">Manage Promotions</DialogTitle>
              <DialogDescription>For event: {event.name}</DialogDescription>
            </div>
            <Button onClick={handleAddPromotion}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Promotion
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
            {event.promotions && event.promotions.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Batch Name</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Codes</TableHead>
                            <TableHead>Valid Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {event.promotions.map((promo) => (
                        <TableRow key={promo.id}>
                            <TableCell className="font-medium">{promo.codeBatchName}</TableCell>
                            <TableCell>{promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue.toFixed(2)}`}</TableCell>
                            <TableCell>{promo.numberOfCodes}</TableCell>
                            <TableCell>{`${format(new Date(promo.validFrom), 'PP')} - ${format(new Date(promo.validUntil), 'PP')}`}</TableCell>
                            <TableCell>
                                <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>{promo.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditPromotion(promo)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            {promo.status === 'active' ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                                            {promo.status === 'active' ? 'Disable' : 'Enable'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-10 bg-muted rounded-md">
                    <p className="font-semibold">No promotions found for this event.</p>
                    <p className="text-sm text-muted-foreground">Click "Add Promotion" to get started.</p>
                </div>
            )}
        </div>

        <AddPromotionModal 
            isOpen={addPromoModalOpen} 
            onOpenChange={setAddPromoModalOpen} 
            promotion={editingPromo}
        />
      </DialogContent>
    </Dialog>
  );
}
