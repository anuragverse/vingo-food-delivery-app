import axios from 'axios';
import React from 'react'
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';

function OwnerItemCard({ data }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleDelete = async () => {
  const confirmDelete = window.confirm(`Delete "${data.name}" from your menu?`)

  if (!confirmDelete) return

  try {
    const result = await axios.get(
      `${serverUrl}/api/item/delete/${data._id}`,
      { withCredentials: true }
    )
    dispatch(setMyShopData(result.data))
  } catch (error) {
    console.log(error)
  }
}

  return (
    <div className='flex flex-col sm:flex-row bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-[#ffe5de] w-full'>

      {/* Image */}
      <div className='w-full sm:w-36 h-32 sm:h-auto bg-gray-50 overflow-hidden'>
        <img
          src={data.image}
          alt={data.name}
          className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
        />
      </div>

      {/* Content */}
      <div className='flex flex-col justify-between p-4 flex-1 gap-3'>

        {/* Top */}
        <div className='flex flex-col gap-1'>
          <h2 className='text-lg font-semibold text-gray-800'>
            {data.name}
          </h2>

          <p className='text-sm text-gray-500'>
            <span className='font-medium text-gray-700'>Category:</span> {data.category}
          </p>

          <p className='text-sm text-gray-500'>
            <span className='font-medium text-gray-700'>Type:</span> {data.foodType}
          </p>
        </div>

        {/* Bottom */}
        <div className='flex items-center justify-between mt-2'>

          {/* Price */}
          <div className='text-[#ff4d2d] font-bold text-lg'>
            ₹{data.price}
          </div>

          {/* Actions */}
          <div className='flex items-center gap-2'>

            <button
              className='p-2 rounded-full bg-[#fff4f1] text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all duration-200 hover:scale-110 shadow-sm'
              onClick={() => navigate(`/edit-item/${data._id}`)}
            >
              <FaPen size={14} />
            </button>

            <button
              className='p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110 shadow-sm'
              onClick={handleDelete}
            >
              <FaTrashAlt size={14} />
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerItemCard