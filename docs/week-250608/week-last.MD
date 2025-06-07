# Effect에서 이벤트 분리하기

> "glasp" 에 하이라이트 및 코멘트도 정리

- 이벤트 핸들러는 같은 상호작용을 반복하는 경우에만 재실행되며 이벤트 핸들러와 달리 prop이나 state 변수 등 읽은 값이 마지막 렌더링 때와 다르면 다시 동기화된다.

## 이벤트 핸들러와 Effect 중에 선택하기

- 이벤트 핸들러와 Effect의 차이점

### 이벤트 핸들러는 특정 상호작용에 대한 응답으로 실행

- 이벤트 핸들러는 사용자와 특정 `상호작용`에 사용된다.

```jsx
function ChatRoom({roomId}) {
    const [message, setMessage] = useState('');

    // ...
    function handleSendClick() {
        sendMessage(message);
    }

    // ...
    return (
        <>
            <input value={message} onChange={e => setMessage(e.target.value)}/>
            <button onClick={handleSendClick}>전송</button>
        </>
    );
}
```

### Effect는 동기화가 필요할 때마다 실행

```jsx
function ChatRoom({roomId}) {
    // ...
    useEffect(() => {
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        return () => {
            connection.disconnect();
        };
    }, [roomId]);
    // ...
}
```

- Effect 를 실행하는 이유는 어떠한 특정 `상호작용이 아니다`.
- 컴포넌트가 현재 선택된 방과 동기화된 상태를 유지할 것이고 필요할 때마다 다시 연결할 것을 Effect가 보장하기 위함.
- Effect 는 특정 상호작용에 대한 응답으로 실행되지 않으며 대신 사용자가 특정 화면을 보거나 상호작용할 수 있도록 컴포넌트가
  외부 시스템과 연결된 상태를 유지해야 할 때 실행된다.
- Effect를 사용하면, 사용자가 수행하는 특정 상호작용과 관계없이 컴포넌트가 현재 선택된 상태를 유지할 수 있다.
- 이벤트 핸들러가 사용자 상호작용에 대한 직접적인 응답으로 실행되는 반면 Effect 는 컴포넌트의 props 나 state 등 읽은 값이 마지막 렌더링 때와 다르면
  다시 동기화해야 할 때마다 실행된다.

## 반응형 값과 반응형 로직

- Effect 는 동기화 유지에 필요한 만큼 자주 실행 및 재실행되기 때문에 “자동으로” 트리거 된다고 직감적으로 말할 수도 있다.
    - 뭔가 Effect 는 데이터의 변경에 반응형(Reactive) 하여 자동으로 특정 로직이 실행되는 느낌이라면
    - 이벤트 핸들러는 사용자의 특정 행동에 직접적으로 반응하여 기능이 수행되는 느낌?
- 이벤트 핸들로는 특정 값에 반응이 아닌 사용자의 이벤트에 반응
- Effect 는 지정된 특정 의존성의 데이터의 변경에 `반응` 하는 것이라고 볼 수 있다.

## 이벤트 핸들러 내부의 로직은 반응형이 아니다

- 사용자의 특정 이벤트에 상호작용 하기 원한다면 이벤트 핸들러를 사용해야한다.
- useEffect 또는 특정 값의 변화를 인식하는 이상한 짓은 하지말도록 하자!

```jsx
  function handleSendClick() {
    sendMessage(message);
}

...

<button onClick={handleSendClick}/>
```

## Effect 내부의 로직은 반응형이다

- roomId 의 변경에 커넥션 정보를 변경
- 의존성 배열에 있는 값의 상태 변화에 반응하기 때문에 반응형!

```jsx
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
        connection.disconnect()
    };
}, [roomId]);
```

## Effect Event 선언하기

- 현재 실험중에 있는 리액트 훅
- 예제에 채팅룸으로 설명이 이해가 되지 않았는데 챌린지 2번 예제를 풀면서 이해가 잘 되었기 때문에 챌린지를 이용하여 기록

