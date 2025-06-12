"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Star, Clock, Info, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { menuService } from "@/lib/services/menuService"
import { MenuItem } from "@/lib/services/types"
import { useCart } from "@/[lng]/hooks/useCart"
import { useAuth } from "@/[lng]/context/AuthContext"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { getReviewsByMenuItem, Review, createReview } from "@/[lng]/services/reviewService"
import { useTranslation } from "../../../i18n/client"

export default function MenuItemDetail() {
  const params = useParams()
  const { id, lng } = params as { id: string, lng: string }
  const [item, setItem] = useState<MenuItem | null>(null)
  const [similarItems, setSimilarItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCartWithMessage, isItemInCart, getItemQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation(lng, "common")

  // State cho reviews
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)

  // State cho form đánh giá
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")

  // Kiểm tra user đã đánh giá chưa
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null
  const userId = user?._id
  const hasReviewed = reviews.some(r => r.user._id === userId)

  // Helper lấy đúng trường string cho name/description
  const itemName = item && typeof item.name === 'object' && item.name !== null
    ? (item.name as Record<string, string>)[lng] || (item.name as Record<string, string>).en || ''
    : item?.name || '';
  const itemDescription = item && typeof item.description === 'object' && item.description !== null
    ? (item.description as Record<string, string>)[lng] || (item.description as Record<string, string>).en || ''
    : item?.description || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Lấy thông tin chi tiết món ăn
        const result = await menuService.getById(id)
        if (result.data) {
          setItem(result.data)
          // Lấy các món ăn tương tự (cùng danh mục)
          if (result.data.category) {
            const similarResult = await menuService.getAll({ 
              category: result.data.category
            })
            if (similarResult.data) {
              const filtered = similarResult.data
                .filter((similarItem: MenuItem) => similarItem._id !== id)
                .slice(0, 4)
              setSimilarItems(filtered)
            }
          }
        }
      } catch {
        toast.error(t("menuItemDetail.loadError"))
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, t])

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true)
      try {
        const data = await getReviewsByMenuItem(id)
        setReviews(data.reviews)
        setTotalReviews(data.totalReviews)
        setAverageRating(data.averageRating)
      } catch {
        setReviews([])
        setTotalReviews(0)
        setAverageRating(0)
      } finally {
        setLoadingReviews(false)
      }
    }
    if (id) fetchReviews()
  }, [id])

  const handleAddToCart = async () => {
    if (!item) return
    
    if (!isAuthenticated) {
      toast.error(t("menuItemDetail.loginPrompt"))
      return
    }
    
    try {
      await addToCartWithMessage(item, quantity)
      toast.success(`${t("menuItemDetail.addedToCart", { count: quantity, itemName: itemName as string })}`)
    } catch {
      toast.error(t("menuItemDetail.addFail"))
    }
  }

  const itemInCart = item && isItemInCart(item._id)
  const cartQuantity = item ? getItemQuantity(item._id) : 0

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    if (!isAuthenticated) {
      toast.error(t("menuItemDetail.reviewLoginPrompt"))
      return
    }
    if (reviewRating === 0) {
      setReviewError(t("menuItemDetail.ratingRequired"))
      return
    }
    setSubmittingReview(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setReviewError(t("menuItemDetail.reviewLoginRequired"))
        setSubmittingReview(false)
        return
      }
      const review = await createReview(item._id, reviewRating, reviewComment, token)
      if (review) {
        setReviews([review, ...reviews])
        setReviewRating(5)
        setReviewComment("")
        setReviewError("")
        toast.success(t("menuItemDetail.reviewSuccess"))
      } else {
        setReviewError(t("menuItemDetail.reviewFailOrExists"))
      }
    } catch {
      toast.error(t("menuItemDetail.reviewSubmitError"))
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!item) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("menuItemDetail.notFound")}</h1>
          <p className="mb-6">{t("menuItemDetail.notFoundDescription")}</p>
          <Link href={`/${lng}/menu`} passHref>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("menuItemDetail.backToMenu")}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb và nút quay lại */}
      <div className="mb-6">
        <Link href={`/${lng}/menu`} passHref>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("menuItemDetail.backToMenu")}
          </Button>
        </Link>
      </div>

      {/* Thông tin chính về món ăn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Hình ảnh món ăn */}
        <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden">
          <Image
            src={item.image || "https://placekitten.com/400/400"}
            alt={itemName as string}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Thông tin chi tiết */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{itemName as string}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({totalReviews} {t("menuItemDetail.reviews")})
                </span>
              </div>
              <Badge variant="outline" className="ml-auto">
                {t(`categories.${item.category}`)}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-primary mb-4">{item.price.toLocaleString()} VNĐ</p>
            <p className="text-gray-700 mb-6">{itemDescription as string}</p>
          </div>

          {/* Thông tin bổ sung */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span>{t("menuItemDetail.prepTime", { time: item.preparationTime })}</span>
            </div>
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-500 mr-2" />
              <span>
                {item.isVegetarian ? t("menuItemDetail.vegetarian") : t("menuItemDetail.notVegetarian")}
              </span>
            </div>
          </div>

          {/* Độ cay */}
          <div className="mb-6">
            <p className="font-medium mb-2">{t("menuItemDetail.spicyLevel")}:</p>
            <div className="flex items-center">
              {[0, 1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-6 h-6 rounded-full mr-1 ${
                    level <= item.spicyLevel
                      ? "bg-red-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {item.spicyLevel === 0 && t("spicyLevels.0")}
                {item.spicyLevel === 1 && t("spicyLevels.1")}
                {item.spicyLevel === 2 && t("spicyLevels.2")}
                {item.spicyLevel === 3 && t("spicyLevels.3")}
              </span>
            </div>
          </div>

          {/* Số lượng và nút thêm vào giỏ hàng */}
          <div className="mt-auto">
            <div className="flex items-center mb-4">
              <p className="font-medium mr-4">{t("menuItemDetail.quantity")}:</p>
              <div className="flex items-center border rounded">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAddToCart}
              variant={itemInCart ? "outline" : "default"}
              disabled={!item.isAvailable}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {!item.isAvailable
                ? t("menuItemDetail.outOfStock")
                : itemInCart
                ? `${t("menuItemDetail.inCart")} (${cartQuantity})`
                : t("menuItemDetail.addToCart")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs cho thông tin dinh dưỡng, thành phần và đánh giá */}
      <Tabs defaultValue="nutrition" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nutrition">{t("menuItemDetail.nutritionTab")}</TabsTrigger>
          <TabsTrigger value="ingredients">{t("menuItemDetail.ingredientsTab")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("menuItemDetail.reviewsTab")}</TabsTrigger>
        </TabsList>
        
        {/* Tab thông tin dinh dưỡng */}
        <TabsContent value="nutrition" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("menuItemDetail.nutritionInfo")}</CardTitle>
              <CardDescription>{t("menuItemDetail.nutritionDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{t("nutrition.calories")}</p>
                  <p className="text-xl font-bold">{item.nutritionInfo.calories}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{t("nutrition.protein")}</p>
                  <p className="text-xl font-bold">{item.nutritionInfo.protein}g</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{t("nutrition.carbs")}</p>
                  <p className="text-xl font-bold">{item.nutritionInfo.carbs}g</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">{t("nutrition.fat")}</p>
                  <p className="text-xl font-bold">{item.nutritionInfo.fat}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab thành phần */}
        <TabsContent value="ingredients" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("menuItemDetail.ingredients")}</CardTitle>
              <CardDescription>{t("menuItemDetail.ingredientsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-medium mb-2">{t("menuItemDetail.ingredients")}:</h3>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {item.allergens && item.allergens.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">{t("menuItemDetail.allergens")}:</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map((allergen, index) => (
                      <Badge key={index} variant="destructive">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab đánh giá */}
        <TabsContent value="reviews" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("menuItemDetail.customerReviews")}</CardTitle>
              <CardDescription>{t("menuItemDetail.reviewsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Form thêm đánh giá */}
              {isAuthenticated && !hasReviewed && (
                <form onSubmit={handleSubmitReview} className="mb-8 p-4 border rounded-lg bg-muted">
                  <div className="mb-2 font-medium">{t("menuItemDetail.yourReview")}:</div>
                  <div className="flex items-center mb-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={star <= reviewRating ? "text-yellow-400" : "text-gray-300"}
                        aria-label={`${t("menuItemDetail.rate")} ${star} ${t("menuItemDetail.stars")}`}
                      >
                        <Star className="h-6 w-6" fill={star <= reviewRating ? "#facc15" : "none"} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm">{reviewRating} {t("menuItemDetail.stars")}</span>
                  </div>
                  <textarea
                    className="w-full border rounded p-2 mb-2"
                    rows={3}
                    placeholder={t("menuItemDetail.reviewPlaceholder")}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    disabled={submittingReview}
                  />
                  {reviewError && <div className="text-red-500 text-sm mb-2">{reviewError}</div>}
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? t("menuItemDetail.submitting") : t("menuItemDetail.submitReview")}
                  </Button>
                </form>
              )}
              {/* Danh sách đánh giá */}
              {loadingReviews ? (
                <div>{t("menuItemDetail.loadingReviews")}</div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-gray-500 py-8">{t("menuItemDetail.noReviews")}</div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="mb-6 border-b pb-4 last:border-0">
                    <div className="flex items-start">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                        {review.user.avatar ? (
                          <Image
                            src={review.user.avatar}
                            alt={review.user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span>{review.user.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{review.user.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="flex my-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div className="border-t pt-4 mt-4">
                <p className="text-center text-sm text-gray-500">
                  {t("menuItemDetail.leaveReviewPrompt")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Các món tương tự */}
      {similarItems.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("menuItemDetail.similarItems")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarItems.map((similarItem) => (
              <Link key={similarItem._id} href={`/${lng}/menu/${similarItem._id}`} passHref>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                  <div className="relative h-[160px] w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={similarItem.image || "https://placekitten.com/400/400"}
                      alt={typeof similarItem.name === 'object' ? (similarItem.name as Record<string, string>)[lng] || (similarItem.name as Record<string, string>).en || '' : similarItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1">{typeof similarItem.name === 'object' ? (similarItem.name as Record<string, string>)[lng] || (similarItem.name as Record<string, string>).en || '' : similarItem.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {typeof similarItem.description === 'object' ? (similarItem.description as Record<string, string>)[lng] || (similarItem.description as Record<string, string>).en || '' : similarItem.description}
                    </p>
                    <p className="font-bold text-primary mt-2">{similarItem.price.toLocaleString()} VNĐ</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <Skeleton className="h-[350px] w-full rounded-lg mb-12" />
      <Skeleton className="h-10 w-1/3 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex flex-col">
            <Skeleton className="h-[160px] w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-full mt-1" />
            <Skeleton className="h-6 w-1/3 mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
} 