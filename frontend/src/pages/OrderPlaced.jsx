import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCheck } from "react-icons/fa6";

function OrderPlaced() {
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center items-center px-4'>
      <div className='w-full max-w-[600px] bg-white rounded-2xl shadow-lg p-8 text-center'>
        <div className='w-[80px] h-[80px] bg-green-500 rounded-full flex justify-center items-center mx-auto mb-6'>
          <FaCheck size={35} className='text-white' />
        </div>

        <h1 className='text-4xl font-bold text-gray-900 mb-4'>Order Placed!</h1>

        <p className='text-gray-600 text-lg leading-8 mb-8'>
          Thank you for your purchase. Your order is being prepared.
          You can track your order status in the "My Orders" section.
        </p>

        <button
          className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-8 py-3 rounded-xl font-semibold'
          onClick={() => navigate("/my-orders")}
        >
          Back to my orders
        </button>
      </div>
    </div>
  )
}

export default OrderPlaced