```jsx
import {useState, useEffect} from 'react';
import {experimental_useEffectEvent as useEffectEvent} from 'react';

export default function Timer() {
    const [count, setCount] = useState(0);
    const [increment, setIncrement] = useState(1);

    useEffect(() => {
        const id = setInterval(() => {
            setCount(c => c + increment);
        }, 1000);
        return () => {
            clearInterval(id);
        };
    }, [increment]);

    return (
        <>
            <h1>
                카운터: {count}
                <button onClick={() => setCount(0)}>재설정</button>
            </h1>
            <hr/>
            <p>
                초당 증가량:
                <button disabled={increment === 0} onClick={() => {
                    setIncrement(i => i - 1);
                }}>–</button>
                <b>{increment}</b>
                <button onClick={() => {
                    setIncrement(i => i + 1);
                }}>+
                </button>
            </p>
        </>
    );
}

```

- useEffect 는 increment 를 의존성 배열로 갖고 있기 때문에 사용자가 증가값(increment) 을 변경할 때마다
  새로운 setInterval 함수가 실행된다.

```jsx
    useEffect(() => {
    const id = setInterval(() => {
        setCount(c => c + increment);
    }, 1000);
    return () => {
        clearInterval(id);
    };
}, [increment]);
```

- 위 코드의 문제는 아래와 같다.
    - 예) 800ms -> increment 증가 -> Rerender -> setInterval 새로 할당 -> 1000ms -> 값변경
- 1초마다 갱신되어야 하지만 increment 가 변경될 때 setInterval 가 새롭게 생성되기 때문에 1000ms+ 800ms 의 간격에
  화면 갱신이 되는 현상이 발생한다.

```jsx
    useEffect(() => {
    const id = setInterval(() => {
        setCount(c => c + increment);
    }, 1000);
    return () => {
        clearInterval(id);
    };
}, []);
```

- 그렇다며 코드를 수정하여 useEffect 의 의존성 배열에서 increment 를 제거한다면 setInterval 가 새롭게 생성되는 걸 방지할 수 있으며
  increment 를 변경하더라도 해당 컴포넌트에 하나의 setInterval 를 생성하여 위에 언급한 문제가 발생하지 않도록 할 수 있다.
- 하지만 코드를 실행해보면 increment 를 변경하더라도 초기값 1 만큼 count 가 변경되는 문제가 발생한다.
- increment 를 변경하더라도 useEffect 는 최초 실행될 때의 increment 의 값을 클로져로 참조하고 있기 때문에 increment 가 state 로 변경되는 값이더라도
  변경을 추적할 수 없는 것
- 최초 랜더링 시 increment(snapshot1) 과 증가된 increment(snapshot2) 은 서로 다른 메모리 주소를 가지며 의존성 배열이 비어있는 useEffect 콜백의
  내부 코드는 increment(snapshot1) 을 바라보고 있기 때문에 위와 같은 문제가 발생한다.
- 즉 의존배열에서는 의존하지 않지만 내부 코드에서 로직상 변경을 추적해야하는 값들이 존재할 수 있다.
- callback 내부 코드는 항상 최신값을 사용할 수 없다. (클로저 공부하자)

- 아래 코드로 위 문제 두 가지를 해결할 수 있다.

```jsx
import {useState, useEffect, useRef} from 'react';

export default function Challenge02Timer() {
    const [count, setCount] = useState(0);
    const [increment, setIncrement] = useState(1);
    const incrementRef = useRef(1);

    useEffect(() => {
        const id = setInterval(() => {
            setCount(c => c + incrementRef.current);
        }, 1000);
        return () => {
            clearInterval(id);
        };
    }, []);

    const addIncrement = (count) => {
        setIncrement(c => {
            incrementRef.current = c + count;
            return c + count;
        })
    }

    return (
        <>
            <h1>
                카운터: {count}
                <button onClick={() => setCount(0)}>재설정</button>
            </h1>
            <hr/>
            <p>
                초당 증가량:
                <button disabled={incrementRef.current === 0} onClick={() => addIncrement(-1)}>–</button>
                <b>{increment}</b>
                <button onClick={() => addIncrement(1)}>+
                </button>
            </p>
        </>
    );
}

```

