# 스터디 6주차 (5/25) - Ref 로 값 참조하기

- 컴포넌트가 일부 데이터를 렌더링 유발 없이 저장하고 싶다면 `Ref` 를 사용하면 된다.

## 컴포넌트에 Ref 를 추가하기

- ref 도 react 가 제공해주는 hook 의 한 종류

```tsx
import {useRef} from 'react';

function SomeComponents() {
    const ref = useRef(0);  // (1) useRef hook 을 이용하여 초깃값을 바인딩하면 ref object 를 반환한다.
    return (<div>{ref.current}</div>)
}

```

- useRef 의 반환값은 current 필드를 갖는 javascript object 이며 관리되는 데이터는 `object.current` current 필드를 통해 접근할 수 있다.
- 이 값이 변경되더라도 react 는 리렌더링을 발생시키지 않는다.
- useRef.current 는 state 와 마찬가지로 문자열, 객체, 심지어 함수 등 모든 것을 할당할 수 있다.

## Ref와 State의 차이

| Ref                                                      | State                                                                       |
|----------------------------------------------------------|-----------------------------------------------------------------------------|
| useRef(initialValue) 는 { current: initialValue }를 반환합니다. | useState(initialValue)는 State 변수의 현재 값과 Setter 함수 [value, setValue]를 반환합니다. |
| State를 바꿔도 리렌더링 하지 않습니다.                                 | 	State를 바꾸면 리렌더링 합니다.                                                       |
| Mutable: 렌더링 프로세스 외부에서 current 값을 수정 및 업데이트할 수 있습니다.     | Immutable: State를 수정하기 위해서는 State 설정 함수를 반드시 사용하여 리렌더링 대기열에 넣어야 합니다.        |
| 렌더링 중에는 current 값을 읽거나 쓰면 안 됩니다.                         | 언제든지 State를 읽을 수 있습니다. 그러나 각 렌더링마다 변경되지 않는 자체적인 State의 Snapshot이 있습니다.      |

## Ref를 사용할 시기

- 컴포넌트가 React를 “외부”와 외부 API—컴포넌트의 형태에 영향을 미치지 않는 브라우저 API 와 통신해야 할 때 Ref 를 사용해야한다.
    - 여기서 말하는 API 는 Http API 뿐만 아니라 DOM API 등 리액트의 기본 기능을 제외한 모든 프로그래밍적 상호작용이라고 생각한다.
- 특별한 상황 예시
    - Timeout ID를 저장
    - 다음 페이지에서 다루는 DOM 엘리먼트 저장 및 조작
    - JSX를 계산하는 데 필요하지 않은 다른 객체 저장

## 요약

- Ref 는 렌더링에 사용되지 않는 값을 고정하기 위한 탈출구이며, 자주 필요하지는 않습니다.
    - 특별한 상황에서 사용해야한다!
        - DOM API 에 접근하는 비파괴적인 행위
- Ref 는 읽거나 설정할 수 있는 current 라는 프로퍼티를 호출할 수 있는 자바스크립트 순수객체입니다.
    - 그렇다고 Proxy 처리된 객체도 아니다!
- Ref 기능 또한 React 의 hooook!
- State 와 마찬가지로 Ref 는 컴포넌트의 렌더링 간에 정보를 유지할 수 있다. (데이터 관리 및 공유)
- State 와 달리 Ref의 current 값을 설정하면 리렌더링을 트리거하지 않는다!
- 컴포넌트를 예측하기 어렵게 만들기 때문에 렌더링 중에 ref.current 를 읽거나 쓰지말자!

# 스터디 6주차 (5/25) - Ref 로 DOM 조작하기

- React 는 렌더링 결과물에 맞춰 DOM 변경을 자동으로 처리하기 때문에 컴포넌트에서 자주 DOM을 조작해야 할 필요가 없다.
- 또한 이러한 방식은 리액트 사용에 있어서 지양해야하는 방식! UI 를 변경하는 사공이 둘일 수 없다!
- 가끔 특정 노드에 포커스를 옮기거나, 스크롤 위치를 옮기거나, 위치와 크기를 측정하기 위해서 React가 관리하는 DOM 요소에 접근해야할 때가 있다.
    - Element 에 focus 처리 -> element.focus();
    - Scroll 처리 -> element.scrollIntoView();
