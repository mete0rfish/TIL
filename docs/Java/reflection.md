# Class 클래스
- java.lang.Class 패키지에 별도로 존재하는 독립형 클래스
- 자신이 속한 클래스의 모든 멤버 정보를 담고 있음
- 동적으로 저장된 클래스나 인터페이스 정보를 가져옴

```java
public final class Class<T> implements java.io.Serializable,
                              GenericDeclaration,
                              Type,
                              AnnotatedElement,
                              TypeDescriptor.OfField<Class<?>>,
                              Constable {
    private static final int ANNOTATION= 0x00002000;
    private static final int ENUM      = 0x00004000;
    private static final int SYNTHETIC = 0x00001000;

    private static native void registerNatives();
    static {
        registerNatives();
    }
                              }
```

- 모든 클래스와 인터페이스는 컴파일 후 .java -> .class로 변환
- 이 .class 파일에는 멤버변수, 메서드, 생성자 등 객체 정보를 가짐
- JVM의 클래스 로더에 의해 메모리에 올라갈 때, Class 클래스는 이 .class 파일의 클래스 정보들을 가져와 힙 영역에 자동으로 객체화

## Class 객체 얻기
### 1. Object.getClass()
- Object 클래스에서 제공하는 getClass() 사용
- 단, 해당 클래스가 인스턴스화 된 상태이어야 함

```java
String str = new String("string");
Class<? extends String> cls = str.getClass();
```

### 2. .class 리터럴
- 컴파일된 클래스 파일만으로 가져옴

```java
Class<? extends String> cls2 = String.class;
```

### 3. Class.forName()
- 메모리 절약하며 동적 로딩 가능

```java
try {
    Class<?> cls = Class.forName("java.lang.String");
} catch (ClassNotFoundException e) {}
```

<br/>

# Reflection API

- 구체적인 클래스 타입을 몰라도 클래스 정보만으로 접근이 가능하도록 하는 자바 API
- 객체를 통해 클래스의 정보를 분석 -> 런타임에 클래스 동작을 검사 및 조작

## Reflection 사용법
```java
class Person {
    public String name;
    private in age;

    public static int height = 180;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public int sum(int left, int right) {
        return left + right;
    }

    public static int staticSum(int left, int right) {
        return left + right;
    }

    private int privateSum(int left, int right) {
        return left + right;
    }
}
```

### 동적으로 생성자 가져와서 초기화
```java
Class<Person> personClass = (Class<Person>) Class.forName("Person");

Constructor<Person> constructor = personClass.getConstructor(String.class, int.class);

Person person1 = constructor.newInstance("홍길동", 55);
person1.getField();
```

### 동적으로 메서드 가져와 실행
```java
Class<Person> personClass = (Class<Person>) Class.forName("Person");

Method sum = personClass.getMethod("sum", int.class, int.class);
int result = (int) sum.invoke(new PErson(), 10, 20);
System.out.println(result); // 30

Method staticSum = personClass.getMethod("staticSum", int.class, int.class);
int staticResult = (int) staticSum.invoke(null, 100, 200);
System.out.println("staticResult = " + staticResult);

Method privateSum = personClass.getMethod("privateSum", int.class, int.class);
int privateResult = (int) privateSum.invoke(null, 1000, 2000);
System.out.println("privateResult = " + privateResult); // 3000
```

### 동적으로 필드 가져와 조작하기
```java
Class<Person> personClass = (Class<Person>) Class.forName("Person");

Field height_field = personClass.getField("height");
height_field.set(null, 200);
System.out.println(height_field.get(null));
```
