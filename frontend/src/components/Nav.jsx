import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

function Nav() {
    const { userData, currentCity, cartItems, unreadOrderCount } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)

    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
            dispatch(setSearchItems(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (query) {
            handleSearchItems()
        } else {
            dispatch(setSearchItems(null))
        }
    }, [query])

    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6]/95 backdrop-blur-sm overflow-visible border-b border-[#ffe5de]'>

            {showSearch && userData.role === "user" && (
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-xl items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden animate-[fadeIn_0.2s_ease-in-out]'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-300'>
                        <FaLocationDot size={25} className="text-[#ff4d2d]" />
                        <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
                    </div>
                    <div className='w-[80%] flex items-center gap-[10px]'>
                        <IoIosSearch size={25} className='text-[#ff4d2d]' />
                        <input
                            type="text"
                            placeholder='search delicious food...'
                            className='px-[10px] text-gray-700 outline-0 w-full bg-transparent'
                            onChange={(e) => setQuery(e.target.value)}
                            value={query}
                        />
                    </div>
                </div>
            )}

            {/* Logo */}
            <h1
                className='text-3xl font-bold mb-2 text-[#ff4d2d] cursor-pointer transition-transform duration-200 hover:scale-105'
                onClick={() => navigate("/")}
            >
                Delicious
            </h1>

            {/* Desktop Search */}
            {userData.role === "user" && (
                <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-xl items-center gap-[20px] hidden md:flex border border-transparent hover:border-[#ffd4c9]'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-300'>
                        <FaLocationDot size={25} className="text-[#ff4d2d]" />
                        <div className='w-[80%] truncate text-gray-600'>{currentCity}</div>
                    </div>
                    <div className='w-[80%] flex items-center gap-[10px]'>
                        <IoIosSearch size={25} className='text-[#ff4d2d]' />
                        <input
                            type="text"
                            placeholder='search delicious food...'
                            className='px-[10px] text-gray-700 outline-0 w-full bg-transparent'
                            onChange={(e) => setQuery(e.target.value)}
                            value={query}
                        />
                    </div>
                </div>
            )}

            {/* Right Actions */}
            <div className='flex items-center gap-4'>

                {/* Mobile Search */}
                {userData.role === "user" && (
                    showSearch
                        ? <RxCross2 size={25} className='text-[#ff4d2d] md:hidden cursor-pointer transition-transform duration-200 hover:rotate-90 hover:scale-110' onClick={() => setShowSearch(false)} />
                        : <IoIosSearch size={25} className='text-[#ff4d2d] md:hidden cursor-pointer transition-transform duration-200 hover:scale-110' onClick={() => setShowSearch(true)} />
                )}

                {/* Owner UI */}
                {userData.role === "owner" ? (
                    <>
                        {myShopData && (
                            <>
                                <button
                                    className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'
                                    onClick={() => navigate("/add-item")}
                                >
                                    <FaPlus size={20} />
                                    <span>Add Food Item</span>
                                </button>

                                <button
                                    className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'
                                    onClick={() => navigate("/add-item")}
                                >
                                    <FaPlus size={20} />
                                </button>
                            </>
                        )}

                        <div
                            className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'
                            onClick={() => navigate("/my-orders")}
                        >
                            <TbReceipt2 size={20} />
                            <span>My Orders</span>

                            {unreadOrderCount > 0 && (
                                <span className='absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold shadow'>
                                    {unreadOrderCount}
                                </span>
                            )}
                        </div>

                        <div
                            className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'
                            onClick={() => navigate("/my-orders")}
                        >
                            <TbReceipt2 size={20} />

                            {unreadOrderCount > 0 && (
                                <span className='absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shadow'>
                                    {unreadOrderCount}
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {userData.role === "user" && (
                            <div
                                className='relative cursor-pointer transition-transform duration-200 hover:scale-110'
                                onClick={() => navigate("/cart")}
                            >
                                <FiShoppingCart size={25} className='text-[#ff4d2d]' />
                                <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d] font-semibold'>
                                    {cartItems.length}
                                </span>
                            </div>
                        )}

                        <button
                            className='hidden md:block px-3 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md'
                            onClick={() => navigate("/my-orders")}
                        >
                            My Orders
                        </button>
                    </>
                )}

                {/* Profile */}
                <div
                    className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl'
                    onClick={() => setShowInfo(prev => !prev)}
                >
                    {userData?.fullName?.slice(0, 1)}
                </div>

                {/* Dropdown */}
                {showInfo && (
                    <div className={`fixed top-[80px] right-[10px] 
                    ${userData.role === "deliveryBoy" ? "md:right-[20%] lg:right-[40%]" : "md:right-[10%] lg:right-[25%]"} 
                    w-[190px] bg-white shadow-2xl rounded-2xl p-[20px] flex flex-col gap-[12px] z-[9999] border border-[#ffe5de] animate-[fadeIn_0.2s_ease-in-out]`}>
                        <div className='text-[17px] font-semibold text-gray-800'>{userData.fullName}</div>

                        {userData.role === "user" && (
                            <div
                                className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer hover:translate-x-1 transition-all duration-200'
                                onClick={() => navigate("/my-orders")}
                            >
                                My Orders
                            </div>
                        )}

                        <div
                            className='text-[#ff4d2d] font-semibold cursor-pointer hover:translate-x-1 transition-all duration-200'
                            onClick={handleLogOut}
                        >
                            Log Out
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Nav