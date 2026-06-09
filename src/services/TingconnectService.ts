import { getEnvVars } from '@/environment';
import HttpClient from './HttpClient';
import { RequestOptions } from './types';
import { of } from 'rxjs';

const {checkInUrl} = getEnvVars();

class TingconnectService {
  public Get = {
    
  };

  public Post = {
    //
  };

  public Put = {
    //
  };

  public delete = {
    //
  };
}

export const tingconnectService = new TingconnectService();