- 이러한 동작을 위해 ref 를 사용하여 DOM 에 접근할 수 있다.

```tsx
import {useRef} from 'react';

export default function Form() {
    const inputRef = useRef(null);  /* (1) useRef hook 을 이용하여 ref 를 생성한다. 이 코드가 실행될 때는 DOM Element 가 생성되지 않았기 때문에 초깃값은 null!*/

    function handleClick() {
        /* (3) current 에는 하위 코드에서 생성된 DOM element 의 객체가 바인딩되어 있다.*/
        inputRef.current.focus();
    }

    return (
        <>
            <input ref={inputRef}/> {/* (2) 이 때 ref 에 위에서 생성한 ref 객체를 넘겨주면 element 생성과 함께 .current field 에 값이 바인딩된다*/}
            <button onClick={handleClick}>
                Focus the input
            </button>
        </>
    );
}


```

```tsx
import {useRef, useState} from "react";

export default function CatFriends() {
    const itemsRef = useRef(null);
    const [catList, setCatList] = useState(setupCatList);

    function scrollToCat(cat) {
        const map = getMap();
        const node = map.get(cat);
        node.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }

    function getMap() {
        if (!itemsRef.current) {
            // 처음 사용하는 경우, Map을 초기화합니다.
            itemsRef.current = new Map();
        }
        return itemsRef.current;
    }

    return (
        <>
            <nav>
                <button onClick={() => scrollToCat(catList[0])}>Neo</button>
                <button onClick={() => scrollToCat(catList[5])}>Millie</button>
                <button onClick={() => scrollToCat(catList[9])}>Bella</button>
            </nav>
            <div>
                <ul>
                    {catList.map((cat) => (
                        <li
                            key={cat}
                            ref={(node) => {
                                /* (1) ref 필드에 ref 를 그대로 넣는 방식 말고도 (node) 를 받아 clear function 을 반환하는 함수를 넣어도 된다.*/
                                const map = getMap();
                                map.set(cat, node);

                                return () => {
                                    map.delete(cat);
                                };
                            }}
                        >
                            <img src={cat}/>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

function setupCatList() {
    const catList = [];
    for (let i = 0; i < 10; i++) {
        catList.push("https://loremflickr.com/320/240/cat?lock=" + i);
    }

    return catList;
}


```

## 다른 컴포넌트의 DOM 노드 접근하기

- 부모 컴포넌트에서 자식 컴포넌트로 ref 를 prop 처럼 전달할 수 있다.
- ref 자체가 자바스크립트 오브젝트이기 때문에 아래 동작은 별문제 없어보인다.

```tsx
import {useRef} from 'react';

function MyInput({ref}) {
    return <input ref={ref}/>;
}

export default function MyForm() {
    const inputRef = useRef(null);

    function handleClick() {
        inputRef.current.focus();
    }

    return (
        <>
            <MyInput ref={inputRef}/>
            <button onClick={handleClick}>
                Focus the input
            </button>
        </>
    );
}

```

## 명령형 처리방식으로 하위 API 노출하기

- ref 를 통해 DOM 객체를 통째로 넘긴다면 외부에서 데이터가 어떻게 처리될지 예측할 수 없다. (데이터 캡슐화 와창창창)
- `useImperativeHandle` ref.current 를 조작할 수 있는 오브젝트를 넘길 수 있다.
- javascript object 를 조작하는게 아닌 useImperativeHandle 의 두 번째 인자의 오브젝트를 ref.current 에 바인딩해주는 것!

```tsx
import {useRef, useImperativeHandle} from "react";

function MyInput({ref}) {
    const realInputRef = useRef(null);
    useImperativeHandle(ref, () => ({
        // 오직 focus만 노출합니다.
        focus() {
            realInputRef.current.focus();
        },
    }));
    return <input ref={realInputRef}/>;
};

export default function Form() {
    const inputRef = useRef(null);

    function handleClick() {
        inputRef.current.focus();
    }

    return (
        <>
            <MyInput ref={inputRef}/>
            <button onClick={handleClick}>Focus the input</button>
        </>
    );
}

```

