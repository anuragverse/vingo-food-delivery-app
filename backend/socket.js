import User from "./models/user.model.js"

let ioInstance = null

export const setIO = (io) => {
  ioInstance = io
}

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized")
  }
  return ioInstance
}

export const socketHandler = (io) => {
  setIO(io)

  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on('identity', async ({ userId }) => {
      try {
        console.log("IDENTITY RECEIVED:", userId, socket.id)

        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true
        }, { new: true })
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        }, { new: true })

        if (user) {
          io.emit('updateDeliveryLocation', {
            deliveryBoyId: userId,
            latitude,
            longitude
          })
        }
      } catch (error) {
        console.log('updateDeliveryLocation error', error)
      }
    })

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            socketId: null,
            isOnline: false
          }
        )
      } catch (error) {
        console.log(error)
      }
    })
  })
}