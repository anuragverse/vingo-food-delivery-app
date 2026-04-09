import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)

  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()

  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)

  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedFoodType, setSelectedFoodType] = useState("all")

  const handleFilterByCategory = (category) => {
    setSelectedCategory(category)
  }

  const handleFoodTypeFilter = (type) => {
    setSelectedFoodType(type)
  }

  useEffect(() => {
    let filteredItems = [...(itemsInMyCity || [])]

    if (selectedCategory !== "All") {
      filteredItems = filteredItems.filter(item => item.category === selectedCategory)
    }

    if (selectedFoodType !== "all") {
      filteredItems = filteredItems.filter(item =>
        item.foodType?.toLowerCase().replace(" ", "-") === selectedFoodType
      )
    }

    setUpdatedItemsList(filteredItems)
  }, [itemsInMyCity, selectedCategory, selectedFoodType])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    const cateElement = cateScrollRef.current
    const shopElement = shopScrollRef.current

    const handleCateScroll = () => {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    }

    const handleShopScroll = () => {
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    }

    if (cateElement && shopElement) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

      cateElement.addEventListener("scroll", handleCateScroll)
      shopElement.addEventListener("scroll", handleShopScroll)
    }

    return () => {
      cateElement?.removeEventListener("scroll", handleCateScroll)
      shopElement?.removeEventListener("scroll", handleShopScroll)
    }
  }, [])

  return (
    <div className='w-screen min-h-screen flex flex-col gap-8 items-center bg-[#fff9f6] overflow-y-auto pb-10'>
      <Nav />

      {/* Search Results */}
      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-6 bg-white shadow-md rounded-3xl mt-4'>
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-bold border-b border-gray-200 pb-2 w-full'>
            Search Results
          </h1>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start px-4">
        <div className='flex flex-col gap-1'>
          <h1 className='text-gray-900 text-3xl font-bold'>Explore Categories</h1>
          <p className='text-gray-500 text-sm'>Pick what you're craving today</p>
        </div>

        <div className='w-full relative'>
          {showLeftCateButton && (
            <button
              className='absolute left-0 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:bg-[#fff0eb] z-10'
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div className='w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={cateScrollRef}>
            {categories.map((cate, index) => (
              <div
                key={index}
                className={`rounded-2xl transition-all ${
                  selectedCategory === cate.category ? "ring-2 ring-[#ff4d2d]" : ""
                }`}
              >
                <CategoryCard
                  name={cate.category}
                  image={cate.image}
                  onClick={() => handleFilterByCategory(cate.category)}
                />
              </div>
            ))}
          </div>

          {showRightCateButton && (
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:bg-[#fff0eb] z-10'
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      {/* Shops */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start px-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-gray-900 text-3xl font-bold'>Best Shops in {currentCity}</h1>
          <p className='text-gray-500 text-sm'>Popular picks around your city</p>
        </div>

        <div className='w-full relative'>
          {showLeftShopButton && (
            <button
              className='absolute left-0 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:bg-[#fff0eb] z-10'
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div className='w-full flex overflow-x-auto gap-4 pb-2 scrollbar-hide' ref={shopScrollRef}>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard
                name={shop.name}
                image={shop.image}
                key={index}
                onClick={() => navigate(`/shop/${shop._id}`)}
              />
            ))}
          </div>

          {showRightShopButton && (
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] p-2 rounded-full shadow-lg hover:bg-[#fff0eb] z-10'
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Items */}
      <div className='w-full max-w-6xl flex flex-col gap-6 items-start px-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-gray-900 text-3xl font-bold'>Suggested Food Items</h1>
          <p className='text-gray-500 text-sm'>Fresh picks curated for you</p>
        </div>

        {/* Filter Chips */}
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={() => handleFoodTypeFilter("all")}
            className={`px-5 py-2 rounded-full border font-medium transition ${
              selectedFoodType === "all"
                ? "bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#ff4d2d]"
            }`}
          >
            All
          </button>

          <button
            onClick={() => handleFoodTypeFilter("veg")}
            className={`px-5 py-2 rounded-full border font-medium transition ${
              selectedFoodType === "veg"
                ? "bg-green-500 text-white border-green-500 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
            }`}
          >
            Veg
          </button>

          <button
            onClick={() => handleFoodTypeFilter("non-veg")}
            className={`px-5 py-2 rounded-full border font-medium transition ${
              selectedFoodType === "non-veg"
                ? "bg-red-500 text-white border-red-500 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-red-500"
            }`}
          >
            Non-Veg
          </button>
        </div>

        <div className='w-full h-auto flex flex-wrap gap-[24px] justify-center'>
          {updatedItemsList?.length > 0 ? (
            updatedItemsList.map((item, index) => (
              <FoodCard key={index} data={item} />
            ))
          ) : (
            <div className='w-full flex justify-center py-12'>
              <div className='bg-white px-8 py-6 rounded-2xl shadow text-center'>
                <h2 className='text-xl font-semibold text-gray-800'>No food items found</h2>
                <p className='text-gray-500 text-sm mt-2'>
                  Try another category or food type filter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard