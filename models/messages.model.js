const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    message: String,
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = model('Message', UserSchema);
