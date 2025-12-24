## 개요
Spring Events는 이벤트 기반 아키텍처를 스프링 애플리케이션 내에서 구현할 수 있도록 제공한다.
이는 Observer Pattern을 스프링 빈 기반으로 구현한 것이다.

## 왜 사용할까?
예를 들어 회원가입 로직이 있다고 해보자.
'회원 가입 시, 쿠폰을 지급하고 이메일로 메일을 전송하도록 한다'라는 요구사항이 있다고 가정해보자.

```java
public class MemberService {
    private CouponService couponService;
    private EmailService emailService;
    private MemberRepository memberRepository;

    void signUp(MemberDto dto) {
        memberRepository.save(Member.from(dto));
        
        couponService.publish(dto.getId());
        emailService.send(dto.getId());
        // 추가 요구사항 발생 가능!!
    }
}
```

이렇게 회원가입 로직이 구현되는데, 만약 '추천인을 추가해주세요. 포인트를 추가해주세요.' 등 요구사항이 많아질수록 Serivce 계층이 복잡해지고, 롤백이 까다로워진다. 이를 강한 경합이라고 한다.

반면 Spring Events를 사용하면 이를 느슨한 결합으로 변경할 수 있다.

```java
public class MemberService {
    private MemberRepository memberRepository;
    private ApplicationEventPublisher eventPublisher;

    void signUp(MemberDto dto) {
        memberRepository.save(Member.from(dto));

        eventPublisher.publishEvent(dto);
    }
}
```

## 주의 사항
1. 기본적으로 동기다.
publishEvent()를 호출하면, 리스너의 메소드가 끝날때까지 기다리게 된다.

2. 비동기로 만들 수 있다.
오래 걸리는 작업(이메일 발송 등)은 별도의 스레도에서 돌려야 하므로 @Async를 사용한다.

3. 트랜잭션 전파 관리
기존 EventListener의 경우, 트랜잭션을 지원하지 않는다. 따라서 이를 해결하기 위해 TransactionalEventListener

