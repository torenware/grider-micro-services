import mongoose from 'mongoose';
import { Password } from '../services/password';

// Define a "new user" TS interface to limit the
// attributes of a new user.
interface UserAttrs {
  email: string;
  password: string;
}

// Add an interface to bless our extended User model.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface to describe a User document.
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String, // mongoose type, not TS
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Add password handling logic as a pre func
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// Bundle a build func into the schema object.
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
