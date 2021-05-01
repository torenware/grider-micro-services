import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@grider-courses/common';

// Define a "new user" TS interface to limit the
// attributes of a new user.
interface OrderAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  version: number;
  price: number;
}

// Add an interface to bless our extended User model.
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// Interface to describe a Order document.
// Note we do *not* save the order id.
interface OrderDoc extends mongoose.Document {
  userId: string;
  version: number;
  status: OrderStatus;
  price: number;
}

// Note that version is supplied by the superclass,
// since we're using the version plubin.
const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String, // mongoose type, not TS
      required: true,
    },
    userId: {
      type: String, // mongoose type, not TS
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
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
      },
    },
  }
);

// We want to implement OCC (Optimistic Concurrency Control) to enforce
// ordering of events.  This uses the following plugin.
// @see https://www.npmjs.com/package/mongoose-update-if-current
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

// Bundle a build func into the schema object.
orderSchema.statics.build = (attrs: OrderAttrs) => {
  // We want to reuse our order ID, so pass it in here.
  return new Order({
    ...attrs,
    _id: attrs.id,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
