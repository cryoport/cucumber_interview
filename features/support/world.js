import { setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';

class CustomWorld {
  constructor({ attach, parameters }) {
    this.attach = attach;
    this.parameters = parameters || {};
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}

setWorldConstructor(CustomWorld);
setDefaultTimeout(60 * 1000);

export default CustomWorld;
