# DI
## 개요
### 의존이란?
> 한 클래스가 다른 클래스의 메서드를 실행하는 것

### DI란?
- 필요한 객체를 직접 생성하지 않고 외부로부터 받아서 사용
- 장점
  - 객체 간의 결합도를 줄임
  - 코드 재사용성 상승
  - Test에 용이

## 의존성 주입 방식
### 1. 생성자 주입
```java
@RestController
public class TestController {
    private final TestService service;

    public TestController(TestService service) {
        this.service = service;
    }
}
```
- 장점
  - 불변성 확보
  - 애플리케이션 실행 시점에 순환 참조 방지
- 의존성
  - 생성자 파라미터가 길어지는 문제

### 2. 필드 주입
```java
@RestController
public class TestController {
    @Autowired
    private final TestService service;
}
```
- 단점
  - 외부 변경 어려움
  - 프레임워크에 의존적

### 3. 세터 주입
- 장점
  - 실행 중 의존성 변경할 대 유용
  - 선택적 의존성
- 단점
  - 런타임 오류 위험
  - 객체 변경 가능성

<br/>

# 빈 생명주기
- 객체 생성부터 소멸까지 IoC 컨테이너가 관리

1. 컨테이너 생성
2. 스프링 빈 생성
3. DI
4. 초기화 콜백
5. 사용
6. 소멸 콜백

## 빈 등록 방법
### 1. 컴포넌트 스캐과 자동 의존관계 설정
- @Controller, @Service, @Repository (@Component)

### 2. 자바 코드로 직접 스프링 빈 등록
- 자바 설정 클래스를 만들어 사용
- @Configuration

## 빈 관리 도구
- BeanFactory: 빈의 생성과 의존관계 설정 담당
- ApplicationContext: BeanFactory를 상속받아, 국제화, 이벤트 발행, 환경 변수 관리 등 담당


## 의존성 주입 과정
![image](https://img1.daumcdn.net/thumb/R960x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcwgWa4%2FbtryPrbPuYV%2FAAAAAAAAAAAAAAAAAAAAAClEViS_Vftcxj-B4QItDxSc49eyBcicm7BUiRWkWbGw%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DsetsIktgr6fFtTXmRHVkUViWEks%253D)

- IoC 컨테이너에선 Map으로 스프링 빈을 관리
- 빈의 ID를 Key, BeanDefinition을 Value로 저장
- ConcurrentHashMap 사용

### 컴포넌트 스캔
- @ComponentScan이 지정된 패키지 하위 클래스들을 스캔
- @Component 계열 애노테이션이 붙은 클래스 발견 시, BeanDefinition을 생성하고 Map에 등록

### 자바 설정으로 빈 등록
![image2](https://img1.daumcdn.net/thumb/R960x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdE7vZf%2FbtryI58l06O%2FAAAAAAAAAAAAAAAAAAAAAPv6UIo4VzpO1pOCBjqV6WsXLgU-3bRVIjCVYsVyNWcJ%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1769871599%26allow_ip%3D%26allow_referer%3D%26signature%3DhRq1dZaR2YEMlqDNArPydKbxTuM%253D)

- CGLIB 프록시로 @Configuration이 붙은 클래스의 프록시 객체 생성
- 이미 컨테이너에 빈이 있으면 기존 객체 반환

## 콜백
```java
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy; 
public class ExampleBean {     
    @PostConstruct    
    public void initialize() throws Exception {        
        // 초기화 콜백 (의존관계 주입이 끝나면 호출)    
    }     
    @PreDestroy    
    public void close() throws Exception {        
        // 소멸 전 콜백 (메모리 반납, 연결 종료와 같은 과정)    
    }
}
```
