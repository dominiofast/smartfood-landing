import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import WhatsappApiSettings from './WhatsappApiSettings';
import type { SimpleStore } from '../types/store';

// Schema para edição de loja
const editStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  description: yup.string(),
  contact: yup.object({
    phone: yup.string().required('Telefone é obrigatório'),
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    whatsapp: yup.string()
  }),
  address: yup.object({
    street: yup.string().required('Endereço é obrigatório'),
    number: yup.string(),
    complement: yup.string(),
    neighborhood: yup.string().required('Bairro é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório'),
    zipCode: yup.string().required('CEP é obrigatório')
  }),
  whatsappApi: yup.object({
    controlId: yup.string(),
    host: yup.string(),
    instanceKey: yup.string(),
    token: yup.string(),
    webhook: yup.string()
  })
});

type EditStoreFormData = yup.InferType<typeof editStoreSchema>;

interface EditStoreFormProps {
  store: SimpleStore;
  onSubmit: (data: EditStoreFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditStoreForm: React.FC<EditStoreFormProps> = ({
  store,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { user } = useAuth();
  
  const methods = useForm<EditStoreFormData>({
    resolver: yupResolver(editStoreSchema),
    defaultValues: {
      name: store.name,
      description: store.description || '',
      contact: {
        phone: store.contact_phone || store.phone || '',
        email: store.contact_email || store.email || '',
        whatsapp: store.contact?.whatsapp || ''
      },
      address: {
        street: store.address_street || store.address || '',
        number: '',
        complement: '',
        neighborhood: '',
        city: store.address_city || store.city || '',
        state: store.address_state || store.state || '',
        zipCode: store.address_zip_code || store.zip_code || ''
      },
      whatsappApi: {
        controlId: store.whatsappApi?.controlId || '',
        host: store.whatsappApi?.host || '',
        instanceKey: store.whatsappApi?.instanceKey || '',
        token: store.whatsappApi?.token || '',
        webhook: store.whatsappApi?.webhook || ''
      }
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">
            Gerenciar Loja
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Loja *
                    </label>
                    <input
                      {...methods.register('name')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      {...methods.register('description')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      {...methods.register('contact.phone')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.contact?.phone && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.contact.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      {...methods.register('contact.email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.contact?.email && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.contact.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      {...methods.register('contact.whatsapp')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua *
                    </label>
                    <input
                      {...methods.register('address.street')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.address?.street && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.address.street.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      {...methods.register('address.number')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      {...methods.register('address.complement')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      {...methods.register('address.neighborhood')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.address?.neighborhood && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.address.neighborhood.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      {...methods.register('address.city')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.address?.city && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.address.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      {...methods.register('address.state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                    {methods.formState.errors.address?.state && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.address.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <input
                      {...methods.register('address.zipCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {methods.formState.errors.address?.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{methods.formState.errors.address.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* WhatsApp API Settings */}
              <WhatsappApiSettings isVisible={user?.role === 'superadmin'} />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
};

export default EditStoreForm; 