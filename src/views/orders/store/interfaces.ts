import { OrderStatus } from "@/interfaces";
import { FullClientProfile, PaginationParams, Product, ProductDescription } from "@/store/interfaces";

export interface Order {
  id: string
  status: OrderStatus
  user: FullClientProfile
  orderItems: OrderItem[]
  total: number
}

export interface OrderPutRequest {
  id?: string
  orderItems: { id: string, quantity: number }[]
}


export interface OrderRequestParams extends PaginationParams {
  status: OrderStatus[]
}
