import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Define a "new user" TS interface to limit the
// attributes of a new user.
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
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

// Bundle a build func into the schema object.
// This imposes TS type checking on build.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
