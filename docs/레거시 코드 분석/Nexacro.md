# 개요
- `Internet Explorer` 지원 안해서 스트립트 외부 구현 안됨
- 표준화된 JS 사용
- 크롬 제공 스크립트 엔진 사용

## 용어
컴포넌트: 눈에 보이는 것
오브젝트: 눈에 보이지 않는 것
즉, 화면 부와 데이터 부가 따로 있음

## 사용
- 보통 컴포넌트에 바인드하여 사용
- 통신은 데이터셋을 이용
- inner dataset
- 모든 요청은 string으로 처리함
- XPlatform에선 바인드 1개가 2개만 가능
    - 넥사크로는 여러 개 binditem 지정가능

> **_[주의 사항]_** <br/>
> Source는 직접 건드리지 않기. 데이터 유실 가능성 있음.

## 생명 주기
- 처음 화면 오면 `onLoad` 실행됨
- 그 전 이벤트 알필요 없음

## 이벤트명 규칙
- `can*`: 바뀌기 전. 리턴값있음
- `*changed`: 바뀐 후.
- `*NF`: 데이터셋 필터면 행 포함하여 찾음

## 사용법
- `basescript`로 템플릿 불러옴
- 기존 include 방식은 앱 열때마다 가져와서, 성능 이슈 발생
    - 아무리 캐시처리해도 라이브러리 비교하는 비용 발생
    - 넥사크로에선 앱 최초 실행시 메모리에 라이브러리 상주시킴
- 공통함수엑셀에서 공통 함수를 받아와서 기존 코드에서 변경
- div는 form이라는 객체를 상속받아 사용
    - 따라서 만약 div 안에 btn이 있는 경우, `this.div00.form.btn00` 식으로 사용

## 주의 사항
### 객체 참조 파라미터
JS에서 원시 값과 다르게 객체는 참조 값이 넘어 간다.
따라서, 특정 함수에서 파라미터로 받은 객체의 값을 변경하면 원본도 변경된다.
객체는 잘쓰면 최적화 가능

### 컨벤션
- 사용자정의 함수명 앞에는 `fn` 붙이기
- 구분자 다음에는 `nexacro.wrapQuate()`로 감싸기
- 데이터가 아무것도 없을때 -1으로 처리해야한다.

### 예시: 마스터-디테일 뷰
마스터-디테일 뷰에서 마스터 항목 중 하나 누른 상태에서 다른 버튼 눌러도 유지되도록 개발해야 한다.
그래서 그리드가 아닌 **데이터 셋이 변했을때 변경되도록** 설정해야 한다.

### 그 외
- `ctrl+shift+z`을 누르면 데이터 셋을 볼 수 있다.

<br/>

# 데이터셋
## 메소드 정리 테이블

| 구분 | 메소드 | 설명 | 예시 |
| :--- | :--- | :--- | :--- |
| **데이터셋 정보** | `getColCount` | 데이터셋의 전체 컬럼 개수를 반환합니다. | `var nColCount = this.Dataset1.getColCount();` |
| | `getRowCount` | 필터링된 row를 제외한 전체 row 개수를 반환합니다. | |
| | `getRowCountNF` | 필터링된 row를 포함한 전체 row 개수를 반환합니다. | |
| | `getColID` | 해당 인덱스의 컬럼 ID를 반환합니다. | `var colId = this.Dataset1.getColID(i);` |
| | `addColumn` | 데이터셋에 새로운 컬럼을 추가합니다. (컬럼 ID, 타입) | `dataset1.addColumn("NAME", "STRING");` |
| **데이터 조작** | `set_value` | 특정 컴포넌트의 value 속성에 값을 설정합니다. | `this.txt_area.set_value(text);` |
| **단일 조건 검색** | `findRow` | 조건과 일치하는 첫 번째 row의 인덱스를 반환합니다. | `dataset.findRow("COL_ID", "VAL");` |
| | `getColumn` | 지정된 row 인덱스에서 특정 컬럼의 값을 반환합니다. | `dataset.getColumn(ROW_IDX, "COL_ID");` |
| | `lookup` | 조건과 일치하는 첫 번째 row에서 지정된 컬럼의 값을 반환합니다. | `dataset.lookup("COL_ID", "VAL", "OUTPUT_COL_ID");` |
| **복합 조건 검색** | `findRowExpr` | 표현식을 만족하는 첫 번째 row의 인덱스를 반환합니다. | `dataset.findRowExpr("DEP == 'K10' && SAL <= 500");` |
| | `extractRows` | 표현식을 만족하는 모든 row의 인덱스를 배열로 반환합니다. | `dataset.extractRows("DEP=='K10'");` |
| **데이터 집계** | `getCaseAvg` | 조건을 만족하는 row들의 특정 컬럼 값의 평균을 반환합니다. | `dataset.getCaseAvg("GENDER=='M'", "SAL");` |
| | `getAvg` | 표현식 결과값의 평균을 계산하여 반환합니다. | `dataset.getAvg("SAL+BONUS");` |
| **필터링 및 정렬**| `filter` | 조건에 맞는 데이터만 보이도록 필터링합니다. | `dataset.filter("GENDER=='M' && MARRIED==0");` |
| | `keystring` | 데이터를 그룹핑(G)하거나 정렬(S)합니다. (+: 오름차순, -: 내림차순) | `dataset1.set_keystring("S:-HIRE_DATE");` |
| **기타 (Math)** | `Math.round` | 숫자를 지정된 소수점 자리에서 반올림합니다. | `Math.round(num, 2);` |
| **기타 (String)** | `toUpperCase` | 문자열 내 모든 영문자를 대문자로 변환합니다. | `str.toUpperCase()` |
| | `indexOf` | 문자열에서 특정 문자열이 처음 나타나는 위치의 인덱스를 반환합니다. | `"FULL_NAME".indexOf("sText");` |