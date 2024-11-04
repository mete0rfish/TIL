# 서버의 예외처리의 중요성

- 클라이언트는 개발자 도구를 통한 값 변조로 얼마든지 검증 코드 회피가 가능
- 따라서, 클라이언트와 서버의 이중 체크가 중요

https://jojoldu.tistory.com/157

https://careerly.co.kr/qnas/3813

# 스프링에서 예외처리를 어떻게 해야할까?

## 기본적인 예외 및 응답 처리

https://goldenrabbit.co.kr/2024/04/03/spring-스프링-부트-예외-처리-가이드/

## Validation 사용하기

https://itbeginner2020.tistory.com/39

## HandlerExceptionResolver는 무엇인가?

https://jddng.tistory.com/279

https://ones1kk.tistory.com/entry/스프링의-예외-처리-방법

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/fe00b7b3-3143-4bc3-bb33-0ca433d7b78d/8c3098c3-0804-44be-a531-fe2a82f81433/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/fe00b7b3-3143-4bc3-bb33-0ca433d7b78d/6ef0bec9-ab8a-4dc1-b1a5-f59acb12d98b/image.png)

- Spring MVC는 다음의 구조를 지닌다. 
• WAS - (필터) - 서블릿 - (인터셉터) - 컨트롤러
- ExceptionResolver를 사용하지 않으면, 에러에 대한 WAS에게 예외 전달까지 다시 돌아가야한다.
- 다시 WAS로 돌아가지 않고, 컨트롤러에서 발생한 예외를 처리한 후 정상처리되도록 마무리해주는 것이 ExceptionResolver이다.

### ResponseEntity를 사용하는 프로젝트에서의 적용

기본적으로 handlerExceptionResolver는 ModelAndView를 반환하도록 되어있다.

ResponseEntity를 이용하는 프로젝트에서 사용하기에 까다롭다는 생각이 들었다.

`ExceptionHandlerExceptionResolver` 를 사용하면 된다.

우리가 사용하는 @ControllerAdvice 와 @ExceptionHandler를 자동으로 감지하고, 처리하는 역할을 수행한다.