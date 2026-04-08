import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import Footer from './components/Footer'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { io } from 'socket.io-client'
import {
  addMyOrder,
  incrementUnreadOrderCount,
  addDeliveryAssignment,
  setSocket
} from './redux/userSlice'

export const serverUrl = "http://localhost:8000"

function App() {
  const { userData, socket } = useSelector(state => state.user)
  const dispatch = useDispatch()

  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  // socket connect
  useEffect(() => {
    if (!userData?._id) return

    const socketInstance = io(serverUrl, {
      withCredentials: true,
      transports: ["websocket"]
    })

    dispatch(setSocket(socketInstance))

    socketInstance.on('connect', () => {
      console.log("Socket connected:", socketInstance.id)

      socketInstance.emit('identity', {
        userId: userData._id
      })
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [userData?._id, dispatch])

  // owner realtime new order
  useEffect(() => {
    if (!socket || !userData?._id || userData.role !== "owner") return

    const handleGlobalNewOrder = (data) => {
      console.log("GLOBAL OWNER RECEIVED newOrder:", data)

      dispatch(addMyOrder(data))
      dispatch(incrementUnreadOrderCount())
    }

    socket.off("newOrder", handleGlobalNewOrder)
    socket.on("newOrder", handleGlobalNewOrder)

    return () => {
      socket.off("newOrder", handleGlobalNewOrder)
    }
  }, [socket, userData?._id, userData?.role, dispatch])

  // delivery boy realtime assignment
  useEffect(() => {
    if (!socket || !userData?._id || userData.role !== "deliveryBoy") return

    console.log("DELIVERY LISTENER ATTACHED:", socket.id)

    const handleNewDeliveryAssignment = (data) => {
      console.log("DELIVERY RECEIVED:", data)

      dispatch(addDeliveryAssignment({
        _id: data.orderId,
        customer: data.customer,
        deliveryAddress: data.deliveryAddress,
        paymentMethod: "cod",
        shopOrders: [
          {
            shop: data.shopOrder.shop,
            owner: data.shopOrder.owner,
            items: data.shopOrder.items,
            totalAmount: data.shopOrder.totalAmount,
            status: data.shopOrder.status,
            assignedDeliveryBoy: userData
          }
        ]
      }))
    }

    socket.off("new-delivery-assignment", handleNewDeliveryAssignment)
    socket.on("new-delivery-assignment", handleNewDeliveryAssignment)

    return () => {
      socket.off("new-delivery-assignment", handleNewDeliveryAssignment)
    }
  }, [socket, userData?._id, userData?.role, dispatch])

  return (
    <div className='min-h-screen flex flex-col bg-[#fff9f6]'>
      <div className='flex-1'>
        <Routes>
          <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
          <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
          <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/signin"} />} />
          <Route path='/' element={userData ? <Home /> : <Navigate to={"/signin"} />} />
          <Route path='/create-edit-shop' element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />} />
          <Route path='/add-item' element={userData ? <AddItem /> : <Navigate to={"/signin"} />} />
          <Route path='/edit-item/:itemId' element={userData ? <EditItem /> : <Navigate to={"/signin"} />} />
          <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />
          <Route path='/checkout' element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />
          <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
          <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
          <Route path='/track-order/:orderId' element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
          <Route path='/shop/:shopId' element={userData ? <Shop /> : <Navigate to={"/signin"} />} />
        </Routes>
      </div>

      {userData && <Footer />}
    </div>
  )
}

export default App