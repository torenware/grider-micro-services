// Singleton for tracking the current ID.
import mongoose from 'mongoose';

interface CounterAttr {
  name: string;
  counter: number;
}

// Add an interface to bless our extended User model.
interface CounterModel extends mongoose.Model<CounterDoc> {
  singleton(attrs: CounterAttr): Promise<CounterDoc>;
}

// Interface to describe a Counter document.
interface CounterDoc extends mongoose.Document {
  name: string;
  counter: number;
  serial(name: string): Promise<number>;
}

const counterSchema = new mongoose.Schema({
  name: {
    type: String, // mongoose type, not TS
    required: true,
  },
  counter: {
    type: Number,
    required: true,
  },
});

counterSchema.statics.singleton = async (attrs: CounterAttr) => {
  const record = new Serial(attrs);
  const returned = await Serial.find({ name: attrs.name });
  if (!returned.length) {
    await record.save();
    return record;
  }
  return returned[0];
};

counterSchema.methods.serial = async (name: string) => {
  const counter = await Serial.findOneAndUpdate(
    { name },
    {
      $inc: { counter: 1 },
    },
    {
      new: true,
    }
  );
  return counter?.counter;
};

const Serial = mongoose.model<CounterDoc, CounterModel>(
  'Serial',
  counterSchema
);

export { Serial };
