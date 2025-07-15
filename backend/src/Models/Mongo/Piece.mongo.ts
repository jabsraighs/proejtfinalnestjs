import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';

@Entity('piece')
export class PieceMongo {
  @ObjectIdColumn()
  _id?: string;

  @Column({ type: 'string', nullable: false })
  id: string;

  @Column({ type: 'string', nullable: false })
  name: string;

  @Column({ type: 'string', nullable: false})
  type: string;

  @Column({ type: 'string', nullable: false })
  cost: string;

  @Column({ type: 'string', nullable: false })
  quantity: string;

  @Column({ type: 'string', nullable: false })
  alertLimit: string;
}