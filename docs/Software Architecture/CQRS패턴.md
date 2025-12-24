# 개요
CQRS는 명령과 쿼리의 역할 분리를 의미한다.
DB 저장 시스템은 두 가지로 나뉨
- Commad
  - 데이터를 변형할 때 수행하는 작업
  - 예) 새로운 사용자 추가, 리뷰 업데이트 등
- Query
  - 데이터를 읽기만 하며, 호출자에게 반환
  - 예) SQL의 SELECT

## 목적
구체화된 뷰 패턴보다 더 총체적인 문제를 해결 할 수 있다.

기존 구체화된 뷰 패턴은 source of truth가 하나 이상의 기본 테이블이다.
단일 쿼리 또는 소규모 서브셋 쿼리의 성능 향상으 ㄹ위해 다른 데이터베이스에 샐운 테이블 생성

빈먄 CQRS는 명령 파트와 쿼리 파트를 완전 분리
- Command Service: 비즈니스 로직, 유효성 검사, 권한 부여 등 복잡한 작업
- Query Service: 읽기 전용 서비스

Command DB를 Query DB로 복제한다.

## 장점
- CUD, Read에 맞게 데이터베이스 선택 및 튜닝 가능

## 동기화
### Message Broker 사용
쉽게 Command 파트에 데이터 변형 욫ㅇ이 수신될 때마다 Query 파트에 이벤트 발행하면 됨.
이를 위래 메시지 브로커를 배치하면 된다.

그렇다면 어떻게 단일 트랜잭션으로 Command가 수신하는 각 명령 요청이 DB에도 들어가도록 하는가?

우리가 배운 Transactional Outbox 패턴을 사용하면 된다.

### Function As A Service 사용
서비스형 함수를 생성해 명령 데이터베이스 수정을 감시
이때 Cloud Function은 비용이 없다.
만약 데이터 업데이트가 생기면 커스텀 코드 실행 시켜 쿼리 데이터 베이스 업데이트

## 문제점
- 동기화 문제를 해결해도 CommandDB와 QueryDB 간의 최종적 일관성만 보장된다. 그런데 만약 엄격한 일관성이 필요한 경우 적합하지 않다.
- 상당한 정도의 오버헤드와 복잡성이 시스템에 더해진다.


# 사용 사례
클라이언트가 제품을 둘러보는 온라인 스토어
- 평균 평점
- 리뷰 조회
- 리뷰 작성

이 경우, 두 가지로 나눌 수 있다.
- Command : Reviews, Users, Products, Orders (RDB)
- Query : Reviews (NoSQL)


# Materialized View + CQRS
타 MicroService와 달리 읽기만 수행하는 QueryService는 원본 데이터로 부터 Materialized View를 받아 사용한다.

동기화를 위해 MessageBroker를 사용해, 타 MSA에서 메시지가 오면 그때그때 동기화하는 방식을 사용할 수 있다.

## 사용 사례
온라인 교육 플랫폼
- API 게이트웨이: 모든 요청은 외부 API 호출을 시스템 내의 해당 MSA로 라우팅하는 서비스
- Courses Service: 강의 이름, 강의 설명, 강의 가격
- Reviews Service: 학생ID, 리뷰 텍스트, 스타 레이팅, 리뷰 수

만약 강의 검색 요구사항이 들어올 경우, Course의 강의 이름, 강의 가격, 스타 레이팅, 리뷰 수만 가져와서 조회하기만 하는 CourseSearch Materialized View를 만들어 사용할 수 있다.

만약 동기화가 필요할 경우, MessageBroker를 이용하여 동기화가 가능하다.

