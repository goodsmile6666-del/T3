# 행정정보 통합관리 기본법 조항 검색

첨부된 조항 데이터를 읽어 15개 조항을 카드로 표시하고, 본문 키워드로 필터링하는 정적 웹페이지입니다.

## 로컬 실행

브라우저의 보안 정책상 `index.html`을 직접 열기보다 정적 서버로 실행해야 합니다.

```powershell
python -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## Vercel 배포

이 폴더를 Git 저장소에 올려 Vercel에서 가져오거나, Vercel CLI로 프로젝트 루트에서 배포할 수 있습니다. 빌드 명령은 필요하지 않습니다.

```powershell
npx vercel
```
