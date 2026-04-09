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

  useEffect(() => {
    if (!socket || !userData?._id) return

    const handleUpdateStatus = ({ orderId, shopId, status, userId }) => {
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
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 py-6'>
      <div className='w-full max-w-[850px]'>

        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <div
            className='cursor-pointer transition-transform hover:scale-110'
            onClick={() => navigate("/")}
          >
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>

          <div className='flex flex-col'>
            <h1 className='text-2xl font-bold text-gray-900'>
              My Orders
            </h1>
            <p className='text-sm text-gray-500'>
              Track all your recent orders
            </p>
          </div>
        </div>

        {/* Orders List */}
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
            <div className='flex flex-col items-center justify-center mt-16 gap-4 text-center'>
              <h2 className='text-xl font-semibold text-gray-700'>
                No orders yet
              </h2>
              <p className='text-gray-500 text-sm'>
                Looks like you haven’t ordered anything yet.
              </p>

              <button
                onClick={() => navigate("/")}
                className='mt-2 px-5 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e64526] transition'
              >
                Start Ordering
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders