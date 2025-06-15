"use client"

import { useState } from 'react';
import { useApi } from '../../(default)/hooks/useApi';
import { promotionService } from '../../../lib/services';
import { Promotion } from '../../../lib/services/types';
import { PlusIcon, FunnelIcon, TagIcon, BoltIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";

export default function PromotionsAdmin() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Convert UI filter values to API parameters
  const getFilterParams = () => {
    const params: Record<string, unknown> = {
      page,
      limit,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (typeFilter !== 'all') {
      params.promotionType = typeFilter === 'regular' ? 'regular' : 'flash_sale';
    }

    return params;
  };

  const fetchPromotions = async () => {
    const params = getFilterParams();
    return promotionService.getAll(params);
  };

  const { data, loading, error, refetch } = useApi(fetchPromotions, true, [page, statusFilter, typeFilter]);
  
  const promotions = data?.data?.promotions || [];
  const pagination = data?.data?.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleDeleteClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPromotion) return;
    
    try {
      await promotionService.delete(selectedPromotion._id);
      refetch();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const getStatusBadgeColor = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return "bg-gray-200 text-gray-800";
    }
    
    if (now < startDate) {
      return "bg-blue-100 text-blue-800"; // Upcoming
    }
    
    if (now > endDate) {
      return "bg-red-100 text-red-800"; // Expired
    }
    
    return "bg-green-100 text-green-800"; // Active
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return "Inactive";
    }
    
    if (now < startDate) {
      return "Upcoming";
    }
    
    if (now > endDate) {
      return "Expired";
    }
    
    return "Active";
  };

  const isLastPage = pagination.currentPage >= pagination.totalPages;
  const isFirstPage = pagination.currentPage <= 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Promotions Management</h1>
        <Link href="/admin/promotions/create">
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Promotion
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <div className="mt-2 space-y-2 md:space-y-0 md:flex md:space-x-4">
            <div className="w-full md:w-1/3">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="flash_sale">Flash Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <form onSubmit={handleSearch} className="w-full md:w-1/3 flex">
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or code"
                className="flex-1"
              />
              <Button type="submit" variant="outline" className="ml-2">
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading promotions. Please try again.
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No promotions found. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion._id}>
                  <TableCell className="font-medium">
                    {promotion.name}
                  </TableCell>
                  <TableCell className="font-mono">{promotion.code}</TableCell>
                  <TableCell>
                    {promotion.type === 'percentage' 
                      ? `${promotion.value}%` 
                      : `${promotion.value.toLocaleString()} VND`}
                  </TableCell>
                  <TableCell>
                    {promotion.promotionType === 'regular' ? (
                      <span className="flex items-center">
                        <TagIcon className="h-4 w-4 mr-1 text-green-500" />
                        Regular
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <BoltIcon className="h-4 w-4 mr-1 text-amber-500" />
                        Flash Sale
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {promotion.usedCodes} / {promotion.totalCodes}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div>{format(new Date(promotion.startDate), 'dd MMM yyyy')}</div>
                    <div className="text-gray-500 text-xs">to</div>
                    <div>{format(new Date(promotion.endDate), 'dd MMM yyyy')}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(promotion)}>
                      {getPromotionStatus(promotion)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Link href={`/admin/promotions/${promotion._id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/promotions/${promotion._id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(promotion)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {promotions.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-500">
              Showing {promotions.length} of {pagination.totalCount} promotions
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(page - 1)}
                disabled={isFirstPage}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(page + 1)}
                disabled={isLastPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the promotion &quot;{selectedPromotion?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 