import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PetSchemaDocument = HydratedDocument<PetSchema>;

@Schema({
  timestamps: true,
})
export class PetSchema {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String })
  breed?: string;

  @Prop({ type: Number })
  age?: number;

  @Prop({ type: String, required: true })
  userId: string;
}

export const PetSchemaDocument = SchemaFactory.createForClass(PetSchema);
