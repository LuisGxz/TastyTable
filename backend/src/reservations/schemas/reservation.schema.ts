import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReservationStatus } from '../../common/enums';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ timestamps: true })
export class Reservation {
  /** Human-facing confirmation code, e.g. TT-88412-PDX. */
  @Prop({ required: true, unique: true }) code: string;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** Denormalized for fast list rendering without populate. */
  @Prop({ required: true }) restaurantName: string;
  @Prop({ required: true }) guestName: string;

  /** The specific table held by this booking. */
  @Prop({ required: true }) tableLabel: string;
  @Prop({ required: true }) seatingArea: string;

  /** Booking slot: date as "YYYY-MM-DD" and time as "HH:mm" (local to the venue). */
  @Prop({ required: true }) date: string;
  @Prop({ required: true }) time: string;
  @Prop({ required: true, min: 1 }) partySize: number;

  @Prop({ type: String, required: true, enum: Object.values(ReservationStatus), default: ReservationStatus.Confirmed })
  status: ReservationStatus;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
// One table can hold only one active booking per date+time.
ReservationSchema.index({ restaurantId: 1, date: 1, time: 1, tableLabel: 1 });