- useRef 는 리랜더링되더라도 같은 자바스크립트 오브젝트를 반환하며 useEffect 콜백에서 ref 오브젝트의 내부 필드를 바라본다면 문제가 발생하지 않음.
- 위 코드처럼 처리 가능하지만 react 는 useEffect 내부에서 항상 컴포넌트의 특정 값(함수 포함) 을 참조할 수 있도록 `useEffectEvent` 훅을 제공한다.

```jsx
  const onTick = useEffectEvent(() => {
    setCount(c => c + increment);
});

useEffect(() => {
    const id = setInterval(() => {
        onTick();
    }, 1000);
    return () => {
        clearInterval(id);
    };
}, []);
```

- useEffect 콜백에서는 의존성 배열에는 속하지 않지만 항상 최신값을 필요로할 때 useEffectEvent 를 통해 해당 값에 접근(조작) 할 수 있도록 한다.

# Effect의 의존성 제거하기

## 의존성은 코드와 일치해야 합니다.

- Effect를 작성할 때는 먼저 Effect가 수행하기를 원하는 작업을 시작하고 중지하는 방법을 지정해야한다.

```jsx

const serverUrl = 'https://localhost:1234';

function ChatRoom({roomId}) {
    useEffect(() => {
        /* (1) 수행해야하는 로직을 정의. 여기서는 커넥션을 생성하는 것*/
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        /* (2) 반환 함수는 중지할 때 처리할 로직을 정의한다. */
        return () => connection.disconnect();
        // ...
    }
```

- 의존성 배열을 비워두면 린터가 경고를 하는데..

```jsx
function ChatRoom({roomId}) {
    useEffect(() => {
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        return () => connection.disconnect();
    }, []); // 경고 발생!!
    // ...
}

function ChatRoom({roomId}) {
    useEffect(() => {
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        return () => connection.disconnect();
    }, [roomId]); // 내부 기능에 반응형 값이 사용될 경우 해당 값을 의존성 배열에 추가해줘야 경고가 사라진다.
    // ...
}
```

### 의존성을 제거하려면 의존성이 아님을 증명하세요!

- 아래 예제에서는 roomId 가 변경될 수 있는 값이기 때문에 의존성 배열에 넣어줘야 한다.

```jsx
const serverUrl = 'https://localhost:1234';

function ChatRoom({roomId}) { // (1) roomId 는 props 이며 항상 변경될 수 있는 값이다.
    useEffect(() => {
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        return () => connection.disconnect();
    }, [roomId]);
    // ...
}
```

-

- 로직상 roomId 가 변경되지 않는 다면 해당 값을 변경될 수 있는 값(props, state..) 가 아닌 상수와 같은 값으로 변경해줘야 린트 경고가 사라진다.

```jsx
const serverUrl = 'https://localhost:1234';
const roomId = "yangfriendship";

function ChatRoom({roomId}) { // (1) roomId 는 props 이며 항상 변경될 수 있는 값이다.
    useEffect(() => {
        const connection = createConnection(serverUrl, roomId);
        connection.connect();
        return () => connection.disconnect();
    }, []);
    // ...
}
```

- 린터 억제하는 짓은 제발 하지말자!

```jsx
useEffect(() => {
    // ...
    // 🔴 Avoid suppressing the linter like this:
    // eslint-ignore-next-line react-hooks/exhaustive-deps
}, []);
```

## 불필요한 의존성 제거하기

- 코드를 반영하기 위해 Effect의 의존성을 조정할 때마다 의존성 목록을 살펴봐야 한다.
    - 다른 조건에서 Effect의 `다른 부분을 다시 실행`하고 싶을 수도 있다.
    - 일부 의존성의 변경에` “반응”하지 않고 “최신 값”만 읽고 싶을 수도 있다`. (useEffectEvent)
    - 의존성은 객체나 함수이기 때문에 의도치 않게 너무 자주 변경될 수 있다.

## 이 코드를 이벤트 핸들러로 옮겨야 하나요?

```jsx
function Form() {
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (submitted) {
            // 🔴 Avoid: Event-specific logic inside an Effect
            post('/api/register');
            showNotification('Successfully registered!');
        }
    }, [submitted]);

    function handleSubmit() {
        setSubmitted(true);
    }

    // ...
}
```

