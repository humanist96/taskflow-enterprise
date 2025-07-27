# 🚀 TaskFlow Enterprise - Vercel 배포 링크

## GitHub 리포지토리
✅ **성공적으로 푸시됨**: https://github.com/humanist96/taskflow-enterprise

## Vercel 배포 (클릭 한 번으로 배포!)

### 🔥 원클릭 배포 링크
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/humanist96/taskflow-enterprise)

위 버튼을 클릭하거나 아래 링크로 직접 접속:

👉 **https://vercel.com/import/git?s=https://github.com/humanist96/taskflow-enterprise**

### 배포 단계 (3분)

1. **Vercel 로그인**
   - GitHub 계정으로 로그인 권장

2. **프로젝트 Import**
   - 위 링크 클릭 시 자동으로 프로젝트 import 화면 표시
   - "Import" 버튼 클릭

3. **프로젝트 설정**
   ```
   Project Name: taskflow-enterprise
   Framework Preset: Other
   Root Directory: ./
   ```

4. **환경 변수 설정** (중요!)
   ```
   NODE_ENV = production
   SESSION_SECRET = taskflow-secret-key-2024-secure
   DATABASE_URL = [Supabase에서 복사한 URL]
   ```

5. **Deploy 클릭**

## 무료 PostgreSQL 설정 (Supabase)

### 빠른 설정 (2분)
1. 👉 https://supabase.com/dashboard
2. "New project" 클릭
3. 설정:
   - Organization: Personal
   - Name: `taskflow`
   - Database Password: 강력한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)`
4. "Create new project" 클릭
5. 프로젝트 생성 완료 후 (1-2분 대기)
6. Settings → Database → Connection string → URI 복사

### 데이터베이스 초기화
1. Supabase Dashboard → SQL Editor
2. "New query" 클릭
3. 이 파일 내용 복사/붙여넣기: `database/schema-pg.sql`
4. "Run" 클릭

## 예상 배포 URL

배포 완료 후 접속 가능한 URL:
- 🌐 **Production**: `https://taskflow-enterprise.vercel.app`
- 🔗 **Preview**: `https://taskflow-enterprise-[username].vercel.app`

## 배포 상태 확인

1. Vercel Dashboard: https://vercel.com/dashboard
2. 프로젝트 클릭
3. Deployments 탭에서 빌드 상태 확인

## 첫 사용자 등록

1. 배포된 사이트 접속
2. "회원가입" 클릭
3. 테스트 계정 생성:
   - Username: `admin`
   - Email: `admin@taskflow.com`
   - Password: `admin123`

## 문제 해결

### "500 Error" 발생
- DATABASE_URL이 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되었는지 확인 (1-2분 대기)
- Vercel Functions 로그 확인

### 로그인 안 됨
- SESSION_SECRET이 설정되었는지 확인
- 쿠키가 활성화되어 있는지 확인

---

## 🎉 축하합니다!

TaskFlow Enterprise가 곧 전 세계에서 접속 가능해집니다.
배포 완료 후 URL을 공유해주시면 함께 테스트해보겠습니다!