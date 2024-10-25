import { create } from 'zustand'
import { round2 } from '../utils'
//import { OrderItem, ShippingAddress } from '../models/OrderModel'
import { persist } from 'zustand/middleware'

type Cart = {
  items: OrderItem[]
  itemsPrice: number
  taxPrice: number
  shippingPrice: number
  totalPrice: number

  paymentMethod: string
  shippingAddress: ShippingAddress
}
const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0,
  paymentMethod: 'PayPal',
  shippingAddress: {
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  },
}

export const cartStore = create<Cart>()(
  persist(() => initialState, {
    name: 'cartStore',
  })
)

export default function useCartService() {
  const {
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    shippingAddress,
  } = cartStore()
  return {
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    shippingAddress,
    increase: (item: OrderItem) => {

      const exist = items.find(
        (x) =>
          x.slug === item.slug &&
          x.properties?.length === item.properties?.length && // Check if the length of the properties matches
          x.properties?.every((prop, index) => 
            prop.propertyId === item.properties?.[index]?.propertyId && 
            prop.value === item.properties?.[index]?.value
          ) // Compare each property
      )
    
      const updatedCartItems = exist
        ? items.map((x) =>
            x.slug === item.slug &&
            x.properties?.length === item.properties?.length &&
            x.properties?.every((prop, index) => 
              prop.propertyId === item.properties?.[index]?.propertyId && 
              prop.value === item.properties?.[index]?.value
            )
              ? { ...exist, qty: exist.qty + 1 }
              : x
          )
        : [...items, { ...item, qty: 1 }]

      const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calcPrice(updatedCartItems)

      cartStore.setState({
        items: updatedCartItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      })
    },
    decrease: (item: OrderItem) => {
      const exist = items.find(
      (x) =>
      x.slug === item.slug &&
      x.properties?.length === item.properties?.length && // Check if the length of the properties matches
      x.properties?.every((prop, index) => 
        prop.propertyId === item.properties?.[index]?.propertyId &&
        prop.value === item.properties?.[index]?.value
      ) // Compare each property
      )

      if (!exist) return

      const updatedCartItems =
        exist.qty === 1
        ? items.filter(
          (x: OrderItem) =>
            x.slug !== item.slug ||
            !(x.properties?.length === item.properties?.length &&
              x.properties?.every((prop, index) => 
                prop.propertyId === item.properties?.[index]?.propertyId &&
                prop.value === item.properties?.[index]?.value
              )
            ) // Ensure filtering based on both slug and properties
        )
        : items.map((x) =>
          x.slug === item.slug &&
          x.properties?.length === item.properties?.length &&
          x.properties?.every((prop, index) => 
            prop.propertyId === item.properties?.[index]?.propertyId &&
            prop.value === item.properties?.[index]?.value
          )
            ? { ...exist, qty: exist.qty - 1 }
            : x
        )
      
      const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calcPrice(updatedCartItems)

      cartStore.setState({
        items: updatedCartItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      })
    },
    saveShippingAddrress: (shippingAddress: ShippingAddress) => {
      cartStore.setState({
        shippingAddress,
      })
    },
    savePaymentMethod: (paymentMethod: string) => {
      cartStore.setState({
        paymentMethod,
      })
    },
    clear: () => {
      cartStore.setState({
        items: [],
      })
    },
    init: () => cartStore.setState(initialState),
  }
}

const calcPrice = (items: OrderItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + item.price * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(Number(0.16 * itemsPrice)),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice)
  return { itemsPrice, shippingPrice, taxPrice, totalPrice }
}