- form 을 `제출` 하는 건 사용자와의 상호작용이기 때문에 Effect 가 아닌 EventHandler 로 처리하는 게 맞다.
- 프레임워크 또는 라이브러리가 제공해주는 기능을 맹목적으로 사용해서는 안되며 적절한 상황에서 사용해야한다.
- 위 예제는 확실하게 사용자 상호작용이기 때문에 아래와 같이 이벤트 핸들러로 변경하는 게 옳다.

```jsx
  function handleSubmit() {
    // ✅ Good: Event-specific logic is called from event handlers
    post('/api/register');
    showNotification('Successfully registered!', theme);
}
```

## Effect 가 관련 없는 여러 가지 작업을 수행하나요?

```jsx
function ShippingForm({country}) {
    const [cities, setCities] = useState(null);
    const [city, setCity] = useState(null);
    const [areas, setAreas] = useState(null);

    useEffect(() => {
        let ignore = false;
        fetch(`/api/cities?country=${country}`)
            .then(response => response.json())
            .then(json => {
                if (!ignore) {
                    setCities(json);
                }
            });
        // 🔴 Avoid: A single Effect synchronizes two independent processes
        if (city) {
            fetch(`/api/areas?city=${city}`)
                .then(response => response.json())
                .then(json => {
                    if (!ignore) {
                        setAreas(json);
                    }
                });
        }
        return () => {
            ignore = true;
        };
    }, [country, city]); // ✅ All dependencies declared

// ...
```

- city 의 변화가 country 의 로직마저 실행하게 하고 있다.
- 위 예제에서는 `country` 와 `city` 를 동시에 의존성 배열에 갖고 있지만 사실 콜백 내부의 로직은 같은 반응형 값에 반응하는 게 아니다.

- 하나의 컴포넌트는 하나 이상의 Effect 를 가질 수 있기 때문에 서로 다른 반응을 추적한다면 아래와 같이 useEffect 를 분리해야한다.

```jsx
function ShippingForm({country}) {
    const [cities, setCities] = useState(null);
    // (1) country 만을 의존함.
    useEffect(() => {
        let ignore = false;
        fetch(`/api/cities?country=${country}`)
            .then(response => response.json())
            .then(json => {
                if (!ignore) {
                    setCities(json);
                }
            });
        return () => {
            ignore = true;
        };
    }, [country]); // ✅ All dependencies declared

    const [city, setCity] = useState(null);
    const [areas, setAreas] = useState(null);
    // (2) city 만을 의존함.
    useEffect(() => {
        if (city) {
            let ignore = false;
            fetch(`/api/areas?city=${city}`)
                .then(response => response.json())
                .then(json => {
                    if (!ignore) {
                        setAreas(json);
                    }
                });
            return () => {
                ignore = true;
            };
        }
    }, [city]); // ✅ All dependencies declared

// ...
```

## 다음 State를 계산하기 위해 어떤 State를 읽고 있나요?

```jsx
function ChatRoom({roomId}) {
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const connection = createConnection();
        connection.connect();
        connection.on('message', (receivedMessage) => {
            setMessages([...messages, receivedMessage]);
        });
        return () => connection.disconnect();
    }, [roomId, messages]); // ✅ All dependencies declared
// ...
```

- effect 는 messages 를 의존하고 있으며 직접적으로 messages 를 변경(setState) 하고 있다.
- 메시지를 수신하면 내부 콜백이 실행되며 messsage 를 변경하며 리랜더링이 발생하여 결국 useEffect 내부 콜백마저 재실행되는 문제가 발생
- useEffect 는 messages 의 변경에 반응할 필요가 없기 때문에 messages 를 제거해야한다.

```jsx
function ChatRoom({roomId}) {
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const connection = createConnection();
        connection.connect();
        connection.on('message', (receivedMessage) => {
            setMessages(msgs => [...msgs, receivedMessage]);
        });
        return () => connection.disconnect();
    }, [roomId]); // messages 필요 없다.
// ...
```

