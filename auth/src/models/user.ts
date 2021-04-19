import mongoose from 'mongoose';

// Define a "new user" TS interface to limit the
// attributes of a new user.
interface UserAttrs {
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

const User = mongoose.model('User', userSchema);

// Create a builder func so we can let TS type check for us:
const buildUser = (attrs: UserAttrs) => {
  return new User(attrs);
};

export { User, buildUser };
