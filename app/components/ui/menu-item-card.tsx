"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { MenuItem } from "@/lib/services/types"
import { cn } from "@/lib/utils"
import { ShoppingCart, Eye } from "lucide-react"

interface MenuItemCardProps {
  item: MenuItem
  className?: string
}

export function MenuItemCard({ item, className }: MenuItemCardProps) {
  const { addToCartWithMessage, isItemInCart, getItemQuantity } = useCart()

  const itemInCart = isItemInCart(item._id)
  const quantity = getItemQuantity(item._id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative h-[400px] w-full overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg",
        className
      )}
    >
      {/* Image container with fixed height */}
      <div className="relative h-[180px] w-full overflow-hidden">
        <Image
          src={item.image || "https://placekitten.com/400/400"}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-white hover:bg-white/20"
            onClick={() => {/* TODO: Open details modal */}}
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content container with fixed height */}
      <div className="flex h-[220px] flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-lg font-semibold leading-tight">
            {item.name}
          </h3>
          <span className="whitespace-nowrap text-lg font-bold text-primary">
            ${item.price}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        {/* Ingredients list with fixed height and scrolling if needed */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Ingredients:</p>
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {item.ingredients?.slice(0, 3).map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs"
                >
                  {ingredient}
                </span>
              ))}
              {item.ingredients?.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                  +{item.ingredients.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <Button
            className={cn(
              "mt-2 w-full",
              itemInCart && "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
            )}
            onClick={() => addToCartWithMessage(item, 1)}
            variant={itemInCart ? "outline" : "default"}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {itemInCart ? `In Cart (${quantity})` : "Add to Cart"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 