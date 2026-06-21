import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PhotoStyle } from '../../common/enums';

export type RestaurantDocument = HydratedDocument<Restaurant>;

/** A bookable table belongs to one seating area and has a capacity. */
@Schema({ _id: false })
export class TableSpec {
  @Prop({ required: true }) label: string;
  @Prop({ required: true, min: 1 }) capacity: number;
  @Prop({ required: true }) area: string;
}
const TableSpecSchema = SchemaFactory.createForClass(TableSpec);

/** A highlighted dish shown on the restaurant detail screen. */
@Schema({ _id: false })
export class MenuItem {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) nameEs: string;
  @Prop({ required: true, min: 0 }) price: number;
  @Prop({ type: String, required: true }) photo: PhotoStyle;
}
const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) slug: string;

  @Prop({ required: true }) cuisine: string;
  @Prop({ required: true }) cuisineEs: string;
  /** 1–4 → rendered as $–$$$$. */
  @Prop({ required: true, min: 1, max: 4 }) priceLevel: number;
  @Prop({ required: true }) neighborhood: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) address: string;
  @Prop({ required: true, min: 0, max: 5 }) rating: number;

  @Prop({ required: true }) description: string;
  @Prop({ required: true }) descriptionEs: string;
  @Prop({ type: String, required: true }) photo: PhotoStyle;

  /** Seating areas guests can book into, e.g. ['Indoor', 'Patio', 'Bar']. */
  @Prop({ type: [String], default: ['Indoor'] }) seatingAreas: string[];

  @Prop({ type: [MenuItemSchema], default: [] }) menu: MenuItem[];
  @Prop({ type: [TableSpecSchema], default: [] }) tables: TableSpec[];

  /** Service window in "HH:mm" (24h) and slot granularity in minutes. */
  @Prop({ required: true, default: '17:00' }) openTime: string;
  @Prop({ required: true, default: '22:30' }) lastSeating: string;
  @Prop({ required: true, default: 30 }) slotMinutes: number;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null }) ownerId: Types.ObjectId | null;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
RestaurantSchema.index({ name: 'text', cuisine: 'text', neighborhood: 'text' });
