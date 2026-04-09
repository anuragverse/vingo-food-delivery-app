import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCheck } from "react-icons/fa6";

function OrderPlaced() {
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center items-center px-4'>
      
      <div className='w-full max-w-[600px] bg-white rounded-2xl shadow-lg p-8 text-center flex flex-col items-center gap-6'>

        {/* Success Icon */}
        <div className='w-[85px] h-[85px] bg-green-500 rounded-full flex justify-center items-center shadow-md animate-[scaleIn_0.3s_ease-in-out]'>
          <FaCheck size={38} className='text-white' />
        </div>

        {/* Heading */}
        <h1 className='text-4xl font-bold text-gray-900'>
          Order Placed!
        </h1>

        {/* Subtext */}
        <p className='text-gray-600 text-lg leading-7 max-w-[420px]'>
          Your order has been placed successfully 🎉  
          We’re preparing it now. You can track everything in your orders.
        </p>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 mt-2'>

          <button
            className='bg-[#ff4d2d] hover:bg-[#e64526] hover:scale-105 transition-all duration-200 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg'
            onClick={() => navigate("/my-orders")}
          >
            Track Order
          </button>

          <button
            className='bg-gray-100 hover:bg-gray-200 transition px-6 py-3 rounded-xl font-medium text-gray-700'
            onClick={() => navigate("/")}
          >
            Order More
          </button>

        </div>
      </div>
    </div>
  )
}

export default OrderPlaced