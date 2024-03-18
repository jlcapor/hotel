'use client'
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from 'zod'
import { Hotel, Room } from "@prisma/client"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { UploadButton } from "../uploadthing"
import { useToast } from "../ui/use-toast"
import Image from "next/image"
import { Loader2, Pencil, PencilLine, XCircle } from "lucide-react"
import { Button } from "../ui/button"
import axios from 'axios'
import useLocation from "@/hooks/useLocation"
import { ICity, IState } from "country-state-city";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface AddHotelFormProps {
  hotel: HotelWithRooms | null;
}

export type HotelWithRooms = Hotel & {
  rooms: Room[];
}

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be atleast 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be atleast 10 characters long",
  }),
  image: z.string().min(1, {
    message: "Image is required",
  }),
  country:  z.string().min(1, {
    message: "Country is required" 
  }),
  state: z.string().optional(),
  city: z.string().optional(),
  locationDescription: z.string().min(10, {
    message: "Description must be atleast 10 characters long",
  }),
  gym: z.boolean().optional(),
  spa: z.boolean().optional(),
  bar: z.boolean().optional(),
  laundry: z.boolean().optional(),
  restaurant: z.boolean().optional(),
  shopping: z.boolean().optional(),
  freeParking: z.boolean().optional(),
  bikeRental: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  movieNights: z.boolean().optional(),
  awimmingPool: z.boolean().optional(),
  coffeeShop: z.boolean().optional(),
})

