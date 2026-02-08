# ThreadLocal: 각 스레드만의 비밀 보관함
자바 멀티스레드 환경에서 데이터 공유는 언제나 골칫거리입니다.
여러 스레드가 동시에 같은 변수에 접근하면 데이터가 꼬이는 **동시성 문제**가 발생하기 때문이죠. 보통 이를 해결하기 위해 synchronized나 Lock을 사용하지만, 이는 성능 저하를 유발할 수 있습니다.

이때 **"공유하지 말고, 스레드마다 독립적인 변수를 가지게 하면 어떨까?"**라는 아이디어에서 탄생한 것이 바로 ThreadLocal입니다.

# 1. ThreadLocal이란?
ThreadLocal은 오직 특정 스레드에 의해서만 읽고 쓸 수 있는 별도의 변수를 제공하는 클래스입니다.

일반적인 멤버 변수가 모든 스레드에 의해 공유되는 것과 달리, ThreadLocal을 사용하면 각 스레드는 자신만의 로컬 변수 복사본을 가집니다.
즉, 같은 로직을 실행하더라도 A 스레드가 저장한 데이터는 B 스레드에서 볼 수 없습니다.

# 2. 주요 활용 사례
주로 파라미터를 전달하기 어려운 환경에서 문맥(Context)을 유지해야 할 때 빛을 발합니다.

- **사용자 인증 정보**: Spring Security에서 현재 로그인한 사용자의 세션 정보를 담는 SecurityContextHolder가 내부적으로 ThreadLocal을 사용합니다.

- **트랜잭션 컨텍스트**: 여러 계층(Service, DAO 등)에서 동일한 DB 커넥션을 유지해야 할 때 사용됩니다.

- **로그 추적 ID**: 마이크로서비스 환경에서 요청마다 고유한 Trace ID를 부여해 로그를 남길 때 유용합니다.

# 3. 내부 동작 원리
ThreadLocal은 값을 직접 들고 있지 않습니다.
실제 데이터는 각 스레드(Thread 객체)가 내부적으로 가지고 있는 **ThreadLocalMap**이라는 공간에 저장됩니다.

```java
public class Thread implements Runnable {
	//...logics
	ThreadLocal.ThreadLocalMap threadLocals = null;
}

public class ThreadLocal<T> {
		ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }

    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }

    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
             map.set(this, value);
        else
            createMap(t, value);
    }

    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;
                return result;
            }
        }
        return setInitialValue();
    }

    public void remove() {
        ThreadLocalMap m = getMap(Thread.currentThread());
        if (m != null)
            m.remove(this);
   }

	static class ThreadLocalMap {
		static class Entry extends WeakReference<ThreadLocal<?>> {
            /** The value associated with this ThreadLocal. */
            Object value;

            Entry(ThreadLocal<?> k, Object v) {
                super(k);
                value = v;
            }
        }
	}
}
```

1. set(value) 호출: 현재 실행 중인 스레드를 확인합니다.
2. Map 찾기: 해당 스레드가 가진 ThreadLocalMap을 가져옵니다.
3. 데이터 저장: ThreadLocal 객체 자신을 Key로, 저장할 값을 Value로 하여 Map에 넣습니다.
4. get() 호출: 다시 ThreadLocal 객체를 Key로 사용하여 스레드별 전용 Map에서 값을 꺼내옵니다.

# 4. ⚠️ 주의사항: 메모리 누수(Memory Leak)
ThreadLocal 사용 시 가장 주의해야 할 점은 스레드 풀 환경에서의 사용입니다.

문제 상황: Tomcat 같은 WAS는 스레드를 재사용합니다. 스레드가 작업을 마치고 풀로 돌아갔는데 ThreadLocal 데이터가 그대로 남아있다면, 다음 사용자가 이전 사용자의 데이터를 보게 되거나 메모리가 해제되지 않는 문제가 발생합니다.

해결책: 작업이 끝나면 반드시 ThreadLocal.remove()를 호출하여 데이터를 명시적으로 삭제해야 합니다.

```Java
try {
    threadLocalValue.set(userContext);
    // 비즈니스 로직 수행
} finally {
    threadLocalValue.remove(); // 필수!
}
```

[ThreadLocal](https://catsbi.oopy.io/3ddf4078-55f0-4fde-9d51-907613a44c0d)