- 결국 useEffect 에서 의존해야하는 배열을 잘 선택하자!

## 요약 및 소고..

- 의존성이 마음에 들지 않으면 코드를 수정해야 합니다.
- 린터를 억제하면 매우 혼란스러운 버그가 발생하므로 항상 피해야 합니다.
- 의존성을 제거하려면 해당 의존성이 필요하지 않다는 것을 린터에게 “증명”해야 합니다.
- 특정 상호작용에 대한 응답으로 일부 코드가 실행되어야 하는 경우 해당 코드를 이벤트 핸들러로 변경해야한다.
- Effect의 `다른 부분이 다른 이유`로 다시 실행되어야 하는 경우 여러 개의 Effect 로 분할해야한다.
- 이전 State를 기반으로 일부 State를 업데이트하려면 업데이터 함수를 전달해야한다.
- ”반응”하지 않고 최신 값을 읽으려면 Effect Event hook 을 사용하자.
    - 아직 실험이라 불안하다면 ref 를 이용하는 것도 하나의 방법이다.
    - 클로저의 변수 스냅샷과 react 는 순수 자바스크립트 오브젝트를 값으로 사용하는 걸 기억하자.
- 자바스크립트에서 객체와 함수는 서로 다른 시간에 생성된 경우 서로 다른 것으로 간주됩니다.
- 객체와 함수의 의존성을 피하세요. 컴포넌트 외부나 Effect 내부로 이동시키자
- 추가로 useEffect 사용 관련하여 여러가지 문제와 솔루션을 공식문서에서 제공하고 있다.
- 자바스크립트에 익숙하지 않은 개발자로서 주의점만 따로 정리하자면..

### Js Object 의 비교 연산은 Java 의 EqualsAndHashCode 와 다르다.

- 단순 참조 메모리 주소의 비교만 이루어진다. 애초에 논리적인 비교에 대한 코드를 정의한 적이 없다.

```jsx
<ChatRoom
    roomId={roomId}
    options={{
        serverUrl: serverUrl,
        roomId: roomId
    }}
/>
```

- options 의 값은 부모 컴포넌트가 하위 컴포넌트에 값을 넘겨줄 때마다 값은 동일하더라도 새로운 오브젝트를 생성하여 넘겨주는 것이다.
- 자식 컴포넌트에서는 options 프롭스를 직접적으로 이팩트에서 의존한다면 의도하지 반응을 지속적으로 추적하는 문제가 발생한다.

# 커스텀 hook으로 로직 재사용하기

```jsx
import {useState, useEffect} from 'react';

export default function StatusBar() {
    const [isOnline, setIsOnline] = useState(true);
    useEffect(() => {
        function handleOnline() {
            setIsOnline(true);
        }

        function handleOffline() {
            setIsOnline(false);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return <h1>{isOnline ? '✅ 온라인' : '❌ 연결 안 됨'}</h1>;
}

```

- 위 컴포넌트에서는 네트워크 연결에 대한 이벤트를 관리(추가/삭제) 하며 반응하는 useEffect 로직이 포함되어 있다.

```jsx
import {useState, useEffect} from 'react';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    useEffect(() => {
        function handleOnline() {
            setIsOnline(true);
        }

        function handleOffline() {
            setIsOnline(false);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return isOnline;
}

```

- 네트워크를 상태를 추적하는 코드를 커스텀 훅으로 추출하여 사용할 수 있다.
    - 별도 재활용 가능한 함수로 추출하더라도 항상 호출되어야한다는 리액트 훅 조건을 만족해야한다. (if, for 문 내부에서 조건에 따라 다르게 호출되면 안됨.)
- 브라우저 API나 외부 시스템과 소통하는 방법과 같은 불필요한 세부 사항을 숨길 수 있다.

```jsx
import {useState} from 'react';

export function useFormInput(initialValue) {
    const [value, setValue] = useState(initialValue);

    function handleChange(e) {
        setValue(e.target.value);
    }

    const inputProps = {
        value: value,
        onChange: handleChange
    };

    return inputProps;
}

```

