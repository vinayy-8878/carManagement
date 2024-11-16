import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String,
    required: true,
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

carSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Car', carSchema);