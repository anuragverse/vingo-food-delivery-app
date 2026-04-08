import dotenv from "dotenv"
dotenv.config()

import crypto from "crypto"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import Razorpay from "razorpay"
import { getIO } from "../socket.js"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const placeOrder = async (req, res) => {
  try {
    console.log("=== PLACE ORDER API HIT ===")
    console.log("req.body:", JSON.stringify(req.body, null, 2))
    console.log("req.userId:", req.userId)

    const { paymentMethod, deliveryAddress, totalAmount, cartItems } = req.body

    if (!paymentMethod || !deliveryAddress || !totalAmount || !cartItems) {
      return res.status(400).json({ message: "send all details" })
    }

    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "send complete deliveryAddress" })
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "cart is empty" })
    }

    const groupedItems = {}

    for (const item of cartItems) {
      if (!item.shop) {
        return res.status(400).json({
          message: `Cart item missing shop field: ${item.name || "Unknown item"}`
        })
      }

      const shopId = item.shop

      if (!groupedItems[shopId]) {
        groupedItems[shopId] = []
      }

      groupedItems[shopId].push(item)
    }

    const shopOrders = []

    for (const shopId in groupedItems) {
      const items = groupedItems[shopId]

      const shop = await Shop.findById(shopId).populate("owner")

      if (!shop) {
        return res.status(400).json({ message: `Shop not found for ID: ${shopId}` })
      }

      if (!shop.owner) {
        return res.status(400).json({ message: `Shop owner missing for shop ID: ${shopId}` })
      }

      const shopTotal = items.reduce((sum, item) => {
        return sum + item.price * item.quantity
      }, 0)

      shopOrders.push({
        shop: shop._id,
        owner: shop.owner._id,
        items,
        totalAmount: shopTotal,
        status: "pending"
      })
    }

    const newOrder = await Order.create({
      customer: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      payment: paymentMethod === "online"
    })

    const populatedOrder = await Order.findById(newOrder._id)
      .populate("customer", "fullName email mobile socketId")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile socketId")

    const io = getIO()

    // Realtime notification to each owner
    for (const shopOrder of populatedOrder.shopOrders) {
      const ownerSocketId = shopOrder?.owner?.socketId

      if (ownerSocketId) {
        console.log("Sending newOrder to owner:", shopOrder.owner._id, ownerSocketId)
        io.to(ownerSocketId).emit("newOrder", populatedOrder)
      } else {
        console.log("Owner socketId not found for owner:", shopOrder?.owner?._id)
      }
    }

    // ONLINE PAYMENT FLOW
    if (paymentMethod === "online") {
      const options = {
        amount: Number(totalAmount) * 100,
        currency: "INR",
        receipt: "receipt_order_" + Date.now()
      }

      const razorOrder = await razorpay.orders.create(options)

      return res.status(201).json({
        success: true,
        orderId: newOrder._id,
        razorOrder,
        key: process.env.RAZORPAY_KEY_ID
      })
    }

    return res.status(201).json(populatedOrder)

  } catch (error) {
    console.error("PLACE ORDER ERROR:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body

    console.log("=== VERIFY PAYMENT ===")
    console.log(req.body)

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex")

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    const order = await Order.findById(orderId)
      .populate("customer", "fullName email mobile socketId")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile socketId")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.payment = true
    order.razorpayOrderId = razorpayOrderId
    order.razorpayPaymentId = razorpayPaymentId

    await order.save()

    const io = getIO()

    // notify owners after successful payment too
    for (const shopOrder of order.shopOrders) {
      const ownerSocketId = shopOrder?.owner?.socketId

      if (ownerSocketId) {
        io.to(ownerSocketId).emit("newOrder", order)
      }
    }

    return res.status(200).json({
      message: "Payment verified successfully",
      order
    })

  } catch (error) {
    console.log("VERIFY PAYMENT ERROR:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    let orders = []

    if (user.role === "user") {
      orders = await Order.find({ customer: req.userId })
        .sort({ createdAt: -1 })
        .populate("customer", "fullName email mobile socketId")
        .populate("shopOrders.shop", "name image")
        .populate("shopOrders.owner", "fullName email mobile socketId")
        .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        .populate("shopOrders.assignment.availableDeliveryBoys", "fullName email mobile")
    } else if (user.role === "owner") {
      orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("customer", "fullName email mobile socketId")
        .populate("shopOrders.shop", "name image")
        .populate("shopOrders.owner", "fullName email mobile socketId")
        .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        .populate("shopOrders.assignment.availableDeliveryBoys", "fullName email mobile")
    } else if (user.role === "deliveryBoy") {
      orders = await Order.find({
        "shopOrders.assignedDeliveryBoy": req.userId
      })
        .sort({ createdAt: -1 })
        .populate("customer", "fullName email mobile socketId")
        .populate("shopOrders.shop", "name image")
        .populate("shopOrders.owner", "fullName email mobile socketId")
        .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        .populate("shopOrders.assignment.availableDeliveryBoys", "fullName email mobile")
    }

    return res.status(200).json(orders)

  } catch (error) {
    console.log("getMyOrders error:", error)
    return res.status(500).json({ message: `getMyOrders error ${error.message}` })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params
    const { status } = req.body

    console.log("=== UPDATE ORDER STATUS ===")
    console.log("req.params:", req.params)
    console.log("req.body:", req.body)
    console.log("req.userId:", req.userId)

    if (!orderId || !shopId || !status) {
      return res.status(400).json({ message: "orderId, shopId and status are required" })
    }

    const order = await Order.findById(orderId)
      .populate("customer", "fullName email mobile socketId")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile socketId")
      .populate("shopOrders.assignment.availableDeliveryBoys", "fullName email mobile socketId")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const shopOrder = order.shopOrders.find(
      so => (so.shop?._id?.toString() || so.shop?.toString()) === shopId.toString()
    )

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" })
    }

    shopOrder.status = status
    let assignmentPayload = null

    if (status === "out of delivery") {
      const deliveryBoys = await User.find({
        role: "deliveryBoy",
        isOnline: true
      }).select("_id fullName email mobile socketId location")

      shopOrder.assignment = {
        availableDeliveryBoys: deliveryBoys.map(boy => boy._id),
        acceptedBy: null,
        acceptedAt: null
      }

      assignmentPayload = {
        assignmentId: `${order._id}_${shopOrder.shop._id || shopOrder.shop}`,
        orderId: order._id,
        shopId: shopOrder.shop._id || shopOrder.shop,
        shopName: shopOrder.shop.name || "Shop",
        deliveryAddress: order.deliveryAddress,
        items: shopOrder.items,
        subtotal: shopOrder.totalAmount
      }

      console.log("AVAILABLE DELIVERY BOYS:", deliveryBoys.map(b => ({
        id: b._id,
        name: b.fullName,
        socketId: b.socketId
      })))
    }

    order.markModified("shopOrders")
    await order.save()

    // Populate delivery boys for owner UI
    await order.populate({
      path: "shopOrders.assignment.availableDeliveryBoys",
      select: "fullName mobile socketId"
    })

    const io = getIO()

    // notify user
    if (order.customer?.socketId) {
      console.log("EMITTING update-status to user:", order.customer._id, order.customer.socketId)

      io.to(order.customer.socketId).emit("update-status", {
        orderId,
        shopId,
        status,
        userId: order.customer._id
      })
    }

    // notify delivery boys when status becomes out of delivery
    if (status === "out of delivery" && assignmentPayload) {
      const availableBoys = await User.find({
        _id: { $in: shopOrder.assignment.availableDeliveryBoys }
      }).select("_id fullName socketId")

      for (const boy of availableBoys) {
        if (boy.socketId) {
          console.log("EMITTING new-delivery-assignment to:", boy.fullName, boy.socketId)

          io.to(boy.socketId).emit("new-delivery-assignment", assignmentPayload)
        }
      }
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      status,
      assignedDeliveryBoy: shopOrder.assignedDeliveryBoy || null,
      assignment: shopOrder.assignment || null
    })

  } catch (error) {
    console.log("updateOrderStatus error:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId

    console.log("=== GET DELIVERY ASSIGNMENTS ===")
    console.log("deliveryBoyId:", deliveryBoyId)

    const orders = await Order.find({
      "shopOrders.status": "out of delivery",
      "shopOrders.assignment.availableDeliveryBoys": deliveryBoyId
    })
      .sort({ createdAt: -1 })
      .populate("customer", "fullName email mobile")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    const assignments = []

    for (const order of orders) {
      for (const shopOrder of order.shopOrders) {
        const isAvailableToThisBoy =
          shopOrder.status === "out of delivery" &&
          shopOrder.assignment &&
          Array.isArray(shopOrder.assignment.availableDeliveryBoys) &&
          shopOrder.assignment.availableDeliveryBoys.some(
            boy =>
              (boy._id?.toString() || boy.toString()) === deliveryBoyId.toString()
          )

        const alreadyAccepted =
          shopOrder.assignment?.acceptedBy || shopOrder.assignedDeliveryBoy

        const alreadyDelivered = shopOrder.status === "delivered"

        if (isAvailableToThisBoy && !alreadyAccepted && !alreadyDelivered) {
          assignments.push({
            assignmentId: `${order._id}_${shopOrder.shop._id || shopOrder.shop}`,
            orderId: order._id,
            shopId: shopOrder.shop._id || shopOrder.shop,
            shopName: shopOrder.shop.name,
            deliveryAddress: order.deliveryAddress,
            items: shopOrder.items,
            subtotal: shopOrder.totalAmount
          })
        }
      }
    }

    console.log("Filtered assignments:", assignments)

    return res.status(200).json(assignments)

  } catch (error) {
    console.log("getDeliveryBoyAssignment error:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const deliveryBoyId = req.userId

    console.log("=== ACCEPT ORDER ===")
    console.log("assignmentId:", assignmentId)
    console.log("deliveryBoyId:", deliveryBoyId)

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required" })
    }

    const [orderId, shopId] = assignmentId.split("_")

    if (!orderId || !shopId) {
      return res.status(400).json({ message: "Invalid assignmentId format" })
    }

    const order = await Order.findById(orderId)
      .populate("customer", "fullName email mobile socketId")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile socketId")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const shopOrder = order.shopOrders.find(
      so => so.shop?._id?.toString() === shopId.toString()
    )

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" })
    }

    if (!shopOrder.assignment) {
      shopOrder.assignment = {
        availableDeliveryBoys: [],
        acceptedBy: null,
        acceptedAt: null
      }
    }

    console.log("shopOrder.assignment before accept:", shopOrder.assignment)
    console.log("shopOrder.assignedDeliveryBoy before accept:", shopOrder.assignedDeliveryBoy)

    if (
      shopOrder.assignment.acceptedBy &&
      shopOrder.assignment.acceptedBy.toString() !== deliveryBoyId.toString()
    ) {
      return res.status(400).json({ message: "Order already accepted by another delivery boy" })
    }

    shopOrder.assignedDeliveryBoy = deliveryBoyId
    shopOrder.assignment.acceptedBy = deliveryBoyId
    shopOrder.assignment.acceptedAt = new Date()

    order.markModified("shopOrders")
    await order.save()

    const updatedOrder = await Order.findById(orderId)
      .populate("customer", "fullName email mobile socketId")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile socketId")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    const updatedShopOrder = updatedOrder.shopOrders.find(
      so => so.shop?._id?.toString() === shopId.toString()
    )

    const io = getIO()

    // notify owner
    const ownerSocketId = updatedShopOrder?.owner?.socketId
    if (ownerSocketId) {
      io.to(ownerSocketId).emit("delivery-boy-assigned", {
        orderId,
        shopId,
        assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy
      })
    }

    // notify user
    const userSocketId = updatedOrder?.customer?.socketId
    if (userSocketId) {
      io.to(userSocketId).emit("delivery-boy-assigned", {
        orderId,
        shopId,
        assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy
      })
    }

    return res.status(200).json({
      message: "Order accepted successfully",
      order: updatedOrder,
      shopOrder: updatedShopOrder
    })

  } catch (error) {
    console.log("acceptOrder error:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const getCurrentOrder = async (req, res) => {
  try {
    const deliveryBoyId = req.userId

    console.log("=== GET CURRENT ORDER ===")
    console.log("deliveryBoyId:", deliveryBoyId)

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "out of delivery"
    })
      .sort({ updatedAt: -1 })
      .populate("customer", "fullName email mobile")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    console.log("Fetched candidate current orders:", orders)

    if (!orders || orders.length === 0) {
      return res.status(200).json(null)
    }

    let matchedOrder = null
    let matchedShopOrder = null

    for (const order of orders) {
      const found = order.shopOrders.find(
        so =>
          so.assignedDeliveryBoy &&
          so.assignedDeliveryBoy._id.toString() === deliveryBoyId.toString() &&
          so.status === "out of delivery"
      )

      if (found) {
        matchedOrder = order
        matchedShopOrder = found
        break
      }
    }

    console.log("Matched current order:", matchedOrder)
    console.log("Matched current shopOrder:", matchedShopOrder)

    if (!matchedOrder || !matchedShopOrder) {
      return res.status(200).json(null)
    }

    return res.status(200).json({
      _id: matchedOrder._id,
      customer: matchedOrder.customer,
      deliveryAddress: matchedOrder.deliveryAddress,
      shopOrder: matchedShopOrder
    })

  } catch (error) {
    console.log("getCurrentOrder error:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
      .populate("customer", "fullName email mobile")
      .populate("shopOrders.shop", "name image")
      .populate("shopOrders.owner", "fullName email mobile")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    if (!order) {
      return res.status(400).json({ message: "order not found" })
    }

    return res.status(200).json(order)

  } catch (error) {
    return res.status(500).json({ message: `get by id order error ${error}` })
  }
}

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopId } = req.body

    console.log("=== SEND OTP ===")
    console.log("orderId:", orderId)
    console.log("shopId:", shopId)

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    const shopOrder = order.shopOrders.find(
      so => so.shop.toString() === shopId.toString()
    )

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" })
    }

    const otp = Math.floor(1000 + Math.random() * 9000)

    shopOrder.otp = Number(otp)
    order.markModified("shopOrders")

    await order.save()

    console.log("OTP generated:", otp)

    return res.status(200).json({
      message: "OTP sent successfully",
      otp
    })

  } catch (error) {
    console.log("sendDeliveryOtp error:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopId, otp } = req.body

    console.log("=== VERIFY OTP ===")
    console.log("orderId:", orderId)
    console.log("shopId:", shopId)
    console.log("otp:", otp)

    const order = await Order.findById(orderId)
      .populate("customer", "fullName email mobile socketId")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    console.log("Incoming shopId:", shopId)
    console.log("order.shopOrders:", order.shopOrders)

    const shopOrder = order.shopOrders.find(
      so => (so.shop?._id?.toString() || so.shop?.toString()) === shopId.toString()
    )

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" })
    }

    console.log("Matched shopOrder for OTP:", shopOrder)
    console.log("Stored OTP:", shopOrder.otp)
    console.log("Entered OTP:", otp)

    if (Number(shopOrder.otp) !== Number(otp)) {
      return res.status(400).json({ message: "Invalid OTP" })
    }

    shopOrder.status = "delivered"
    shopOrder.otp = null
    shopOrder.deliveredAt = new Date()
    order.markModified("shopOrders")

    await order.save()

    const io = getIO()

    // notify user after delivery
    if (order.customer?.socketId) {
      io.to(order.customer.socketId).emit("update-status", {
        orderId: order._id,
        shopId,
        status: "delivered",
        userId: order.customer._id
      })
    }

    console.log("Order marked delivered successfully")

    return res.status(200).json({
      message: "Order delivered successfully"
    })

  } catch (error) {
    console.log("verifyDeliveryOtp error:", error)
    return res.status(500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId
    const startsOfDay = new Date()
    startsOfDay.setHours(0, 0, 0, 0)

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay }
    }).lean()

    let todaysDeliveries = []

    orders.forEach(order => {
      order.shopOrders.forEach(shopOrder => {
        if (
          String(shopOrder.assignedDeliveryBoy) === String(deliveryBoyId) &&
          shopOrder.status === "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
          todaysDeliveries.push(shopOrder)
        }
      })
    })

    let stats = {}

    todaysDeliveries.forEach(shopOrder => {
      const hour = new Date(shopOrder.deliveredAt).getHours()
      stats[hour] = (stats[hour] || 0) + 1
    })

    let formattedStats = Object.keys(stats).map(hour => ({
      hour: parseInt(hour),
      count: stats[hour]
    }))

    formattedStats.sort((a, b) => a.hour - b.hour)

    return res.status(200).json(formattedStats)

  } catch (error) {
    return res.status(500).json({ message: `today deliveries error ${error}` })
  }
}