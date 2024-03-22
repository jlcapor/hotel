import React from 'react'
import { getHotelById } from '../../../actions/getHotelById';
import HotelDetailsClient from '@/components/hotel/HotelDetailsClient';
interface HotelDetailsPageProps {
    params: {
        hotelId: string
    }
}
const HotelDetailsPage = async({ params  } : HotelDetailsPageProps) => {
  const hotel = await getHotelById(params.hotelId);
  if(!hotel){
    return <div>Oop! Hotel with the given Id not found</div>
  }
  return (
    <div>
      <HotelDetailsClient hotel={hotel}/>
    </div>
  )
}

export default HotelDetailsPage
