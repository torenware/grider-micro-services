import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketStatus } from '@grider-courses/common';

// Old plugin for autoincrement.
// tslint:disable-next-line: no-var-requires
const autoIncrement = require('mongoose-auto-increment');

// Define a "new user" TS interface to limit the
// attributes of a new user.
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
  orderId?: string;
  status?: TicketStatus;
  serial?: number;
}

// Add an interface to bless our extended User model.
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// Interface to describe a User document.
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
  status?: TicketStatus;
  serial?: number;
  isLocked(): Promise<boolean>;
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
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: false,
      default: null,
    },
    status: {
      type: String,
      required: false,
      default: null,
    },
    serial: {
      type: String,
      required: true,
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

// We want to implement OCC (Optimistic Concurrency Control) to enforce
// ordering of events.  This uses the following plugin.
// @see https://www.npmjs.com/package/mongoose-update-if-current
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// Test pre hook
ticketSchema.pre('save', async function (next) {
  const record = this as TicketDoc;
  console.log('pre hook was called');
  if (this.isNew) {
    console.log('Record is new');
    console.log(this);

    record.serial = 42;
  }
  next();
});

// Bundle a build func into the schema object.
// This imposes TS type checking on build.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

ticketSchema.methods.isLocked = function () {
  return !!this.orderId;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
