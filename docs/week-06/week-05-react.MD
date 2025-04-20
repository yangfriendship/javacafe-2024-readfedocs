# 스터디 6주차 (4/20) - 상호작용 추가하기

- 화면의 일부 요소는 사용자의 입력에 따라 업데이트되며 리액트에서는 시간에 따라 변화하는 데이터를 state 로 관리한다.

> 이 장에서는
> - 사용자 이벤트를 처리하는 방법
> - 컴포넌트가 state를 이용하여 정보를 “기억”하는 방법
> - React가 UI를 업데이트하는 두 가지 단계
> - state가 변경된 후 바로 업데이트되지 않는 이유
> - 여러 개의 state 업데이트를 대기열에 추가하는 방법
> - state에서 객체를 업데이트하는 방법
> - state에서 배열을 업데이트하는 방법

# 이벤트에 대한 응답

- React에서는 JSX에 이벤트 핸들러를 추가할 수 있다.
    - 클릭, 마우스 호버, 폼 인풋 포커스 등 사용자 상호작용에 따라 유발되는 사용자 정의 함수

## 이벤트 핸들러 추가하기

- 이벤트 핸들러 추가를 위해서는 먼저 함수를 정의하고 이를 적절한 JSX 태그에 prop 형태로 전달해야 한다.
- 이를 적절한 JSX 태그에 prop 형태로 전달해야 한다.

```tsx
export default function Button() {
    function handleClick() {
        alert('You clicked me!');
    }

    return (
        <button onClick={handleClick}> {/* 1. button 에 props 형태로 함수(이벤트 핸들러)를 정의한다.*/}
            Click me
        </button>
    );
}
```

- JS 에서 함수를 정의하는 방식은 모두 가능하다.

```tsx
{/* 1.  */
}
<button onClick={function handleClick() {
    alert('You clicked me!');
}}>

    {/* 2.  */}
    <button onClick={() => {
        alert('You clicked me!');
    }}>
```

## 이벤트 핸들러 내에서 Prop 읽기

- 이벤트 핸들러는 컴포넌트 내부에서 선언되기에 이들은 해당 컴포넌트의 prop에 접근할 수 있다.

```tsx
function AlertButton({message, children}) {
    return (
        /* 1. onclick 으로 넘긴 함수가 외부 스코프의 message 를 참조하고 있다.*/
        /* JS 클로저: () => alert(message) 가 선언될 당시(AlertButton 함수의 실행) 을 기억함.*/
        <button onClick={() => alert(message)}>
            {children}
        </button>
    );
}

export default function Toolbar() {
    return (
        <div>
            <AlertButton message="Playing!">
                Play Movie
            </AlertButton>
            <AlertButton message="Uploading!">
                Upload Image
            </AlertButton>
        </div>
    );
}

```

## 이벤트 핸들러를 Prop으로 전달하기

- 부모 컴포넌트에서 props 를 통해 자식 컴포넌트에게 event handler(function) 을 전달할 수 있다.

```tsx
/* 1. 자식 컴포넌트 */
function Button({onClick, children}) {
    return (
        <button onClick={onClick}>
            {children}
        </button>
    );
}

/* 2. 부모 컴포넌트 */

/* 부모컴포넌트에서 onClick 이라는 이름의 프롭스로 handlePlayClick 함수를 전달*/
function PlayButton({movieName}) {
    function handlePlayClick() {
        alert(`Playing ${movieName}!`);
    }

    return (
        <Button onClick={handlePlayClick}>
            Play "{movieName}"
        </Button>
    );
}

```

## 이벤트 핸들러 Prop 명명하기

- 사용자 정의 컴포넌트에서는 이벤트 핸들러 prop의 이름을 원하는 대로 지정할 수 있다.
- 단순 클릭이 아닌 애플리케이션에서 의미 있는 이름으로 이름을 지정할 수 있다.

