"use client"

// Grid Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-200"></div>
        {/* Category badge skeleton */}
        <div className="absolute top-3 left-3 w-20 h-6 bg-gray-300 rounded-full"></div>
        {/* Favorite button skeleton */}
        <div className="absolute top-3 right-3 w-9 h-9 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-5">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Rating and level skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Price and button skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-24 h-6 bg-gray-200 rounded"></div>
          <div className="w-28 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

// List Card Skeleton
export function ProductListSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="flex">
        {/* Image skeleton */}
        <div className="w-48 h-32 bg-gray-200 flex-shrink-0 relative">
          <div className="absolute top-2 left-2 w-16 h-5 bg-gray-300 rounded-md"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            
            {/* Description skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Rating skeleton */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded ml-1"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          
          {/* Price and actions skeleton */}
          <div className="flex items-center justify-between">
            <div className="w-24 h-6 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid of skeletons
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// List of skeletons
export function ProductListSkeletons({ count = 6 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductListSkeleton key={i} />
      ))}
    </div>
  )
}

// Search/Filter skeleton
export function FilterSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-pulse">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Search bar skeleton */}
        <div className="w-full lg:w-2/5">
          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
        </div>
        
        {/* Category filter skeleton */}
        <div className="w-full lg:w-1/5">
          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
        </div>
        
        {/* Sort filter skeleton */}
        <div className="w-full lg:w-1/5">
          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
        </div>
        
        {/* View toggle skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <div className="text-center mb-12 animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4 max-w-2xl mx-auto"></div>
      <div className="h-6 bg-gray-200 rounded mb-8 max-w-xl mx-auto"></div>
      <div className="flex flex-wrap justify-center gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded w-32"></div>
        ))}
      </div>
    </div>
  )
}

// Full page skeleton
export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSkeleton />
      <FilterSkeleton />
      <div className="mb-6">
        <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <ProductGridSkeleton />
    </div>
  )
}

// Modal skeleton
export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col lg:flex-row overflow-hidden max-h-[90vh] animate-pulse">
        {/* Image skeleton */}
        <div className="lg:w-1/2 min-h-[300px] lg:min-h-[500px] bg-gray-200"></div>
        
        {/* Content skeleton */}
        <div className="lg:w-1/2 p-8 flex flex-col">
          <div className="flex-1">
            {/* Title skeleton */}
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
            
            {/* Rating skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Details skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1 w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="w-32 h-8 bg-gray-200 rounded"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-40 h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for backward compatibility
export default function LoadingSkeleton() {
  return <ProductCardSkeleton />
}