const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker']
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: String,
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Índices
whatsappMessageSchema.index({ store: 1, timestamp: -1 });
whatsappMessageSchema.index({ messageId: 1 }, { unique: true });
whatsappMessageSchema.index({ from: 1, to: 1 });

const WhatsappMessage = mongoose.model('WhatsappMessage', whatsappMessageSchema);

module.exports = WhatsappMessage; 