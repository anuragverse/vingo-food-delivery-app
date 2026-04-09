import React from 'react'
import { FaMinus, FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';

function CartItemCard({ data }) {
    const dispatch = useDispatch()

    const handleIncrease = (id, currentQty) => {
        dispatch(updateQuantity({ id, quantity: currentQty + 1 }))
    }

    const handleDecrease = (id, currentQty) => {
        if (currentQty > 1) {
            dispatch(updateQuantity({ id, quantity: currentQty - 1 }))
        }
    }

    return (
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl shadow-md border border-[#ffe5de] hover:shadow-lg transition-all duration-300'>

            {/* Left Section */}
            <div className='flex items-center gap-4'>
                <img
                    src={data.image}
                    alt={data.name}
                    className='w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm'
                />

                <div className='flex flex-col gap-1'>
                    <h1 className='font-semibold text-gray-800 text-lg'>
                        {data.name}
                    </h1>

                    <p className='text-sm text-gray-500'>
                        ₹{data.price} × {data.quantity}
                    </p>

                    <p className='font-bold text-[#ff4d2d] text-base'>
                        ₹{data.price * data.quantity}
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className='flex items-center justify-between sm:justify-end gap-4'>

                {/* Quantity Controls */}
                <div className='flex items-center gap-3 bg-[#fff7f3] px-3 py-2 rounded-full border border-[#ffe5de]'>
                    <button
                        className='p-2 cursor-pointer bg-white rounded-full hover:bg-gray-100 transition shadow-sm'
                        onClick={() => handleDecrease(data.id, data.quantity)}
                    >
                        <FaMinus size={12} />
                    </button>

                    <span className='font-medium text-gray-800 min-w-[20px] text-center'>
                        {data.quantity}
                    </span>

                    <button
                        className='p-2 cursor-pointer bg-white rounded-full hover:bg-gray-100 transition shadow-sm'
                        onClick={() => handleIncrease(data.id, data.quantity)}
                    >
                        <FaPlus size={12} />
                    </button>
                </div>

                {/* Remove Button */}
                <button
                    className="p-2.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-200 hover:scale-110"
                    onClick={() => dispatch(removeCartItem(data.id))}
                >
                    <CiTrash size={20} />
                </button>
            </div>
        </div>
    )
}

export default CartItemCard