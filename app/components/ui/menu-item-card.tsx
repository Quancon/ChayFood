"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCart } from "@/[lng]/hooks/useCart"
import { MenuItem } from "@/lib/services/types"
import { cn } from "@/lib/utils"
import { ShoppingCart, Eye } from "lucide-react"
import { useAuth } from "../../[lng]/context/AuthContext"
import React, { useState } from "react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { useTranslation } from "../../i18n/client"

interface MenuItemCardProps {
  item: MenuItem
  className?: string
  lng: string
}

export function MenuItemCard({ item, className, lng }: MenuItemCardProps) {
  const { addToCartWithMessage, isItemInCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation(lng, 'common');
  const itemInCart = isItemInCart(item._id)
  const quantity = getItemQuantity(item._id)

  const itemName = typeof item.name === 'object' && item.name !== null
    ? (item.name as Record<string, string>)[lng] || (item.name as Record<string, string>).en || ''
    : item.name || '';
  const itemDescription = typeof item.description === 'object' && item.description !== null
    ? (item.description as Record<string, string>)[lng] || (item.description as Record<string, string>).en || ''
    : item.description || '';

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t('menuItemCard.loginPrompt'));
      return;
    }
    setIsLoading(true);
    try {
      await addToCartWithMessage(item, 1);
      toast.success(t('menuItemCard.addedToCart', { itemName: itemName }));
    } catch {
      toast.error(t('menuItemCard.addFail'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col h-full w-full overflow-hidden rounded-2xl border bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-200",
        className
      )}
    >
      {/* Image container */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={item.image || "https://placekitten.com/400/400"}
          alt={itemName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badge spicy/vegetarian */}
        {item.isVegetarian && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {t('menuItemCard.vegetarian')}
          </span>
        )}
        {item.spicyLevel > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
            {Array(item.spicyLevel).fill(0).map((_, i) => (
              <span key={i} className="inline-block w-2 h-2 bg-red-700 rounded-full"></span>
            ))}
            {t('menuItemCard.spicy')}
          </span>
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Link href={`/${lng}/menu/${item._id}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Content container */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="line-clamp-2 flex-1 text-lg font-bold leading-tight text-gray-900">
            {itemName}
          </h3>
          <span className="whitespace-nowrap text-lg font-bold text-primary">
            {item.price.toLocaleString()} VNĐ
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-gray-500 mb-1">
          {itemDescription}
        </p>
        {/* Ingredients list */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.ingredients.slice(0, 3).map((ingredient, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {ingredient}
              </span>
            ))}
            {item.ingredients.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500">
                +{item.ingredients.length - 3} {t('menuItemCard.more')}
              </span>
            )}
          </div>
        )}
        <Button
          id={`add-to-cart-${item._id}`}
          className={cn(
            "mt-auto w-full py-2 text-base font-semibold rounded-lg",
            itemInCart && "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
          )}
          onClick={handleAddToCart}
          variant={itemInCart ? "outline" : "default"}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('menuItemCard.adding')}
            </div>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {itemInCart ? `${t('menuItemCard.inCart')} (${quantity})` : t('menuItemCard.addToCart')}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
} 