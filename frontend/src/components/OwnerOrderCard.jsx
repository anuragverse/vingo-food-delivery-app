import React from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { updateOrderStatus } from '../redux/userSlice'

function OwnerOrderCard({ data }) {
  const dispatch = useDispatch()

  if (!data || !data.shopOrders) return null

  const getStatusColor = (status) => {
    const s = status?.toLowerCase()
    if (s === "pending") return "text-yellow-600 bg-yellow-100"
    if (s === "preparing") return "text-blue-600 bg-blue-100"
    if (s === "out of delivery") return "text-purple-600 bg-purple-100"
    if (s === "delivered") return "text-green-600 bg-green-100"
    return "text-gray-600 bg-gray-100"
  }

  const handleStatusChange = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      )

      dispatch(updateOrderStatus({
        orderId,
        shopId,
        status,
        assignedDeliveryBoy: result.data?.assignedDeliveryBoy,
        assignment: result.data?.assignment
      }))
    } catch (error) {
      console.log("Status update error:", error?.response?.data || error.message)
    }
  }

  return (
    <div className='space-y-6'>
      {data.shopOrders.map((shopOrder, index) => {
        const shopId = shopOrder?.shop?._id || shopOrder?.shop

        return (
          <div
            key={index}
            className='bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-[#ffe5de]'
          >

            {/* Top Row */}
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5'>
              <div>
                <h2 className='text-lg font-bold text-gray-800'>
                  {data?.customer?.fullName || "Customer"}
                </h2>
                <p className='text-sm text-gray-600 mt-1'>{data?.customer?.email}</p>
                <p className='text-sm text-gray-600'>{data?.customer?.mobile}</p>
              </div>

              <div className={`px-3 py-1 rounded-full text-sm font-semibold capitalize w-fit ${getStatusColor(shopOrder.status)}`}>
                {shopOrder.status}
              </div>
            </div>

            {/* Address */}
            <div className='mb-5'>
              <p className='text-sm font-medium text-gray-700 mb-1'>Delivery Address</p>
              <p className='text-sm text-gray-600 leading-6'>
                {data?.deliveryAddress?.text || "No address available"}
              </p>
            </div>

            {/* Items */}
            <div className='mb-5'>
              <h3 className='font-semibold text-gray-800 mb-3'>Items</h3>

              <div className='space-y-3'>
                {shopOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className='flex justify-between items-center bg-[#fffaf8] border border-[#ffe5de] rounded-xl px-4 py-3'
                  >
                    <div>
                      <p className='font-medium text-gray-800'>{item.name}</p>
                      <p className='text-sm text-gray-500'>
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className='font-semibold text-[#ff4d2d]'>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Control */}
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4'>
              <div>
                <p className='text-sm font-medium text-gray-700 mb-1'>Update Status</p>
                <select
                  value={shopOrder.status}
                  onChange={(e) => {
                    const selectedStatus = e.target.value
                    const shopId = shopOrder?.shop?._id || shopOrder?.shop
                    handleStatusChange(data._id, shopId, selectedStatus)
                  }}
                  className='border border-orange-300 rounded-xl px-3 py-2 text-sm capitalize outline-none focus:ring-2 focus:ring-[#ff4d2d] bg-white'
                >
                  <option value="pending">pending</option>
                  <option value="preparing">preparing</option>
                  <option value="out of delivery">out of delivery</option>
                  <option value="delivered">delivered</option>
                </select>
              </div>

              <div className='text-lg font-bold text-gray-800'>
                Total: <span className='text-[#ff4d2d]'>₹{shopOrder.totalAmount}</span>
              </div>
            </div>

            {/* Delivery Boys */}
            {shopOrder.status === "out of delivery" && shopOrder.assignment && (
              <div className='mt-5 bg-[#f8fafc] border border-gray-200 p-4 rounded-2xl'>
                <h4 className='font-semibold text-gray-800 mb-3'>
                  Available Delivery Boys
                </h4>

                <div className='space-y-2'>
                  {shopOrder.assignment.availableDeliveryBoys?.map((boy, i) => (
                    <div
                      key={i}
                      className='flex justify-between items-center bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm'
                    >
                      <p className='font-medium text-gray-800'>{boy.fullName}</p>
                      <p className='text-sm text-gray-500'>{boy.mobile}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OwnerOrderCard