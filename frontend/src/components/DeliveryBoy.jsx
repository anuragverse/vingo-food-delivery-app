import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FaMotorcycle, FaLocationArrow } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { FiPackage } from "react-icons/fi";

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)

  const [currentOrder, setCurrentOrder] = useState(null)
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState([])
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return

    let watchId

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          setDeliveryBoyLocation({ lat: latitude, lon: longitude })

          socket.emit('updateLocation', {
            latitude,
            longitude,
            userId: userData._id
          })
        },
        (error) => {
          console.log(error)
        },
        {
          enableHighAccuracy: true
        }
      )
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData])

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true
      })
      setAvailableAssignments(result.data || [])
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, {
        withCredentials: true
      })
      setCurrentOrder(result.data || null)
    } catch (error) {
      console.log(error)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      setLoading(true)

      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      )

      setAvailableAssignments(prev =>
        prev.filter(item => item.assignmentId !== assignmentId)
      )

      await getCurrentOrder()
      await getAssignments()

      setLoading(false)
    } catch (error) {
      console.log("ACCEPT ORDER ERROR:", error?.response?.data || error.message)
      setLoading(false)
    }
  }

  const sendOtp = async () => {
    setLoading(true)

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopId: currentOrder.shopOrder.shop._id
        },
        { withCredentials: true }
      )

      setShowOtpBox(true)
      setLoading(false)
    } catch (error) {
      console.log("SEND OTP ERROR:", error?.response?.data || error.message)
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setLoading(true)

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopId: currentOrder.shopOrder.shop._id,
          otp
        },
        { withCredentials: true }
      )

      setShowOtpBox(false)
      setOtp("")
      setMessage("Delivered Successfully")

      await getCurrentOrder()
      await getAssignments()
      await handleTodayDeliveries()

      setTimeout(() => {
        setMessage("")
      }, 2000)

      setLoading(false)
    } catch (error) {
      console.log("VERIFY OTP ERROR:", error?.response?.data || error.message)
      setLoading(false)
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, {
        withCredentials: true
      })
      setTodayDeliveries(result.data || [])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])

  return (
    <div className='w-screen min-h-screen flex flex-col gap-6 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav />

      <div className='w-full max-w-[900px] flex flex-col gap-6 items-center px-4 py-6'>

        {/* Welcome Card */}
        <div className='bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-start items-center w-full border border-orange-100 text-center gap-3'>
          <div className='bg-[#fff4f1] p-4 rounded-full'>
            <FaMotorcycle className='text-[#ff4d2d] text-3xl' />
          </div>

          <h1 className='text-2xl font-bold text-[#ff4d2d]'>
            Welcome, {userData.fullName}
          </h1>

          <p className='text-gray-600 text-sm sm:text-base'>
            You’re live and ready for deliveries
          </p>

          <div className='bg-[#fffaf8] border border-[#ffe5de] rounded-xl px-4 py-3 text-sm text-gray-700 w-full max-w-[500px]'>
            <span className='font-semibold'>Latitude:</span> {deliveryBoyLocation?.lat || "Updating..."} <br />
            <span className='font-semibold'>Longitude:</span> {deliveryBoyLocation?.lon || "Updating..."}
          </div>
        </div>

        {/* Today Deliveries */}
        <div className='bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5 w-full border border-orange-100'>
          <h1 className='text-xl font-bold mb-4 text-[#ff4d2d] flex items-center gap-2'>
            <MdDeliveryDining className='text-2xl' />
            Today Deliveries
          </h1>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "orders"]} labelFormatter={label => `${label}:00`} />
              <Bar dataKey="count" fill='#ff4d2d' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className='max-w-sm mx-auto mt-6 p-6 bg-[#fffaf8] border border-[#ffe5de] rounded-2xl shadow-sm text-center'>
            <h1 className='text-lg font-semibold text-gray-800 mb-2'>Today's Earning</h1>
            <span className='text-3xl font-bold text-green-600'>₹{totalEarning}</span>
          </div>
        </div>

        {/* Available Orders */}
        {!currentOrder && (
          <div className='bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 w-full border border-orange-100'>
            <h1 className='text-xl font-bold mb-4 flex items-center gap-2 text-gray-800'>
              <FiPackage className='text-[#ff4d2d]' />
              Available Orders
            </h1>

            <div className='space-y-4'>
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className='border border-[#ffe5de] rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#fffaf8] hover:shadow-sm transition'
                    key={index}
                  >
                    <div className='space-y-1'>
                      <p className='text-base font-semibold text-gray-800'>{a?.shopName}</p>
                      <p className='text-sm text-gray-600'>
                        <span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress?.text}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {a?.items?.length || 0} items | ₹{a?.subtotal || 0}
                      </p>
                    </div>

                    <button
                      className='bg-[#ff4d2d] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#e64526] hover:scale-105 transition-all duration-200 disabled:opacity-50 shadow-sm'
                      onClick={() => acceptOrder(a.assignmentId)}
                      disabled={loading}
                    >
                      {loading ? "Accepting..." : "Accept"}
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  No Available Orders
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Order */}
        {currentOrder && (
          <div className='bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 w-full border border-orange-100'>
            <h2 className='text-xl font-bold mb-4 text-gray-800 flex items-center gap-2'>
              📦 Current Order
            </h2>

            <div className='border border-[#ffe5de] rounded-2xl p-4 mb-4 bg-[#fffaf8]'>
              <p className='font-semibold text-base text-gray-800'>
                {currentOrder?.shopOrder?.shop?.name}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {currentOrder?.deliveryAddress?.text}
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                {currentOrder?.shopOrder?.items?.length || 0} items | ₹{currentOrder?.shopOrder?.totalAmount || 0}
              </p>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || (
                  userData?.location?.coordinates
                    ? {
                        lat: userData.location.coordinates[1],
                        lon: userData.location.coordinates[0]
                      }
                    : null
                ),
                customerLocation: {
                  lat: currentOrder?.deliveryAddress?.latitude,
                  lon: currentOrder?.deliveryAddress?.longitude
                }
              }}
            />

            {!showOtpBox ? (
              <button
                className='mt-5 w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-2xl shadow-md hover:bg-green-600 active:scale-[0.99] transition-all duration-200'
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? <ClipLoader size={20} color='white' /> : "Mark As Delivered"}
              </button>
            ) : (
              <div className='mt-5 p-5 border border-[#ffe5de] rounded-2xl bg-[#fffaf8]'>
                <p className='text-sm font-semibold mb-3 text-gray-800'>
                  Enter OTP sent to{" "}
                  <span className='text-[#ff4d2d]'>
                    {currentOrder?.customer?.fullName || "Customer"}
                  </span>
                </p>

                <input
                  type="text"
                  className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400'
                  placeholder='Enter OTP'
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />

                {message && (
                  <p className='text-center text-green-500 text-lg font-semibold mb-4'>
                    {message}
                  </p>
                )}

                <button
                  className="w-full bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold hover:bg-[#e64526] transition-all duration-200"
                  onClick={verifyOtp}
                >
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoy