'use client'
import React, { ReactNode } from 'react'

const AmenityItem = ({children}: {children: ReactNode}) => {
  return (
    <div className='flex items-center gap-2'>
      {children}
    </div>
  )
}

export default AmenityItem