```tsx
function Button({onSmash, children}) {
    return (
        /* 하지만 실제 버튼에 연결할 때는 브라우저에서 정의된 이름을 사용해야한다.*/
        <button onClick={onSmash}>
            {children}
        </button>
    );
}

export default function App() {
    return (
        <div>
            {/* 부모컴포넌트에게 받을 함수명을 'onSmash' 로 정의했기 때문에 아래와 같이 이벤트 핸들러를 넘긴다. */}
            {/* 사실 부모 컴포넌트 입장에서는 'onSmash' 로 넘긴 프롭스가 핸들러인지도 모르는게 맞다.*/}
            <Button onSmash={() => alert('Playing!')}>
                Play Movie
            </Button>
            <Button onSmash={() => alert('Uploading!')}>
                Upload Image
            </Button>
        </div>
    );
}

```

- prop 이름을 애플리케이션별 상호작용에 기반하여 명명한다면 나중에 어떻게 이를 이용하게 될지에 대한 `유연성`을 제공하는 것!

## 이벤트 전파

![img.png](img.png)

- `button` 에서 발생한 이벤트는 이벤트 버블링에 의해서 상위 div.Toobar 까지 전파되며 상위 엘리멘트의 이벤트(onClick) 까지 동작한다.

```tsx
export default function Toolbar() {
    return (
        <div className="Toolbar" onClick={() => {
            alert('You clicked on the toolbar!');
        }}>
            <button onClick={() => alert('Playing!')}>
                Play Movie
            </button>
            <button onClick={() => alert('Uploading!')}>
                Upload Image
            </button>
        </div>
    );
}

```

### 전파 멈추기

- 이벤트 오브젝트를 유일한 매개변수로 받습니다.
- 이벤트가 부모 컴포넌트에 닿지 못하도록 막으려면 아래와 같이 `Event.stopPropagation()`를 호출하면 된다.

```tsx
function Button({onClick, children}) {
    return (
        <button onClick={e => {
            /* 2. Event.stopPropagation() 를 통해 이벤트가 상위 요소로 전파되지 않도록 할 수 있다. */
            e.stopPropagation();
            onClick();
        }}>
            {children}
        </button>
    );
}

export default function Toolbar() {
    return (
        <div className="Toolbar" onClick={() => {
            alert('You clicked on the toolbar!');
        }}>
            <Button onClick={() => alert('Playing!')}>
                Play Movie
            </Button>
            <Button onClick={() => alert('Uploading!')}>
                Upload Image
            </Button>
        </div>
    );
}
```

### 단계별 이벤트 캡처

- DOM 캡처링 단계의 이벤트를 추가하고 싶다면 아래와 같이 이벤트명 마지막에 `Capture` 를 추가하면 된다.

```tsx
<div onClickCapture={() => { /* this runs first */
}}>
    <button onClick={e => e.stopPropagation()}/>
    <button onClick={e => e.stopPropagation()}/>
</div>
```

### 기본 동작 방지하기

- 일부 브라우저 이벤트는 그와 관련된 기본 브라우저 동작을 가진다. ex) `form`, `button[type='submit']`

```tsx
export default function Signup() {
    return (
        /* action 에 해당하는 URL 로 POST 요청이 가버림..  */
        <form onSubmit={() => alert('Submitting!')}>
            <input/>
            <button>Send</button>
        </form>
    );
}

```

- Event.preventDefault 함수를 통해 form 에 정의된 기본 핸들러의 기능을 방지할 수 있다!

```tsx
export default function Signup() {
    return (
        <form onSubmit={e => {
            e.preventDefault();/* Event.preventDefault 함수를 통해 form 에 정의된 기본 핸들러의 기능을 방지할 수 있다!*/
            alert('Submitting!');
        }}>
            <input/>
            <button>Send</button>
        </form>
    );
}

```

## 이벤트 핸들러가 사이드 이펙트를 가질 수도 있나요?

- 함수를 랜더링하는 것과 다르게 이벤트 핸들러는 순수할 필요는 없다.
    - 사용자와 상호작용을 통해 사이드 이팩트를 발생시키는게 목적!

# State: 컴포넌트의 기억 저장소

- 컴포넌트는 상호 작용의 결과로 화면의 내용을 변경해야 하는 경우가 있으며, 컴포넌트의 상태(값) 을 state 로 관리한다.

