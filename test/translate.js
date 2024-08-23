import 'dotenv/config';
import { translate } from '../src/translate.js';

translate('你好').then((result) => {
  console.log(result);
});
