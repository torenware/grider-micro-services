import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Define a "new user" TS interface to limit the
// attributes of a new user.
interface PaymentAttrs {
  stripeId: string;
  orderId: string;
  version: number;
}

// Add an interface to bless our extended User model.
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

// Interface to describe a Payment document.
// Note we do *not* save the order id.
interface PaymentDoc extends mongoose.Document {
  stripeId: string;
  orderId: string;
  version: number;
}

// Note that version is supplied by the superclass,
// since we're using the version plubin.
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String, // mongoose type, not TS
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
    version: {
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
paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

// Bundle a build func into the schema object.
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  // We want to reuse our order ID, so pass it in here.
  return new Payment({
    ...attrs,
  });
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  'Payment',
  paymentSchema
);

export { Payment };
