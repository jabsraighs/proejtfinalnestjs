import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';

@Entity('order')
export class OrderMongo {
  @ObjectIdColumn()
  _id?: string;

  @Column({ type: 'string', nullable: false })
  id: string;

  @Column('array')
  pieces: object[];

  @Column({ type: 'string', nullable: false })
  totalAmount: string;
  
  @Column({ type: 'string', nullable: false })
  status: string;

  @Column({ type: 'string', nullable: false })
  orderDate: string;
  
  @Column({ type: 'string', nullable: false })
  deliveryDate: string;
  


}