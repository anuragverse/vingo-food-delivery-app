import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

function EditItem() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { itemId } = useParams()

    const [currentItem, setCurrentItem] = useState(null)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [frontendImage, setFrontendImage] = useState("")
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodType] = useState("")
    const [loading, setLoading] = useState(false)

    const categories = [
        "Snacks",
        "Main Course",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others"
    ]

    const dispatch = useDispatch()

    const handleImage = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handlePriceChange = (e) => {
        const value = e.target.value

        // Allow empty while typing
        if (value === "") {
            setPrice("")
            return
        }

        // Only allow positive values >= 1
        if (Number(value) >= 1) {
            setPrice(value)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name.trim()) {
            alert("Please enter food name")
            return
        }

        if (!category) {
            alert("Please select a category")
            return
        }

        if (!price || Number(price) < 1) {
            alert("Price must be greater than 0")
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)

            if (backendImage) {
                formData.append("image", backendImage)
            }

            const result = await axios.post(
                `${serverUrl}/api/item/edit-item/${itemId}`,
                formData,
                { withCredentials: true }
            )

            dispatch(setMyShopData(result.data))
            navigate("/")
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleGetItemById = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/item/get-by-id/${itemId}`,
                    { withCredentials: true }
                )
                setCurrentItem(result.data)
            } catch (error) {
                console.log(error)
            }
        }

        handleGetItemById()
    }, [itemId])

    useEffect(() => {
        setName(currentItem?.name || "")
        setPrice(currentItem?.price ? String(currentItem.price) : "")
        setCategory(currentItem?.category || "")
        setFoodType(currentItem?.foodType || "veg")
        setFrontendImage(currentItem?.image || "")
    }, [currentItem])

    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'>
            <div
                className='absolute top-[20px] left-[20px] z-[10] mb-[10px] cursor-pointer'
                onClick={() => navigate("/")}
            >
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        Edit Food
                    </div>
                </div>

                <form className='space-y-5' onSubmit={handleSubmit}>
                    {/* Name */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder='Enter Item Name'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                    </div>

                    {/* Food Image */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Food Image
                        </label>
                        <input
                            type="file"
                            accept='image/*'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={handleImage}
                        />

                        {frontendImage && (
                            <div className='mt-4'>
                                <img
                                    src={frontendImage}
                                    alt="Preview"
                                    className='w-full h-48 object-cover rounded-lg border'
                                />
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Price
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder='Enter Price'
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={handlePriceChange}
                            value={price}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Select Category
                        </label>
                        <select
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cate) => (
                                <option value={cate} key={cate}>
                                    {cate}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Food Type */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Select Food Type
                        </label>
                        <select
                            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                            onChange={(e) => setFoodType(e.target.value)}
                            value={foodType}
                        >
                            <option value="veg">veg</option>
                            <option value="non veg">non veg</option>
                        </select>
                    </div>

                    {/* Save Button */}
                    <button
                        className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed'
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color='white' /> : "Save"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditItem