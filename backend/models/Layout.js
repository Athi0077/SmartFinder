import mongoose from 'mongoose';

const layoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Main Store',
    },
    rows: {
      type: [String],
      required: true,
      default: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    },
    columns: {
      type: [String],
      required: true,
      default: Array.from({ length: 26 }, (_, i) => (i + 1).toString()),
    },
    shelves: {
      type: [String],
      required: true,
      default: ['1', '2', '3', '4', '5'],
    },
    walls: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Layout', layoutSchema);