```tsx
import {sculptureList} from './data.js';

export default function Gallery() {
    /* 1. Gallery 함수(컴포넌트) 에 정의된 index 라는 상태이지만 JS 의 일반 변수에 지나지 않는다.*/
    let index = 0;

    function handleClick() {
        index = index + 1;
    }

    let sculpture = sculptureList[index];
    return (
        <>
            <button onClick={handleClick}>
                Next
            </button>
            <h2>
                <i>{sculpture.name} </i>
                by {sculpture.artist}
            </h2>
            <h3>
                ({index + 1} of {sculptureList.length})
            </h3>
            <img
                src={sculpture.url}
                alt={sculpture.alt}
            />
            <p>
                {sculpture.description}
            </p>
        </>
    );
}

```

- 위 코드에서 `next` 버튼을 클릭하더라도 화면이 갱신되지 않는다.
- index 는 그저 자바스크립트 변수이며, 데이터의 변경을 React 는 알 수가 없다.
    - 지역 변수는 렌더링 간에 유지되지 않습니다. -> 함수의 지역 스코프는 함수 호출의 종료와 함께 스택 메모리에서 해제된다. 즉 다음 함수 호출시에 새로운 `let index =0;` 이 새롭게 할당되는
      것!
    - 지역 변수를 변경해도 렌더링을 일으키지 않습니다. -> JS 의 값이 변경일뿐 리액트는 알지 못한다.

- 컴포넌트를 새로운 데이터로 업데이트하기 위해선 다음 두 가지가 필요하다.
    - 렌더링 사이에 데이터를 `유지` 해야한다.
    - 새로운 데이터로 컴포넌트를 렌더링하도록 `유발(trigger)` 해야한다.

- React 함수 컴포넌트에서는 `useState` 로 데이터를 생성과 변경하는 기능을 제공한다.
    - 관리하는 값을 0번 인덱스, 그리고 리랜더링을 일으키며 값을 변경하는 setter function 을 1번 인덱스에 넘겨준다.
    - useState 의 인자는 한개이며 값 자체를 받거나 값을 생성할 수 있는 Supplier Function 을 넘겨 받는다. (Lazy)

```tsx
import {useState} from 'react';

...
const [index, setIndex] = useState(0);
```

## 첫 번째 훅 만나기

- 리액트에서는 `use` 접두사로 시작하는 함수를 hook 이라 부른다.
- hook 은 오직 랜더 중일 때만 사용할 수 있는 함수
    - 컴포넌트의 최상위 수준 또는 커스텀 훅에서만 호출할 수 있다.
    - 함수이지만 컴포넌트의 필요에 대한 무조건적인 선언으로 생각해야한다. -> if, for 문 등으로 호출 여부를 결정하면 안된다. 호출 여부/순서가 순수해야한다!

### useState 해부하기

```tsx
const [something, setSomething] = useState(0);
```

- `const [something, setSomething]` 이와 같이 지정하는 것은 `규칙` 이다.
- 첫번째 인자로 저장한 값을 가진 state 변수를 반환
- 두번째 인자로 저장한 값을 변경하며 리랜더링을 발생시킬 setter function 을 반환한다.

## 컴포넌트에 여러 state 변수 지정하기

- 하나의 컴포넌트는 하나 이상의 state 를 가질 수 있으며, 각각 선언할 수도 있다.

```tsx

import {useState} from 'react';
import {sculptureList} from './data.js';

export default function Gallery() {
    /* 1. idnex 라는 state 를 선언 */
    const [index, setIndex] = useState(0);
    /* 2. showMore 이라는 state 를 선언*/
    const [showMore, setShowMore] = useState(false);

    function handleNextClick() {
        setIndex(index + 1);
    }

    function handleMoreClick() {
        setShowMore(!showMore);
    }

    let sculpture = sculptureList[index];
    return (
        <>
            <button onClick={handleNextClick}>
                Next
            </button>
            <h2>
                <i>{sculpture.name} </i>
                by {sculpture.artist}
            </h2>
            <h3>
                ({index + 1} of {sculptureList.length})
            </h3>
            <button onClick={handleMoreClick}>
                {showMore ? 'Hide' : 'Show'} details
            </button>
            {showMore && <p>{sculpture.description}</p>}
            <img
                src={sculpture.url}
                alt={sculpture.alt}
            />
        </>
    );
}

```

