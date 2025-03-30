## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

# Chapter 1

## ORM

- https://www.prisma.io/
- https://orm.drizzle.team/

# Chapter 3

## fonts

next/font module을 사용할 때, font을 자동으로 최적화. 빌드 시점에 font 파일을 다운로드 하여 다른 정적 에셋과 함께 호스팅
사용자가 애플리케이션을 방문할 때 성능에 영향을 줄 수 있는 글꼴에 대한 추가 네트워크 요청이 없음

## image

### next/image를 사용할 때 이점

- 이미지가 로딩될 때 자동으로 layout shift 방지
- 더 작은 화면 크기를 가진 큰 이미지를 전송하지 않도록 이미지 크기 조정
- 기본적으로 지연 로딩 적용 (이미지가 뷰포트에 들어올 때 로드됨)
- 브라우저가 지원하는 경우 WebP 및 AVIF와 같은 최신 형식으로 이미지 제공
