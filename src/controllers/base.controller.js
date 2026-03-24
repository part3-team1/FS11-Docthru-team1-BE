import express from 'express';

export class BaseController {
  constructor() {
    this.router = express.Router();
  }

  routes() {
    throw new Error('메서드가 구현되지 않았습니다.');
  }
}
