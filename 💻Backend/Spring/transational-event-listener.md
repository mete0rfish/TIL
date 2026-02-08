## 개요
Spring Boot의 **@TransactionalEventListener**는 이벤트 리스너가 **데이터베이스 트랜잭션의 단계(Phase)**에 맞춰 실행되도록 제어하는 어노테이션입니다.
일반적인 `@EventListener`와 달리, 이벤트를 발행한 시점이 아니라 트랜잭션이 커밋되거나 롤백되는 시점에 로직을 수행해야 할 때 필수적으로 사용됩니다.

## 1. 왜 필요한가요? (등장 배경)
일반적인 `@EventListener`를 사용할 때 발생할 수 있는 두 가지 주요 문제가 있습니다.

1. 데이터 불일치 문제 (Race Condition)
   메인 로직에서 데이터를 INSERT 하고 이벤트를 발행했는데, 리스너가 비동기(@Async)로 동작하여 트랜잭션이 커밋되기 전에 데이터를 조회하려고 하면 데이터가 없어 에러가 발생합니다.
2. 트랜잭션 결합도 문제:회원 가입 후 "환영 이메일 발송" 로직이 실패했다고 해서, 이미 성공한 "회원 가입" 자체를 롤백(취소)시키는 것은 비즈니스적으로 맞지 않을 수 있습니다. 이메일은 실패하더라도 회원 가입은 유지되어야 합니다.@TransactionalEventListener는 이벤트를 트랜잭션의 커밋 이후(AFTER_COMMIT) 등의 시점으로 미루어 실행함으로써 이러한 문제를 해결합니다.

## 2. 동작 단계 (Phase)
phase 속성을 통해 리스너가 실행될 시점을 지정할 수 있습니다.
| 단계 (Phase) | 설명 | 기본값 여부 |
|:------------:|----|----------|
| AFTER_COMMIT | 트랜잭션이 성공적으로 커밋된 후 실행됩니다. |O (Default) |
| AFTER_ROLLBACK | 트랜잭션이 롤백된 후 실행됩니다. (예: 실패 로그 저장, 알림) |  |
| AFTER_COMPLETION | 트랜잭션이 완료된 후(커밋 또는 롤백 무관) 실행됩니다. |  |
| BEFORE_COMMIT | 트랜잭션이 커밋되기 직전에 실행됩니다.|  |

## 3. 사용 예제

코드상황: 사용자가 회원 가입을 하면 환영 이메일을 보냅니다. 이메일 전송은 회원 데이터가 DB에 완전히 저장된 후에 이루어져야 합니다.

### 3.1. 이벤트 클래스
```Java
public record MemberJoinedEvent(Long memberId, String email) {}
```

### 3.2. 서비스 (이벤트 발행)
```Java@
Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public void join(String email, String name) {
        // 1. 회원 저장 (아직 커밋 전)
        Member member = memberRepository.save(new Member(email, name));
        
        // 2. 이벤트 발행
        // 일반 EventListener라면 여기서 즉시 실행되지만, 
        // TransactionalEventListener는 트랜잭션 종료 시점까지 대기합니다.
        publisher.publishEvent(new MemberJoinedEvent(member.getId(), member.getEmail()));
    }
}
```

### 3.3. 이벤트 리스너
```Java
@Component
@RequiredArgsConstructor
@Slf4j
public class MemberEventListener {

    private final EmailService emailService;

    // 트랜잭션이 성공적으로 커밋된 후에만 실행됨
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMemberJoined(MemberJoinedEvent event) {
        log.info("회원 가입 커밋 완료. 이메일 발송 시작: {}", event.email());
        emailService.sendWelcomeEmail(event.email());
    }
}
```

## 4. 주의사항 및 핵심 팁 (Advanced)
이 부분이 실무에서 가장 많이 실수하는 포인트입니다.
### 1. 비동기 처리가 아닙니다 (Sync vs Async)
`@TransactionalEventListener`를 쓴다고 해서 자동으로 별도의 스레드에서 실행되는 것은 아닙니다.
기본 동작: AFTER_COMMIT 단계가 되면, 원래 트랜잭션을 수행하던 스레드가 리스너 코드를 **동기적(Synchronous)**으로 실행합니다.

문제: 리스너에서 예외가 발생하거나 시간이 오래 걸리면, 클라이언트에게 응답이 늦게 가거나(Response 지연), 리스너의 예외가 상위로 전파될 수 있습니다.

해결: 비동기로 실행하려면 **@Async**를 함께 붙여야 합니다.
```Java
@Async // 별도 스레드에서 실행
@TransactionalEventListener
public void handleAsync(MemberJoinedEvent event) { ... }
```

### 2. 리스너 내부에서의 DB 쓰기 (트랜잭션 전파)
AFTER_COMMIT 단계에서 실행되는 리스너는 이미 메인 트랜잭션이 닫힌(혹은 커밋이 완료된) 상태입니다.

문제: 리스너 내않거나 에러가 발생할부에서 save()나 update() 같은 DB 쓰기 작업을 시도하면 반영되지  수 있습니다. (기존 트랜잭션은 이미 끝났기 때문)

해결: 리스너에서 DB 작업을 하려면 새로운 트랜잭션을 열어야 합니다. (REQUIRES_NEW)

```Java
@Transactional(propagation = Propagation.REQUIRES_NEW) // 새 트랜잭션 필수
@TransactionalEventListener
public void saveNotificationLog(MemberJoinedEvent event) {
    notificationRepository.save(new Notification(event.memberId()));
}
```

### 3. 트랜잭션이 없을 때의 동작 (fallbackExecution)
이벤트를 발행하는 곳(MemberService.join)에 @Transactional이 없다면 어떻게 될까요?
기본적으로 `@TransactionalEventListener`는 동작하지 않습니다. (트랜잭션에 바인딩되어야 하기 때문)
트랜잭션 여부와 상관없이 항상 실행되게 하려면 fallbackExecution = true로 설정해야 합니다.

```Java
@TransactionalEventListener(fallbackExecution = true)
public void handleAnyTime(MemberJoinedEvent event) { ... }
```

## 5.. 요약: 언제 써야 할까?
| 구분 | @EventListener | @TransactionalEventListener |
|:----:|:--------------|:----------------------------|
| **실행 시점** | publishEvent() 호출 즉시 | 트랜잭션 단계(Commit, Rollback 등)에 맞춰서 |
| **주 사용처** | 로깅, 트랜잭션과 무관한 단순 로직 | 후처리 로직 (알림 발송, 타 서비스 호출, 데이터 동기화) |
| **데이터 일관성** | 트랜잭션 중간이라 데이터 조회 시 정합성 문제 가능 | 커밋 후 실행되므로 데이터 정합성 보장됨 (AFTER_COMMIT) |

