import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';

@Entity('exercises') // Specify the table name in the database
export class Exercise extends BaseClassEntity {
  @Column({ type: 'varchar', length: 255 })
  exerciseId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  force: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  level: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mechanic: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  equipment: string;

  @Column({ type: 'simple-array' })
  primaryMuscles: string[];

  @Column({ type: 'simple-array' })
  secondaryMuscles: string[];

  @Column({ type: 'simple-array' })
  instructions: string[];

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'simple-array' })
  images: string[];
}