- 커스텀 훅을 위와 같이 사용할 수도 있는데
- 커스텀 훅을 사용하는 이유는 state 그 자체가 아닌 state 를 핸들링(다루는) 로직을 하나의 훅이라는 함수에 모으는 것!
    - 이러한 코드는 데이터 자체와 그걸 다루는 로직이 하나의 훅에 존재하게 함으로써 코드의 응집도를 높일 수 있다.

```jsx
import {useState, useEffect} from 'react';
import {createConnection} from './chat.js';
import {showNotification} from './notifications.js';

export default function ChatRoom({roomId}) {
    const [serverUrl, setServerUrl] = useState('https://localhost:1234');

    useEffect(() => {
        const options = {
            serverUrl: serverUrl,
            roomId: roomId
        };
        const connection = createConnection(options);
        connection.on('message', (msg) => {
            showNotification('New message: ' + msg);
        });
        connection.connect();
        return () => connection.disconnect();
    }, [roomId, serverUrl]);

    return (
        <>
            <label>
                Server URL:
                <input value={serverUrl} onChange={e => setServerUrl(e.target.value)}/>
            </label>
            <h1>Welcome to the {roomId} room!</h1>
        </>
    );
}

```

- 예제에서 계속 사용되었던 채팅룸의 커넥션 코드 역시 커스텀 훅으로 분리할 수 있다.

```jsx
export default function ChatRoom({roomId}) {
    const [serverUrl, setServerUrl] = useState('https://localhost:1234');

    useChatRoom({
        roomId: roomId,
        serverUrl: serverUrl,
        onReceiveMessage(msg) {
            showNotification('New message: ' + msg);
        }
    });
    // ...
// ...
    export function useChatRoom({serverUrl, roomId, onReceiveMessage}) {
        useEffect(() => {
            const options = {
                serverUrl: serverUrl,
                roomId: roomId
            };
            const connection = createConnection(options);
            connection.connect();
            connection.on('message', (msg) => {
                onReceiveMessage(msg);
            });
            return () => connection.disconnect();
        }, [roomId, serverUrl, onReceiveMessage]);
    }
```

- 클라이언트(ChatRoom) 에서는 단순 useChatRoom 호출함으로써 커넥션을 맺고 메시지를 수신하는 할 수 있게 되며 응집도 높은 코드를 작성할 수 있다.
- 하나의 기능을 위한 코드가 밀집되어 있기 때문에 테스트 코드를 작성할 수 있게 되었다.

## 언제 커스텀 hook을 사용해야 하는지

- 이번 섹션이 커스텀 훅에 관한 내용이지만 모든 자잘한 중복되는 코드들까지 커스텀 hook으로 분리할 필요는 없다.
    - 미래에 일어날 변경을 미리 예측(상상) 하며 너무 많은 상황을 수용할 수 있는 코드를 작성하지는 말자.
- 비슷한 기능을 하나로 추상화해놓더라도 실제 변경될 때는 해당 기능이 같은 추상화를 유지하지 못할 수도 있기 때문에 패턴 지옥에 빠지지말고 적당히 하자..

## 요약

- 커스텀 hook 을 사용하면 컴포넌트 간 로직을 공유할 수 있습니다.
- 커스텀 hook 의 이름은 use 뒤에 대문자로 시작되어야 합니다.
    - 어쩐지 요즘 vue3 템플릿에서도 use 로 시작하더라..
- 커스텀 hook 은 state 자체가 아닌 state 저장 로직(처리)만 공유합니다.
    - state 를 생성하는 것도 중요하지만 state 를 핸들링하는 방법을 공유하는 것이 중요함!
- 하나의 hook 에서 다른 hook 으로 반응형 값을 전달할 수 있고, 값은 최신 상태로 유지된다.
- 모든 hook 은 컴포넌트가 재렌더링될 때 마다 재실행한다.
    - 훅도 함수다 결국 실행된다!
- 커스텀 hook 의 코드는 컴포넌트 코드처럼 순수해야 한다.
    - 리액트의 컴포넌트 철학인 걸로 기억한다.
    - 커스텀 훅도 결국 함수이며 순수함수를 유지함으로써 테스트 코드 작성이 쉬어진다.