## State는 격리되고 비공개로 유지됩니다

- state 는 컴포넌트 인스턴스에 지역적이다.
- 동일한 컴포넌트가 호출 되었더라도 각각 호출에 대한 인스턴스마다 자신의 state(상태) 를 갖는다. 다른 인스턴스의 상태에는 접근할 수 없다.

# 렌더링 그리고 커밋

- 컴포넌트를 화면에 표시하기 이전에 React에서 렌더링을 해야하며 이 과정을 이해하면 코드가 어떻게 실행되는지 이해할 수 있고 React 렌더링 동작에 관해 설명하는데 도움된다.
- 리액트의 랜더링 과정은 크게 세가지로 나뉘어진다.
    1. 렌더링 트리거 (손님의 주문을 주방으로 전달) ->
    2. 컴포넌트 렌더링 (주방에서 주문 준비하기) -> 리액트 컴포넌트(Function) 실행
    3. DOM에 커밋 (테이블에 주문한 요리 내놓기) -> 실제 브라우저 DOM API 호출

## 1단계: 렌더링 트리거

- 렌더링이 일어나는 데에는 두 가지 이유가 있다.
    1. 초기 렌더링
    2. state가 업데이트 (useState 가 반환한 updater function)

### 초기 렌더링

- 앱을 시작할 때 초기 렌더링을 트리거해야한다.

```tsx
import Image from './Image.js';
import {createRoot} from 'react-dom/client';

const root = createRoot(document.getElementById('root'))
root.render(<Image/>);

```

### State 업데이트 시 리렌더링

- 처음으로 렌더링 된 후에는 set 함수를 통해 상태를 업데이트하여 추가적인 렌더링을 트리거할 수 있다.
- 컴포넌트의 상태를 업데이트하면 자동으로 렌더링 대기열에 추가된다.

## 2단계: React 컴포넌트 렌더링

- “렌더링”은 React에서 컴포넌트를 호출하는 것을 의미한다.
- 초기 렌더링에서 React는 루트 컴포넌트부터 자식 컴포넌트까지 함수 호출을 하지만
- 이후 렌더링에서 React는 state 업데이트가 일어나 `렌더링을 트리거한 컴포넌트`를 호출

```tsx
export default function Gallery() {
    return (
        <section>
            <h1>Inspiring Sculptures</h1>
            <Image/>
            <Image/>
            <Image/>
        </section>
    );
}

function Image() {
    return (
        <img
            src="https://i.imgur.com/ZF6s192.jpg"
            alt="'Floralis Genérica' by Eduardo Catalano: a gigantic metallic flower sculpture with reflective petals"
        />
    );
}

```

- 초기 렌더링 하는 동안 React는 `<section>, <h1>` 그리고 3개의 `<img>` 태그에 대한 DOM 노드를 생성하지만
- 리렌더링하는 동안 React는 이전 렌더링 이후 `변경된 속성을 계산`합니다. 다음 단계인 커밋 단계까지는 해당 정보로 아무런 작업도 수행하지 않습니다.
    - React Key 가 중요한 이유!   
      동일한 Key 를 유지하고 props 만 변경하더라도 변경된 속성만을 계산하여 동일한 DOM Object 에 속성 변경을 실행하기 때문

### 렌더링은 항상 순수해야한다

- 동일한 입력에는 동일한 출력을 해야합니다. 동일한 입력이 주어지면 컴포넌트는 항상 동일한 JSX를 반환해야 한다.
    - 그밖에 동일하지 못한 `site effect` 는 `useEffect` hook 을 통해 정의한다.
    - 사용자와 상호작용을 통해 `site effect` 을 유발할 수 있다.

## 3단계: React가 DOM에 변경사항을 커밋

- 컴포넌트를 렌더링(호출)한 후 `커밋` 단계에서 React 는 DOM을 수정한다.
- 렌더링 간에 차이가 있는 경우에만 DOM 노드를 변경한다.