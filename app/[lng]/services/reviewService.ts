const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Review {
    _id: string
    user: {
      _id: string
      name: string
      avatar?: string
    }
    rating: number
    comment: string
    date: string
  }
  
  export interface ReviewListResponse {
    reviews: Review[]
    totalReviews: number
    averageRating: number
  }
  
  export async function getReviewsByMenuItem(menuItemId: string): Promise<ReviewListResponse> {
    try {
      const res = await fetch(`${API_BASE}/review/menuitem/${menuItemId}`)
      const data = await res.json()
      if (data.success && data.data) {
        return {
          reviews: data.data.reviews,
          totalReviews: data.data.totalReviews,
          averageRating: data.data.averageRating,
        }
      }
      return { reviews: [], totalReviews: 0, averageRating: 0 }
    } catch {
      return { reviews: [], totalReviews: 0, averageRating: 0 }
    }
  }
  
  export async function getUserReviews(token: string): Promise<Review[]> {
    try {
      const res = await fetch(`${API_BASE}/review/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success && data.data) {
        return data.data
      }
      return []
    } catch {
      return []
    }
  }
  
  export async function createReview(menuItemId: string, rating: number, comment: string, token: string): Promise<Review | null> {
    try {
      const res = await fetch(`${API_BASE}/review/menuitem/${menuItemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      })
      const data = await res.json()
      if (data.success && data.data) {
        return data.data
      }
      return null
    } catch {
      return null
    }
  }
  
  export async function updateReview(reviewId: string, rating: number, comment: string, token: string): Promise<Review | null> {
    try {
      const res = await fetch(`${API_BASE}/review/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      })
      const data = await res.json()
      if (data.success && data.data) {
        return data.data
      }
      return null
    } catch {
      return null
    }
  }
  
  export async function deleteReview(reviewId: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/review/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      return !!data.success
    } catch {
      return false
    }
  }
  