import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io"
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'

function TrackOrderPage() {
  const { orderId } = useParams()
  const [currentOrder, setCurrentOrder] = useState(null)
  const [liveLocations, setLiveLocations] = useState({})
  const navigate = useNavigate()
  const { socket } = useSelector(state => state.user)

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      )
      setCurrentOrder(result.data)
    } catch (error) {
      console.log("TRACK ORDER FETCH ERROR:", error)
    }
  }

  useEffect(() => {
    handleGetOrder()
  }, [orderId])

  useEffect(() => {
    if (!socket) return

    const handleLocationUpdate = ({ deliveryBoyId, latitude, longitude }) => {
      console.log("LIVE DELIVERY LOCATION:", { deliveryBoyId, latitude, longitude })

      setLiveLocations(prev => ({
        ...prev,
        [deliveryBoyId]: {
          lat: latitude,
          lon: longitude
        }
      }))
    }

    socket.on("updateDeliveryLocation", handleLocationUpdate)

    return () => {
      socket.off("updateDeliveryLocation", handleLocationUpdate)
    }
  }, [socket])

  if (!currentOrder) {
    return (
      <div className='max-w-4xl mx-auto p-4'>
        <p className='text-gray-600'>Loading order tracking...</p>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
      <div
        className='relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px] cursor-pointer'
        onClick={() => navigate("/my-orders")}
      >
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
        <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
      </div>

      {currentOrder?.shopOrders
        ?.filter(shopOrder => shopOrder.status !== "pending")
        ?.map((shopOrder, index) => (
          <div
            className='bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4'
            key={index}
          >
            <div>
              <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>
                {shopOrder?.shop?.name}
              </p>

              <p className='font-semibold'>
                <span>Items:</span>{" "}
                {shopOrder?.items?.map(i => `${i.name} x ${i.quantity}`).join(", ")}
              </p>

              <p>
                <span className='font-semibold'>Subtotal:</span> ₹{shopOrder?.totalAmount}
              </p>

              <p className='mt-3'>
                <span className='font-semibold'>Status:</span>{" "}
                <span className='capitalize text-orange-600'>{shopOrder?.status}</span>
              </p>

              <p className='mt-3'>
                <span className='font-semibold'>Delivery Address:</span>{" "}
                {currentOrder?.deliveryAddress?.text}
              </p>
            </div>

            {shopOrder.status !== "delivered" ? (
              <>
                {shopOrder.assignedDeliveryBoy ? (
                  <div className='text-sm text-gray-700'>
                    <p className='font-semibold'>
                      <span>Delivery Boy Name:</span>{" "}
                      {shopOrder?.assignedDeliveryBoy?.fullName}
                    </p>

                    <p className='font-semibold'>
                      <span>Delivery Boy Contact No.:</span>{" "}
                      {shopOrder?.assignedDeliveryBoy?.mobile}
                    </p>
                  </div>
                ) : (
                  <p className='font-semibold text-gray-600'>
                    Delivery Boy is not assigned yet.
                  </p>
                )}
              </>
            ) : (
              <p className='text-green-600 font-semibold text-lg'>Delivered</p>
            )}

            {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (
              <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation:
                      liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                        lat: shopOrder?.assignedDeliveryBoy?.location?.coordinates?.[1],
                        lon: shopOrder?.assignedDeliveryBoy?.location?.coordinates?.[0]
                      },
                    customerLocation: {
                      lat: currentOrder?.deliveryAddress?.latitude,
                      lon: currentOrder?.deliveryAddress?.longitude
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
    </div>
  )
}

export default TrackOrderPage