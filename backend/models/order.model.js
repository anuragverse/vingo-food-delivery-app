import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  foodType: {
    type: String
  }
})

const shopOrderSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "preparing", "out of delivery", "delivered"],
    default: "pending"
  },
  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignment: {
    availableDeliveryBoys: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    }
  },
  otp: {
  type: Number,
  default: null
},
deliveredAt: {
  type: Date,
  default: null
}
}, { _id: false })

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  deliveryAddress: {
    text: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  shopOrders: [shopOrderSchema],
  payment: {
    type: Boolean,
    default: false
  },
  razorpayOrderId: {
    type: String,
    default: ""
  },
  razorpayPaymentId: {
    type: String,
    default: ""
  }
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)

export default Order