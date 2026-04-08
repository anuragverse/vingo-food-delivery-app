import React from 'react'
import { useNavigate } from 'react-router-dom'

function UserOrderCard({ data }) {
  const navigate = useNavigate()

  if (!data) return null

  return (
    <div className='bg-white rounded-2xl shadow-md p-5 border border-gray-200'>
      {/* Top Row */}
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h2 className='text-xl font-bold text-gray-800'>
            Order #{data?._id?.slice(-6) || "N/A"}
          </h2>
          <p className='text-sm text-gray-500'>
            Date: {new Date(data?.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>

        <div className='text-right'>
          <p className='text-sm text-gray-500'>
            Payment:{" "}
            <span className='uppercase text-gray-700 font-medium'>
              {data?.paymentMethod || "N/A"}
            </span>
          </p>

          <p className='text-sm text-gray-500'>
            Status:{" "}
            <span className='capitalize text-blue-600 font-semibold'>
              {data?.shopOrders?.[0]?.status || "pending"}
            </span>
          </p>
        </div>
      </div>

      {/* Shop Orders */}
      {data?.shopOrders?.map((shopOrder, index) => (
        <div
          key={index}
          className='border border-gray-300 rounded-2xl p-4 mb-4'
        >
          {/* Shop Name */}
          <h3 className='text-2xl font-semibold text-gray-800 mb-4'>
            {shopOrder?.shop?.name || "Shop"}
          </h3>

          {/* Items */}
          <div className='space-y-4'>
            {shopOrder?.items?.map((item, i) => (
              <div
                key={i}
                className='flex items-start gap-4'
              >
                <img
                  src={item?.image}
                  alt={item?.name}
                  className='w-[140px] h-[100px] object-cover rounded-xl border'
                />

                <div className='flex-1'>
                  <p className='text-xl font-medium text-gray-800'>{item?.name}</p>
                  <p className='text-gray-500 text-base'>
                    Qty: {item?.quantity} × ₹{item?.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <hr className='my-4 border-gray-300' />

          {/* Subtotal + Status */}
          <div className='flex justify-between items-center'>
            <p className='text-2xl font-semibold text-gray-800'>
              Subtotal: ₹{shopOrder?.totalAmount || 0}
            </p>

            <p className='text-blue-600 font-semibold text-lg capitalize'>
              {shopOrder?.status || "pending"}
            </p>
          </div>
        </div>
      ))}

      {/* Bottom Row */}
      <div className='flex justify-between items-center pt-2'>
        <p className='text-3xl font-bold text-gray-800'>
          Total: ₹{data?.totalAmount || 0}
        </p>

        <button
          onClick={() => navigate(`/track-order/${data._id}`)}
          className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-xl font-semibold shadow'
        >
          Track Order
        </button>
      </div>
    </div>
  )
}

export default UserOrderCard