const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
  const [image, setImage] = useState<string | undefined>(hotel?.image);
  const [imageIsDeletin, setImageIsDeleting] = useState(false);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast();
  const router = useRouter();
  const {getAllCountries, getCountryStates, getStateCities} = useLocation();
  const countries = getAllCountries();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: hotel || {
      title: '',
      description: '',
      image: '',
      country: '',
      state: '',
      city: '',
      locationDescription: '',
      gym: false,
      spa: false,
      bar: false,
      laundry: false,
      restaurant: false,
      shopping: false,
      freeParking: false,
      bikeRental: false,
      freeWifi: false,
      movieNights: false,
      awimmingPool: false,
      coffeeShop: false,
    },
  })

  useEffect(() => {
    if(typeof image === 'string'){
      form.setValue('image', image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      })
    }
  }, [image]);

  useEffect(() => {
    const selectedCountry = form.watch('country');
    const countryStates = getCountryStates(selectedCountry);
    if(countryStates){
      setStates(countryStates)
    }
  }, [form.watch('country')]);


  useEffect(() => {
    const selectedCountry = form.watch('country');
    const selectedState = form.watch('state');
    const stateCities = getStateCities(selectedCountry, selectedState);
    if(stateCities){
      setCities(stateCities)
    }
  }, [form.watch('country'), form.watch('state')]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if(hotel){
      axios.patch(`/api/hotel/${hotel.id}`, values)
      .then((res)=>{
        toast({
          variant: 'success',
          description: 'Hotel updated successfully'
        })

        router.push(`/hotel/${res.data.id}`);
        setIsLoading(false);
      }).catch((err)=>{
        console.log('Error creating hotel', err);
        toast({
          variant: 'success',
          description: 'Someting went wrong!'
        })
        setIsLoading(false)
      })

    }else{
      axios.post('/api/hotel/', values).then((res)=>{
        toast({
          variant: 'success',
          description: 'Hotel created successfully'
        })

        router.push(`/hotel/${res.data.id}`);
        setIsLoading(false);
      }).catch((err)=>{
        console.log('Error creating hotel', err);
        toast({
          variant: 'success',
          description: 'Someting went wrong!'
        })
        setIsLoading(false)
      })
    }
  }

  const handleImageDelete = (image: string) => {
    setImageIsDeleting(true);
    const imageKey = image.substring(image.lastIndexOf('/') + 1);
    axios.post('/api/uploadthing/delete', {imageKey}).then((res)=>{
      if(res.data.success){
        setImage('');
        toast({
          variant:'success',
          description:"Image removed.",
        })
      }
    }).catch(()=>{
      toast({
        variant:'destructive',
        description:"Something went wrong",
      })
    }).finally(()=> {
      setImageIsDeleting(false);
    })
  }
  return (
    <div>
      <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="text-lg font-semibold">{hotel ? 'Update your hotel' : 'Describe your hotel!'}</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel title</FormLabel>
                  <FormDescription>
                    Provide your hotel name.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Beach Hotel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Description</FormLabel>
                  <FormDescription>
                    Provide a detailed description of your hotel.
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder="Beach Hotel is paked with many awesome amenitie!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Choose Amenities</FormLabel>
              <FormDescription>Choose Amenities pipular in your hotel</FormDescription>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                    name="gym"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Gym</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="spa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Spa</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="bar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Bar</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="laundry"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Laundry Facilities</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="restaurant"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Restaurant</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="shopping"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Shopping</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="freeParking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Free Parking</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="bikeRental"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Bike Rental</FormLabel>
                      </FormItem>
                  )}
                />

              <FormField
                  control={form.control}
                    name="freeWifi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Free Wifi</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="movieNights"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Movie Nights</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="awimmingPool"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Awimming Pool</FormLabel>
                      </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="coffeeShop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Coffee Shop</FormLabel>
                      </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
               control={form.control}
               name="image"
               render={({field}) => (
                 <FormItem className="flex flex-col space-y-3">
                   <FormLabel>Upload an Image *</FormLabel>
                   <FormDescription>Choose an image that will show-case your hotel nicely</FormDescription>
                   <FormControl>
                       {image ? 
                       <>
                         <div className="relative max-w-[400px] min-w-[200px]  max-h-[400px] min-h-[200px] mt-4">
                           <Image
                             fill
                             src={image}
                             alt="Hotel Image"
                             className="object-contain"
                           />
                            <Button onClick={()=> handleImageDelete(image)} type="button" size='icon' variant='ghost' className="absolute right-[-12px] top-0">
                              {imageIsDeletin ? <Loader2/> : <XCircle/>}
                            </Button>
                         </div>
                       </> 
                       : 
                       <>
                         <div className="flex flex-col items-center max-w-[4000px] p-12 border-2 border-dashed border-primary/50 rounded mt-4">
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                console.log('client upload complete', res);
                                setImage(res[0].url);
                                toast({
                                  variant: 'success',
                                  description: 'Upload  Completed'
                                })
                              }}
                              onUploadError={(error: Error) => {
                                toast({
                                  variant: 'destructive',
                                  description: `ERROR! ${error.message}`
                                })
                              }}
                            />
                         </div>
                       </>}
                   </FormControl>
                 </FormItem>
               )}
            />
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                 name="country"
                 render={({field})=>(
                  <FormItem>
                    <FormLabel>Select Country *</FormLabel>
                    <FormDescription>In which country is your property located?</FormDescription>
                    <Select
                      disabled = {isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue defaultValue={field.value} placeholder="Select a Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country)=> {
                          return <SelectItem key={country.isoCode} value={country.isoCode}>{country.name}</SelectItem>
                        })}
                        
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                 name="state"
                 render={({field})=>(
                  <FormItem>
                    <FormLabel>Select State *</FormLabel>
                    <FormDescription>In which state is your property located?</FormDescription>
                    <Select
                      disabled = {isLoading || states.length < 1}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue defaultValue={field.value} placeholder="Select a State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state)=> {
                          return <SelectItem key={state.isoCode} value={state.isoCode}>{state.name}</SelectItem>
                        })}
                        
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
                 name="city"
                 render={({field})=>(
                  <FormItem>
                    <FormLabel>Select City *</FormLabel>
                    <FormDescription>In which city is your property located?</FormDescription>
                    <Select
                      disabled = {isLoading || cities.length < 1}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue defaultValue={field.value} placeholder="Select a City" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city)=> {
                          return <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Description *</FormLabel>
                  <FormDescription>
                    Provide a detailed location description of your hotel.
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder="Located at very end of the beach road!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-2 flex-wrap">
              {hotel ? 
                <Button className="max-w-[150px]" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4"/>Updating</> : <><PencilLine className="mr-2 h-4 w-4"/> Update</>}
                </Button> 
              : 
              <>
                <Button className="max-w-[150px]" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4"/> Creating</> : <><Pencil className="mr-2 h-4 w-4"/> Create Hotel</>}
                </Button>
              </>}
            </div>
          </div>
        </div>
       </form>
      </Form>
    </div>
  )
}

export default AddHotelForm
