import { useQuery } from '@tanstack/react-query';
import MarcaDataService from '../services/marcaDataService';
import ModeloDataService from '../services/modeloDataService';

export const useMarcas = () => {
  return useQuery({
    queryKey: ['marcas'],
    queryFn: async () => {
      const { data } = await MarcaDataService.getAll();
      return data;
    },
  });
};

export const useModelos = () => {
  return useQuery({
    queryKey: ['modelos'],
    queryFn: async () => {
      const { data } = await ModeloDataService.getAll();
      return data;
    },
  });
};
