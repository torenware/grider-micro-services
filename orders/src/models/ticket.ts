import mongoose from 'mongoose';
import { OrderStatus } from '@grider-courses/common';
import { Order } from './orders';

// Note this is not the same as the Ticket service's definition.

interface TicketAttrs {
  title: string;
  price: number;
}

// Add an interface to bless our extended User model.
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// Interface to describe a Ticket document.
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String, // mongoose type, not TS
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    // We want to normalize mongodb's output by removing
    // the password and the mongo version, and map the
    // id to something standard.
    toJSON: {
      // Trace over TS docs for toJSON, and find the transform
      // property, which modifies the ret object.
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Bundle a build func into the schema object.
// This imposes TS type checking on build.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

// Factor some methods and put them here.  We need to use "this",
// so arrow functions won't work:

// tslint:disable-next-line: only-arrow-functions
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  // Make sure we return a boolean:
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
