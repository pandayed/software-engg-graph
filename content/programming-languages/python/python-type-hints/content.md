Type hints provide optional static typing for Python code, improving readability and enabling better tooling.

## Basic Type Hints

```python
def greet(name: str) -> str:
    return f"Hello, {name}"

age: int = 25
price: float = 19.99
is_active: bool = True
```

## Collection Types

```python
from typing import List, Dict, Set, Tuple

names: list[str] = ["Alice", "Bob"]
scores: dict[str, int] = {"Alice": 100}
unique_ids: set[int] = {1, 2, 3}
point: tuple[int, int] = (10, 20)
```

## Optional and Union

```python
from typing import Optional, Union

def find_user(id: int) -> Optional[str]:
    return None

def process(value: Union[int, str]) -> str:
    return str(value)

# Python 3.10+ syntax
def process(value: int | str) -> str:
    return str(value)
```

## Type Aliases

```python
from typing import TypeAlias

UserId: TypeAlias = int
UserMap: TypeAlias = dict[UserId, str]
```

## Callable

```python
from typing import Callable

def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)
```

## Generics

```python
from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: list[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()
```

