import React from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { updateOrderStatus } from '../redux/userSlice'

function OwnerOrderCard({ data }) {
  const dispatch = useDispatch()

  if (!data || !data.shopOrders) return null

  const handleStatusChange = async (orderId, shopId, status) => {
  try {
    console.log("Changing status:", { orderId, shopId, status })

    const result = await axios.post(
      `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
      { status },
      { withCredentials: true }
    )

    console.log("Status update response:", result.data)

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
          <div key={index} className='bg-white rounded-2xl shadow-md p-5 border border-gray-200'>

            {/* Customer Info */}
            <div className='mb-3'>
              <h2 className='text-lg font-bold text-gray-800'>
                {data?.customer?.fullName || "Customer"}
              </h2>
              <p className='text-sm text-gray-600'>{data?.customer?.email}</p>
              <p className='text-sm text-gray-600'>{data?.customer?.mobile}</p>
            </div>

            {/* Address */}
            <p className='text-sm text-gray-600 mb-3'>
              {data?.deliveryAddress?.text}
            </p>

            {/* Items */}
            <div className='mb-3'>
              <h3 className='font-semibold'>Items:</h3>
              {shopOrder.items.map((item, i) => (
                <p key={i}>
                  {item.name} x {item.quantity}
                </p>
              ))}
            </div>

            {/* Status + Dropdown */}
            <div className='flex justify-between items-center mt-3'>
              <p>
                <span className='font-semibold'>Status:</span>{" "}
                <span className='text-orange-500 capitalize'>
                  {shopOrder.status}
                </span>
              </p>

              <select
                value={shopOrder.status}
                onChange={(e) => {
  const selectedStatus = e.target.value
  const shopId = shopOrder?.shop?._id || shopOrder?.shop

  console.log("DROPDOWN CHANGED")
  console.log("orderId:", data._id)
  console.log("shopId:", shopId)
  console.log("selectedStatus:", selectedStatus)

  handleStatusChange(data._id, shopId, selectedStatus)
}}
                className='border border-orange-400 rounded px-2 py-1 text-sm capitalize'
              >
                <option value="pending">pending</option>
                <option value="preparing">preparing</option>
                <option value="out of delivery">out of delivery</option>
                <option value="delivered">delivered</option>
              </select>
            </div>

            {/* Delivery Boys */}
            {shopOrder.status === "out of delivery" && shopOrder.assignment && (
              <div className='mt-4 bg-gray-100 p-3 rounded'>
                <h4 className='font-semibold mb-2'>Available Delivery Boys:</h4>
                {shopOrder.assignment.availableDeliveryBoys?.map((boy, i) => (
                  <p key={i}>{boy.fullName} ({boy.mobile})</p>
                ))}
              </div>
            )}

            {/* Total */}
            <div className='mt-4 text-right font-semibold'>
              Total: ₹{shopOrder.totalAmount}
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default OwnerOrderCard