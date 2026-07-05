# 기본 문법
## 클라이언트 기준
### Operation
서버 요청하는 동작
- Query: 데이터 조회
- Mutation: 데이터 수정이나 추가하고, 서버에서 결과값을 반환
- Subscription: 실시간 데이터를 받기

### Selection Set
서버로 부터 받는 정보를 {}로 감싼 형태
```graphql
query {
    products {
        id
        name
        price
        productType
    }
}
```
- query 오퍼레이션으로 products 필드의 중첩필드로 id, name 등을 받아오는 것

### Selection Set 타입
- Scalar: 원시 값
  - int ,Float, String Boolean, ID
  - id는 string과 같지만 문서화 및 의도를 나타내기에 중요
- Custom Scalar
  - Data, DateTime 처럼 직접 지정해 사용
  - 서버에서 추가 설정 필요
  - Node나 Spring에선 라이브러리 제공
- Enum
  ```graphql
  enum ProductType {
    ELECTRONICS
    CLOTHING
  }
  ```
- Non-Null
  - Int!
- List
  - **[Int]**: [] [null, 1], null
  - **[Float!]** : [] [1.1, 2.1], null
  - **[String]!** : [] [null, "ddd"]
  - **[Boolean!]!** : [], [true, false]

