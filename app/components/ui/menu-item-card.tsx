"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { MenuItem } from "@/lib/services/types"
import { cn } from "@/lib/utils"
import { ShoppingCart, Eye } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import React, { useState } from "react"
import { toast } from "react-hot-toast"
import Link from "next/link"

interface MenuItemCardProps {
  item: MenuItem
  className?: string
}

export function MenuItemCard({ item, className }: MenuItemCardProps) {
  const { addToCartWithMessage, isItemInCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const itemInCart = isItemInCart(item._id)
  const quantity = getItemQuantity(item._id)

  const handleAddToCart = async () => {
    console.log("handleAddToCart called", { isAuthenticated, item });
    
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Thêm vào giỏ và hiển thị thông báo
      await addToCartWithMessage(item, 1);
      toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
      
      // Tạo hiệu ứng nhấp nháy khi thêm sản phẩm đã có
      if (itemInCart) {
        const button = document.getElementById(`add-to-cart-${item._id}`);
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => {
            button.classList.remove('animate-pulse');
          }, 1000);
        }
      }
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  }

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
          <Link href={`/menu/${item._id}`} passHref>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-white hover:bg-white/20"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content container with fixed height */}
      <div className="flex h-[220px] flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-lg font-semibold leading-tight">
            {item.name}
          </h3>
          <span className="whitespace-nowrap text-lg font-bold text-primary">
            {item.price} VNĐ
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
            id={`add-to-cart-${item._id}`}
            className={cn(
              "mt-2 w-full",
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
                Đang thêm...
              </div>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {itemInCart ? `Trong giỏ (${quantity})` : "Thêm vào giỏ"}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 