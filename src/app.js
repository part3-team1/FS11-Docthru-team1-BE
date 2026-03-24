// import express from 'express';

// export class App {
//   constructor() {
//     this.app = express();
//     this.middleware();
//     this.routes();
//     this.errorHandling();
//   }

//   middleware() {}
// }

import express from 'express';
import { setupSwagger } from './docs/swagger.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());


setupSwagger(app);

app.use(errorMiddleware);

export default app;