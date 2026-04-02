import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { BadRequestException } from '#exceptions';
import { needsLogin } from '#middlewares';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export class ImageController extends BaseController {
  constructor() {
    super();
  }

  routes() {
    this.router.post(
      '/',
      needsLogin,
      upload.single('image'),
      (req, res, next) => this.uploadImage(req, res, next),
    );

    return this.router;
  }

  async uploadImage(req, res, next) {
    try {
      const file = req.file;

      if (!file) {
        throw new BadRequestException('이미지 파일이 필요합니다.');
      }

      const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const BUCKET_NAME = 'editor-images';

      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const uploadUrl = `${PROJECT_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          'Content-Type': file.mimetype,
        },
        body: file.buffer,
      });

      if (!response.ok) {
        throw new Error('Supabase 업로드 실패');
      }

      const publicUrl = `${PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;

      res
        .status(HTTP_STATUS.CREATED)
        .json({ success: true, data: { imageUrl: publicUrl } });
    } catch (error) {
      next(error);
    }
  }
}
