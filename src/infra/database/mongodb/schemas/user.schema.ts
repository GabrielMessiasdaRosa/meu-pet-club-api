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

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: RoleEnum })
  role: RoleEnum;
}

export const UserSchemaDocument = SchemaFactory.createForClass(UserSchema);
