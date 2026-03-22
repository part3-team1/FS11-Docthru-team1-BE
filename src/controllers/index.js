import { format } from 'date-fns';
import { BaseController } from './base.controller.js';
import { HTTP_STATUS } from '#constants';

export class Controller extends BaseController {
  constructor() {
    super();
  }

  routes() {
    //

    this.router.get('./ping', (req, res) => this.ping(req, res));

    return this.router;
  }

  ping(req, res) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `서버 상태 정상 - 현재 시간: ${formattedTime}`;

    res.status(HTTP_STATUS.OK).json({ success: true, message });
  }
}
