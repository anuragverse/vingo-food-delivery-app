import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './ownerItemCard';

function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex flex-col items-center'>
      <Nav />

      {/* No Shop Yet */}
      {!myShopData && (
        <div className='flex justify-center items-center p-4 sm:p-6 mt-8'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300'>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />

              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
                Add Your Restaurant
              </h2>

              <p className='text-gray-600 mb-4 text-sm sm:text-base leading-6'>
                Join our food delivery platform and reach hungry customers every day.
              </p>

              <button
                className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 hover:scale-105 transition-all duration-200'
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Exists */}
      {myShopData && (
        <div className='w-full flex flex-col items-center gap-8 px-4 sm:px-6 py-6'>

          {/* Heading */}
          <div className='flex flex-col items-center gap-2 text-center mt-6'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <FaUtensils className='text-[#ff4d2d] w-8 h-8 sm:w-10 sm:h-10' />
              Welcome to {myShopData.name}
            </h1>
            <p className='text-gray-500 text-sm sm:text-base'>
              Manage your restaurant and menu from here
            </p>
          </div>

          {/* Shop Card */}
          <div className='bg-white shadow-lg rounded-2xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative'>

            {/* Edit Button */}
            <div
              className='absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 hover:scale-110 transition-all duration-200 cursor-pointer'
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={18} />
            </div>

            <img
              src={myShopData.image}
              alt={myShopData.name}
              className='w-full h-48 sm:h-64 object-cover'
            />

            <div className='p-5 sm:p-6'>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
                {myShopData.name}
              </h1>

              <p className='text-gray-500 text-sm sm:text-base'>
                {myShopData.city}, {myShopData.state}
              </p>

              <p className='text-gray-500 mt-1 text-sm sm:text-base'>
                {myShopData.address}
              </p>
            </div>
          </div>

          {/* No Food Items */}
          {myShopData.items.length === 0 && (
            <div className='flex justify-center items-center p-4 sm:p-6'>
              <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex flex-col items-center text-center'>
                  <FaUtensils className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />

                  <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>
                    Add Your Food Item
                  </h2>

                  <p className='text-gray-600 mb-4 text-sm sm:text-base leading-6'>
                    Add delicious items to your menu and start receiving orders.
                  </p>

                  <button
                    className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 hover:scale-105 transition-all duration-200'
                    onClick={() => navigate("/add-item")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Food Items */}
          {myShopData.items.length > 0 && (
            <div className='w-full max-w-3xl flex flex-col gap-5'>
              <div className='flex justify-between items-center flex-wrap gap-3'>
                <h2 className='text-2xl font-bold text-gray-800'>
                  Your Menu
                </h2>

                <button
                  className='bg-[#ff4d2d] text-white px-5 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 hover:scale-105 transition-all duration-200'
                  onClick={() => navigate("/add-item")}
                >
                  + Add Food
                </button>
              </div>

              <div className='flex flex-col items-center gap-4 w-full'>
                {myShopData.items.map((item, index) => (
                  <OwnerItemCard data={item} key={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard