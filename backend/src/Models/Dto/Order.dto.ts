export class OrderDto {
    pieces: object[];
    orderDate: string;
    deliveryDate: string;
    totalAmount:string;
    status:string;
    
}

export class UpdateOrderDto {
    pieces?: object[];
    orderDate?: string;
    deliveryDate?: string;
    totalAmount?:string;
    status?:string;
   
}
export class DeleteOrderDto {
    pieces?: object[];
    orderDate?: string;
    deliveryDate?: string;
    totalAmount?:string;
    statust?:string;
    
}