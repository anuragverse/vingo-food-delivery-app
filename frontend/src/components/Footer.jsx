import React from 'react'
import { FaInstagram, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa"
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className='w-full bg-white border-t border-orange-100 mt-10 shadow-sm'>
      <div className='max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10'>

        {/* Brand Section */}
        <div>
          <h2 className='text-3xl font-bold text-[#ff4d2d]'>Vingo</h2>
          <p className='mt-3 text-gray-600 leading-7 text-sm'>
            Vingo is a smart food delivery platform that connects users,
            restaurant owners, and delivery partners in one seamless real-time experience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Quick Links</h3>
          <ul className='space-y-3 text-sm text-gray-600'>
            <li>
              <Link to="/" className='hover:text-[#ff4d2d] transition'>Home</Link>
            </li>
            <li>
              <Link to="/my-orders" className='hover:text-[#ff4d2d] transition'>My Orders</Link>
            </li>
            <li>
              <Link to="/checkout" className='hover:text-[#ff4d2d] transition'>Checkout</Link>
            </li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Connect With Us</h3>
          <p className='text-sm text-gray-600 mb-4'>
            Feel free to connect or explore the project.
          </p>

          <div className='flex gap-4 text-xl text-[#ff4d2d]'>
            <a href="#" className='hover:scale-110 transition'>
              <FaInstagram />
            </a>
            <a href="#" className='hover:scale-110 transition'>
              <FaLinkedin />
            </a>
            <a href="#" className='hover:scale-110 transition'>
              <FaGithub />
            </a>
            <a href="mailto:example@gmail.com" className='hover:scale-110 transition'>
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-orange-100 py-4 px-6 text-center text-sm text-gray-500 bg-[#fff9f6]'>
        © {new Date().getFullYear()} <span className='font-semibold text-[#ff4d2d]'>Vingo</span>. All rights reserved. Built with MERN Stack.
      </div>
    </footer>
  )
}

export default Footer