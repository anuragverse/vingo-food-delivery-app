import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import FoodCard from '../components/FoodCard';

function Shop() {
    const { shopId } = useParams()
    const [items, setItems] = useState([])
    const [shop, setShop] = useState([])
    const [selectedFoodType, setSelectedFoodType] = useState("all")
    const navigate = useNavigate()

    const handleShop = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true })
            setShop(result.data.shop)
            setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        handleShop()
    }, [shopId])

    const filteredItems = items.filter((item) => {
        if (selectedFoodType === "all") return true
        return item.foodType?.toLowerCase().replace(" ", "-") === selectedFoodType
    })

    return (
        <div className='min-h-screen bg-gray-50'>

            {/* Back Button */}
            <button
                className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-md transition-all duration-300 hover:scale-105'
                onClick={() => navigate("/")}
            >
                <FaArrowLeft />
                <span>Back</span>
            </button>

            {/* Shop Banner */}
            {shop && (
                <div className='relative w-full h-64 md:h-80 lg:h-96 overflow-hidden'>
                    <img
                        src={shop.image}
                        alt=""
                        className='w-full h-full object-cover transition-transform duration-500 hover:scale-105'
                    />

                    <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4'>
                        <FaStore className='text-white text-4xl mb-3 drop-shadow-md' />

                        <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>
                            {shop.name}
                        </h1>

                        <div className='flex items-center gap-[10px] mt-3 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm'>
                            <FaLocationDot size={20} color='red' />
                            <p className='text-sm md:text-base font-medium text-gray-200'>
                                {shop.address}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Section */}
            <div className='max-w-7xl mx-auto px-6 py-10'>
                <div className='flex flex-col items-center gap-3 mb-8'>
                    <h2 className='flex items-center justify-center gap-3 text-3xl font-bold text-gray-800'>
                        <FaUtensils color='red' /> Our Menu
                    </h2>
                    <p className='text-gray-500 text-sm text-center'>
                        Explore delicious items from this shop
                    </p>
                </div>

                {/* Veg / Non-Veg Filter */}
                <div className='flex flex-wrap justify-center gap-3 mb-8'>
                    <button
                        onClick={() => setSelectedFoodType("all")}
                        className={`px-5 py-2 rounded-full border font-medium transition ${
                            selectedFoodType === "all"
                                ? "bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-md"
                                : "bg-white text-gray-700 border-gray-300 hover:border-[#ff4d2d]"
                        }`}
                    >
                        All
                    </button>

                    <button
                        onClick={() => setSelectedFoodType("veg")}
                        className={`px-5 py-2 rounded-full border font-medium transition ${
                            selectedFoodType === "veg"
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                        }`}
                    >
                        Veg
                    </button>

                    <button
                        onClick={() => setSelectedFoodType("non-veg")}
                        className={`px-5 py-2 rounded-full border font-medium transition ${
                            selectedFoodType === "non-veg"
                                ? "bg-red-500 text-white border-red-500 shadow-md"
                                : "bg-white text-gray-700 border-gray-300 hover:border-red-500"
                        }`}
                    >
                        Non-Veg
                    </button>
                </div>

                {/* Items */}
                {filteredItems.length > 0 ? (
                    <div className='flex flex-wrap justify-center gap-8'>
                        {filteredItems.map((item) => (
                            <FoodCard data={item} key={item._id} />
                        ))}
                    </div>
                ) : (
                    <p className='text-center text-gray-500 text-lg'>No Items Available</p>
                )}
            </div>
        </div>
    )
}

export default Shop