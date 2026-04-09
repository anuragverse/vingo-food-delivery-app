import React from 'react'
import { useNavigate } from 'react-router-dom'

function UserOrderCard({ data }) {
  const navigate = useNavigate()

  if (!data) return null

  const getStatusColor = (status) => {
    const s = status?.toLowerCase()
    if (s === "pending") return "text-yellow-600 bg-yellow-100"
    if (s === "accepted" || s === "preparing") return "text-blue-600 bg-blue-100"
    if (s === "out for delivery") return "text-purple-600 bg-purple-100"
    if (s === "delivered") return "text-green-600 bg-green-100"
    if (s === "cancelled") return "text-red-600 bg-red-100"
    return "text-gray-600 bg-gray-100"
  }

  return (
    <div className='bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-[#ffe5de]'>

      {/* Top Row */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5'>
        <div>
          <h2 className='text-xl font-bold text-gray-800'>
            Order #{data?._id?.slice(-6) || "N/A"}
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Date: {new Date(data?.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>

        <div className='text-left sm:text-right space-y-1'>
          <p className='text-sm text-gray-500'>
            Payment:{" "}
            <span className='uppercase text-gray-700 font-medium'>
              {data?.paymentMethod || "N/A"}
            </span>
          </p>

          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(data?.shopOrders?.[0]?.status || "pending")}`}>
            {data?.shopOrders?.[0]?.status || "pending"}
          </div>
        </div>
      </div>

      {/* Shop Orders */}
      <div className='space-y-5'>
        {data?.shopOrders?.map((shopOrder, index) => (
          <div
            key={index}
            className='border border-[#ffe5de] rounded-2xl p-4 bg-[#fffaf8]'
          >
            {/* Shop Name */}
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              {shopOrder?.shop?.name || "Shop"}
            </h3>

            {/* Items */}
            <div className='space-y-4'>
              {shopOrder?.items?.map((item, i) => (
                <div
                  key={i}
                  className='flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm'
                >
                  <img
                    src={item?.image}
                    alt={item?.name}
                    className='w-full sm:w-[120px] h-[90px] object-cover rounded-xl border'
                  />

                  <div className='flex-1'>
                    <p className='text-lg font-medium text-gray-800'>
                      {item?.name}
                    </p>
                    <p className='text-gray-500 text-sm mt-1'>
                      Qty: {item?.quantity} × ₹{item?.price}
                    </p>
                  </div>

                  <p className='text-[#ff4d2d] font-semibold text-base'>
                    ₹{item?.quantity * item?.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <hr className='my-4 border-gray-200' />

            {/* Subtotal */}
            <div className='flex justify-between items-center'>
              <p className='text-lg font-semibold text-gray-800'>
                Subtotal: ₹{shopOrder?.totalAmount || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6'>
        <p className='text-2xl font-bold text-gray-800'>
          Total: ₹{data?.totalAmount || 0}
        </p>

        <button
          onClick={() => navigate(`/track-order/${data._id}`)}
          className='bg-[#ff4d2d] hover:bg-[#e64526] hover:scale-105 transition-all duration-200 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg'
        >
          Track Order
        </button>
      </div>
    </div>
  )
}

export default UserOrderCard