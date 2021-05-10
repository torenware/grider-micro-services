import mongoose from 'mongoose';
import { Ticket, TicketDoc } from './ticket';

// Old plugin for autoincrement.
// tslint:disable-next-line: no-var-requires
const autoIncrement = require('mongoose-auto-increment');

export const buildConnection = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  autoIncrement.initialize(conn);
  Ticket.schema.plugin(autoIncrement.plugin, {
    model: 'Ticket',
    field: 'serial',
    startAt: 1000,
  });
};
