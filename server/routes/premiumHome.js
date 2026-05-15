import { Router } from 'express';
import { getPremiumHome } from '../controllers/premiumHomeController.js';

const r = Router();
// Premium ana sayfa datası: kimlik gerektirmez; görünürlük front’ta/diğer sayfalarda sınırlandırılacak
r.get('/home', getPremiumHome);
export default r;
