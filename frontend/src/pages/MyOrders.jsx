import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import {
  resetUnreadOrderCount,
  updateRealtimeOrderStatus
} from '../redux/userSlice';

function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (userData?.role === "owner") {
      dispatch(resetUnreadOrderCount())
    }
  }, [dispatch, userData?.role])

  // user side status updates
 useEffect(() => {
  if (!socket || !userData?._id) return

  const handleUpdateStatus = ({ orderId, shopId, status, userId }) => {
    console.log("USER RECEIVED update-status:", { orderId, shopId, status, userId })

    if (String(userId) === String(userData._id)) {
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
    }
  }

  socket.on("update-status", handleUpdateStatus)

  return () => {
    socket.off("update-status", handleUpdateStatus)
  }
}, [socket, userData?._id, dispatch])

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>

        <div className='flex items-center gap-[20px] mb-6'>
          <div className='z-[10]' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold text-start'>My Orders</h1>
        </div>

        <div className='space-y-6'>
          {myOrders?.length > 0 ? (
  myOrders.map((order, index) => (
    userData?.role === "user" ? (
      <UserOrderCard data={order} key={order._id || index} />
    ) : userData?.role === "owner" ? (
      <OwnerOrderCard data={order} key={order._id || index} />
    ) : userData?.role === "deliveryBoy" ? (
      <UserOrderCard data={order} key={order._id || index} />
    ) : null
  ))
) : (
            <div className='text-center text-gray-500 py-10'>No orders found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders