const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, adicione o nome da loja'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Por favor, adicione o endereço']
    },
    number: String,
    complement: String,
    neighborhood: {
      type: String,
      required: [true, 'Por favor, adicione o bairro']
    },
    city: {
      type: String,
      required: [true, 'Por favor, adicione a cidade']
    },
    state: {
      type: String,
      required: [true, 'Por favor, adicione o estado'],
      uppercase: true,
      maxlength: 2
    },
    zipCode: {
      type: String,
      required: [true, 'Por favor, adicione o CEP'],
      match: [/^\d{5}-?\d{3}$/, 'Por favor, adicione um CEP válido']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Por favor, adicione um telefone'],
      match: [/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Por favor, adicione um telefone válido']
    },
    whatsapp: String,
    email: {
      type: String,
      required: [true, 'Por favor, adicione um email'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor, adicione um email válido'
      ]
    }
  },
  whatsappApi: {
    controlId: {
      type: String,
      unique: true,
      sparse: true
    },
    host: String,
    instanceKey: {
      type: String,
      unique: true,
      sparse: true
    },
    token: String,
    webhook: String,
    isConnected: {
      type: Boolean,
      default: false
    },
    lastConnection: Date,
    qrCode: String
  },
  businessInfo: {
    cnpj: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Por favor, adicione um CNPJ válido']
    },
    type: {
      type: String,
      enum: ['restaurant', 'bar', 'cafe', 'bakery', 'pizzeria', 'other'],
      default: 'restaurant'
    },
    operatingHours: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      openTime: String,
      closeTime: String,
      isClosed: {
        type: Boolean,
        default: false
      }
    }],
    tables: {
      type: Number,
      default: 0
    },
    capacity: {
      type: Number,
      default: 0
    }
  },
  settings: {
    currency: {
      type: String,
      default: 'BRL'
    },
    timezone: {
      type: String,
      default: 'America/Sao_Paulo'
    },
    language: {
      type: String,
      default: 'pt-BR'
    },
    acceptsOnlineOrders: {
      type: Boolean,
      default: false
    },
    acceptsReservations: {
      type: Boolean,
      default: false
    },
    deliveryEnabled: {
      type: Boolean,
      default: false
    },
    deliveryRadius: {
      type: Number,
      default: 5
    },
    minimumOrderValue: {
      type: Number,
      default: 0
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    features: [{
      type: String
    }]
  },
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  images: {
    logo: String,
    cover: String,
    gallery: [String]
  },
  banners: [{
    image: String,
    title: String,
    description: String
  }],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para melhor performance
storeSchema.index({ name: 1 });
storeSchema.index({ slug: 1 });
storeSchema.index({ 'address.city': 1 });
storeSchema.index({ 'businessInfo.type': 1 });
storeSchema.index({ isActive: 1 });

// Criar slug automaticamente
storeSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

// Atualizar updatedAt
storeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Store', storeSchema); 