## React가 ref 를 부여할 때

- React의 모든 업데이트는 두 단계로 나눌 수 있다.
    - 렌더링 단계에서 React는 화면에 무엇을 그려야 하는지 알아내도록 컴포넌트를 호출
    - 커밋 단계에서 React는 변경사항을 DOM에 적용
- 첫 렌더링에서 DOM 노드는 아직 생성되지 않아서 ref.current는 null인 상태
- React는 ref.current를 커밋 단계에서 설정
- 대부분 ref 접근은 이벤트 핸들러 안에서 일어난다.

## flushSync로 state 변경을 동적으로 플러시하기

- state 를 변경 후 ref 를 조작할 때 의도치 않은 동작이 발생할 수 있다.
- state 는 값을 함수 인자로 값 또는 콜백(Function<T, T>) 타입을 넘기는데 두가지 모두 update queue 에 쌓인 후 배치처리
- 하지만 setState 함수 이후에 호출되는 ref 관련 코드는 즉시 실행된다.
- 데이터 변경 이후의 상태를 기대하며 실행한 ref 관련 코드가 실제 데이터 변경보다 먼저 이루어지는 문제가 발생할 수 있다.
- 이럴 때는 flushSync() 를 이용하여 데이터 변경 -> UI 변경을 동기 방식으로 진행하면 해결할 수 있다. -> 근본적인 원인은 이게 아닐텐데?

```tsx
import {useState, useRef} from 'react';
import {flushSync} from 'react-dom';

export default function TodoList() {
    const listRef = useRef(null);
    const [text, setText] = useState('');
    const [todos, setTodos] = useState(
        initialTodos
    );

    function handleAdd() {
        const newTodo = {id: nextId++, text: text};
        flushSync(() => {
            setText('');
            setTodos([...todos, newTodo]);
        });
        listRef.current.lastChild.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    return (
        <>
            <button onClick={handleAdd}>
                Add
            </button>
            <input
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <ul ref={listRef}>
                {todos.map(todo => (
                    <li key={todo.id}>{todo.text}</li>
                ))}
            </ul>
        </>
    );
}

let nextId = 0;
let initialTodos = [];
for (let i = 0; i < 20; i++) {
    initialTodos.push({
        id: nextId++,
        text: 'Todo #' + (i + 1)
    });
}

```

## ref로 DOM을 조작하는 모범 사례

- Ref 는 탈출구이며 “React에서 벗어나야 할 때”만 사용해야 한다.
- React가 노출하지 않는 브라우저 API를 호출하는 등의 작업이 이에 포함되며 `비파괴인 행위` 에만 사용하는걸 권장한다.
- 여기서 `비파괴적인 행위` 란.. (개인적인 생각)
    - 일단 `파괴적인 행위` 란 브라우저 DOM 자체를 추가 삭제 등등 변경하는 작업들을 뜻하는 것 같다.
    - DOM Element 의 접근하여 focus, scrollToView 등 변경을 유발하지 않는 행위들을 뜻함.
- React 라이프사이클을 통해 브라우저 DOM 이 관리되고 있는 상황에서 Ref 를 통해 획득한 DOM 을 동시에 조작한다면 예기치 못한 문제가 발생! (예제 참고)
- React 가 관리하는 Node 를 브라우저 DOM API 를 통해 변경하지말자.

## 요약

- Ref는 범용적인 개념이지만 많은 경우 DOM 요소를 참조하기 위해 사용한다.
- 포커싱, 스크롤링, DOM 요소 크기 혹은 위치 측정 등 비 파괴적인 행동을 위해 사용한다.  (모범사례)
- 컴포넌트는 기본적으로 DOM 노드를 노출하지 않습니다. 이럴 때 탈출구로 ref 를 사요할 수 있다.
- React가 관리하는 DOM 노드를 직접 바꾸려 하지 마세요.
- React가 관리하는 DOM 노드를 수정하려 한다면, React가 변경할 이유가 없는 부분만 수정해야한다. (리랜더링이 필요 없는 경우)