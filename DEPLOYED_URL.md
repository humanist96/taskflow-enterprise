# 🎉 TaskFlow Enterprise 배포 완료!

## ✅ 배포된 URL
🌐 **https://taskflow-enterprise.vercel.app**

## ⚠️ 환경 변수 설정 필요!

현재 사이트는 배포되었지만 환경 변수가 설정되지 않아 제대로 작동하지 않습니다.

### 환경 변수 설정하기 (2분)

1. **Vercel 대시보드 접속**
   👉 https://vercel.com/humanist96s-projects/taskflow-enterprise/settings/environment-variables

2. **환경 변수 추가** (Add 버튼 클릭 후 각각 추가)
   ```
   Name: NODE_ENV
   Value: production
   Environment: Production
   
   Name: SESSION_SECRET
   Value: taskflow-secret-key-2024-secure-humanist96
   Environment: Production
   
   Name: DATABASE_URL
   Value: [Supabase에서 복사한 URL]
   Environment: Production
   ```

3. **재배포** (환경 변수 추가 후)
   - Deployments 탭 → 최신 배포 옆 "..." 클릭 → "Redeploy"

## 🗄️ Supabase 데이터베이스 설정

### 1. 데이터베이스 생성 (아직 안 했다면)
1. 👉 https://supabase.com/dashboard
2. "New project" 클릭
3. 설정:
   - Organization: Personal
   - Name: `taskflow`
   - Database Password: 강력한 비밀번호
   - Region: `Northeast Asia (Seoul)`
4. "Create new project" 클릭

### 2. Connection String 복사
1. Settings → Database
2. Connection string → URI 탭
3. 전체 URL 복사 (postgres://로 시작하는 문자열)

### 3. 데이터베이스 초기화
1. SQL Editor 탭
2. "New query" 클릭
3. GitHub에서 `database/schema-pg.sql` 내용 복사
   👉 https://github.com/humanist96/taskflow-enterprise/blob/master/database/schema-pg.sql
4. 붙여넣기 후 "Run" 클릭

## 🔍 배포 상태 확인

- **프로젝트 대시보드**: https://vercel.com/humanist96s-projects/taskflow-enterprise
- **배포 로그**: https://vercel.com/humanist96s-projects/taskflow-enterprise/deployments
- **함수 로그**: https://vercel.com/humanist96s-projects/taskflow-enterprise/logs

## 📱 첫 사용

1. https://taskflow-enterprise.vercel.app 접속
2. "회원가입" 클릭
3. 계정 생성:
   - Username: 원하는 이름
   - Email: 이메일 주소
   - Password: 비밀번호

## 🐛 문제 해결

### "Application Error" 표시
- 환경 변수가 설정되지 않았습니다
- 위의 환경 변수 설정 단계를 따라주세요

### "Database Connection Error"
- DATABASE_URL이 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되었는지 확인
- Connection string이 완전히 복사되었는지 확인

### 로그인이 안 될 때
- SESSION_SECRET이 설정되었는지 확인
- 브라우저 쿠키 확인

---

## 🚀 다음 단계

1. 환경 변수 설정 (위 가이드 참고)
2. 데이터베이스 초기화
3. 재배포
4. 사이트 테스트

모든 설정이 완료되면 전문가급 업무 관리 플랫폼을 사용할 수 있습니다!