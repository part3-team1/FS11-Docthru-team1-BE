# DOCTHRU BE 설명

## 환경 설정

프로젝트 루트에 `env` 폴더를 생성해주세요.

- **개발용:** `env/.env.development`
- **운영용:** `env/.env.production`

---

## 설치 및 실행 순서

### 1. 의존성 설치

패키지 매니저로 `pnpm` 사용합니다.

```bash
pnpm install
```

### 2. 데이터베이스 동기화

```bash
pnpm run prisma:generate
pnpm run prisma:push
```

### 3. 서버실행

```bash
pnpm run dev
```

## 사용 기술 스택 / 라이브러리

node.js, express, postgresSQL, prisma /
zod, bycript, axios, faker(seeding)

## 디렉터리 구조

```text
src
├─ common
├─ config
├─ controllers
├─ db
├─ docs
├─ middlewares
├─ providers
├─ repository
├─ routes
├─ services
└─ utils
```