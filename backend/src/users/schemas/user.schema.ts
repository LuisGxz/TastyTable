import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, enum: Object.values(UserRole), default: UserRole.Diner })
  role: UserRole;

  /** Set for owners: the restaurant they manage. */
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', default: null })
  restaurantId: Types.ObjectId | null;

  @Prop({ type: Number, default: 0 })
  failedLogins: number;

  @Prop({ type: Date, default: null })
  lockedUntil: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
