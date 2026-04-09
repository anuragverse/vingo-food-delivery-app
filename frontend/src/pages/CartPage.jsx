import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)

    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center px-4 py-6'>
            <div className='w-full max-w-[850px]'>

                {/* Header */}
                <div className='flex items-center gap-4 mb-6'>
                    <div
                        className='cursor-pointer transition-transform hover:scale-110'
                        onClick={() => navigate("/")}
                    >
                        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                    </div>

                    <h1 className='text-2xl font-bold text-gray-900'>
                        Your Cart
                    </h1>
                </div>

                {/* Empty State */}
                {cartItems?.length === 0 ? (
                    <div className='flex flex-col items-center justify-center mt-20 gap-4 text-center'>
                        <h2 className='text-xl font-semibold text-gray-700'>
                            Your cart is empty
                        </h2>
                        <p className='text-gray-500 text-sm'>
                            Add something delicious to get started 🍔
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className='mt-2 px-5 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e64526] transition'
                        >
                            Browse Food
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Items */}
                        <div className='space-y-4'>
                            {cartItems.map((item, index) => (
                                <CartItemCard data={item} key={item.id || index} />
                                ))}
                        </div>

                        {/* Summary */}
                        <div className='mt-8 bg-white p-5 rounded-2xl shadow-md border border-[#ffe5de] flex justify-between items-center hover:shadow-lg transition'>
                            <h1 className='text-lg font-semibold text-gray-800'>
                                Total Amount
                            </h1>

                            <span className='text-xl font-bold text-[#ff4d2d]'>
                                ₹{totalAmount}
                            </span>
                        </div>

                        {/* Checkout Button */}
                        <div className='mt-6 flex justify-end'>
                            <button
                                onClick={() => navigate("/checkout")}
                                className='bg-[#ff4d2d] text-white px-7 py-3 rounded-xl text-lg font-medium hover:bg-[#e64526] hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg'
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CartPage