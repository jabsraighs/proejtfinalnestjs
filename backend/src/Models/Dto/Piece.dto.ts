export class CreatePieceDto {
    name: string;
    type: string;
    cost:string;
    quantity: string;
    alertLimit: string;
  }
  
  export class UpdatePieceDto {
    name?: string;
    type?: string;    
    cost?:string;
    quantity?: string;
    alertLimit?: string;
  }
    export class DeletePieceDto {
    name?: string;
    type?: string;
    cost?:string;
    quantity?: string;
    alertLimit?: string;
  }