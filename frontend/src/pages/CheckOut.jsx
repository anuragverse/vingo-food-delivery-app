import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder } from '../redux/userSlice';

function RecenterMap({ location }) {
  const map = useMap()

  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true })
    }
  }, [location, map])

  return null
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)

  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  const deliveryFee = totalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    try {
      const latitude = userData?.location?.coordinates?.[1]
      const longitude = userData?.location?.coordinates?.[0]

      if (!latitude || !longitude) return

      dispatch(setLocation({ lat: latitude, lon: longitude }))
      getAddressByLatLng(latitude, longitude)
    } catch (error) {
      console.log("Current location error:", error)
    }
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      )

      const resolvedAddress = result?.data?.results?.[0]?.formatted || result?.data?.results?.[0]?.address_line2 || ""
      dispatch(setAddress(resolvedAddress))
      setAddressInput(resolvedAddress)
    } catch (error) {
      console.log("Reverse geocode error:", error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      if (!addressInput?.trim()) return

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
      )

      const feature = result?.data?.features?.[0]
      if (!feature) return

      const { lat, lon, formatted } = feature.properties
      dispatch(setLocation({ lat, lon }))
      dispatch(setAddress(formatted || addressInput))
      setAddressInput(formatted || addressInput)
      setSuggestions([])
      setShowSuggestions(false)
    } catch (error) {
      console.log("Forward geocode error:", error)
    }
  }

  const fetchAddressSuggestions = async (text) => {
    try {
      if (!text.trim()) {
        setSuggestions([])
        return
      }

      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=5&apiKey=${apiKey}`
      )

      setSuggestions(result?.data?.features || [])
      setShowSuggestions(true)
    } catch (error) {
      console.log("Autocomplete error:", error)
    }
  }

  const handleSelectSuggestion = (place) => {
    const lat = place.properties.lat
    const lon = place.properties.lon
    const formattedAddress = place.properties.formatted

    setAddressInput(formattedAddress)
    dispatch(setLocation({ lat, lon }))
    dispatch(setAddress(formattedAddress))
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handlePlaceOrder = async () => {
    try {
      setLoading(true)

      const cleanedCartItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        shop: typeof item.shop === "object" ? item.shop._id : item.shop,
        quantity: item.quantity,
        foodType: item.foodType
      }))

      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location?.lat,
            longitude: location?.lon
          },
          totalAmount: AmountWithDeliveryFee,
          cartItems: cleanedCartItems
        },
        { withCredentials: true }
      )

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        navigate("/order-placed")
      } else {
        const orderId = result?.data?.orderId
        const razorOrder = result?.data?.razorOrder
        const key = result?.data?.key

        if (!orderId || !razorOrder) {
          console.log("Missing Razorpay order data")
          return
        }

        openRazorpayWindow(orderId, razorOrder, key)
      }

    } catch (error) {
      console.log("PLACE ORDER ERROR:", error?.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const openRazorpayWindow = (orderId, razorOrder, key) => {
    if (!window.Razorpay) {
      console.log("Razorpay SDK not loaded")
      return
    }

    const options = {
      key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: razorOrder.currency || "INR",
      name: "Delicious",
      description: "Food Delivery Website",
      order_id: razorOrder.id,

      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            },
            { withCredentials: true }
          )

          dispatch(addMyOrder(result?.data?.order))
          navigate("/order-placed")

        } catch (error) {
          console.log("VERIFY PAYMENT ERROR:", error?.response?.data || error.message)
        }
      },

      prefill: {
        name: userData?.fullName || "",
        email: userData?.email || "",
        contact: userData?.mobile || ""
      },

      theme: {
        color: "#ff4d2d"
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    setAddressInput(address || "")
  }, [address])

  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center px-4 py-6'>
      <div
        className='absolute top-[20px] left-[20px] z-[10] cursor-pointer transition-transform hover:scale-110'
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
      </div>

      <div className='w-full max-w-[950px] bg-white rounded-3xl shadow-xl border border-[#ffe5de] p-6 md:p-8 space-y-8'>

        {/* Heading */}
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold text-gray-800'>Checkout</h1>
          <p className='text-gray-500 text-sm'>Confirm your address, payment and place your order</p>
        </div>

        {/* Delivery Location */}
        <section className='space-y-4'>
          <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-800'>
            <IoLocationSharp className='text-[#ff4d2d]' /> Delivery Location
          </h2>

          <div className='relative'>
            <div className='flex gap-2 mb-3'>
              <input
                type="text"
                className='flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] transition'
                placeholder='Enter your delivery address...'
                value={addressInput}
                onChange={(e) => {
                  const value = e.target.value
                  setAddressInput(value)
                  fetchAddressSuggestions(value)
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />

              <button
                className='bg-[#ff4d2d] hover:bg-[#e64526] hover:scale-105 transition-all text-white px-4 py-2 rounded-xl flex items-center justify-center shadow-sm'
                onClick={getLatLngByAddress}
              >
                <IoSearchOutline size={18} />
              </button>

              <button
                className='bg-blue-500 hover:bg-blue-600 hover:scale-105 transition-all text-white px-4 py-2 rounded-xl flex items-center justify-center shadow-sm'
                onClick={getCurrentLocation}
              >
                <TbCurrentLocation size={18} />
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className='absolute top-[60px] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-[1000] max-h-[250px] overflow-y-auto'>
                {suggestions.map((place, index) => (
                  <div
                    key={index}
                    className='px-4 py-3 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0'
                    onClick={() => handleSelectSuggestion(place)}
                  >
                    {place.properties.formatted}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='rounded-2xl border border-[#ffe5de] overflow-hidden shadow-sm hover:shadow-md transition'>
            <div className='h-72 w-full flex items-center justify-center'>
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat || 28.6139, location?.lon || 77.2090]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker
                  position={[location?.lat || 28.6139, location?.lon || 77.2090]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-800'>Payment Method</h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer hover:shadow-md ${
                paymentMethod === "cod"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-100'>
                <MdDeliveryDining className='text-green-600 text-xl' />
              </span>
              <div>
                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer hover:shadow-md ${
                paymentMethod === "online"
                  ? "border-[#ff4d2d] bg-orange-50 shadow"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-purple-100'>
                <FaMobileScreenButton className='text-purple-700 text-lg' />
              </span>
              <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100'>
                <FaCreditCard className='text-blue-700 text-lg' />
              </span>
              <div>
                <p className='font-medium text-gray-800'>Online Payment</p>
                <p className='text-xs text-gray-500'>Pay securely online</p>
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section className='space-y-4'>
          <h2 className='text-lg font-semibold text-gray-800'>Order Summary</h2>

          <div className='rounded-2xl border border-[#ffe5de] bg-[#fffaf8] p-5 space-y-3 shadow-sm'>
            {cartItems?.map((item, index) => (
              <div key={index} className='flex justify-between text-sm text-gray-700'>
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <hr className='border-gray-200 my-2' />

            <div className='flex justify-between font-medium text-gray-800'>
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>

            <div className='flex justify-between text-gray-700'>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>

            <div className='flex justify-between text-lg font-bold text-[#ff4d2d] pt-2'>
              <span>Total</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <button
          className='w-full bg-[#ff4d2d] hover:bg-[#e64526] hover:scale-[1.01] transition-all text-white py-3.5 rounded-2xl font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed'
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : paymentMethod === "cod"
              ? "Place Order"
              : "Pay & Place Order"}
        </button>
      </div>
    </div>
  )
}

export default CheckOut