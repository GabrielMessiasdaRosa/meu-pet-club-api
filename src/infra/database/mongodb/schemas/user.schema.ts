import { RoleEnum } from '@/common/enums/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type UserSchemaDocument = HydratedDocument<UserSchema>;

@Schema({
  timestamps: true,
})
export class UserSchema {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ required: true, enum: RoleEnum })
  role: RoleEnum;

  @Prop({ type: String, default: null })
  resetToken?: string | null;

  @Prop({ type: Date, default: null })
  resetTokenExpires?: Date | null;
}

export const UserSchemaDocument = SchemaFactory.createForClass(UserSchema);
