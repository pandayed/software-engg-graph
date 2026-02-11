Enums are a way to define a set of named constants.

## Basic Enum

```python
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"

status = Status.ACTIVE
print(status.name)   # ACTIVE
print(status.value)  # active
```

## Integer Enum

```python
from enum import IntEnum

class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

# Can be compared with integers
if Priority.HIGH > 2:
    print("High priority")
```

## Auto Values

```python
from enum import Enum, auto

class Color(Enum):
    RED = auto()
    GREEN = auto()
    BLUE = auto()
```

## Iteration

```python
for status in Status:
    print(f"{status.name}: {status.value}")
```

## Lookup

```python
Status("pending")      # Status.PENDING (by value)
Status["PENDING"]      # Status.PENDING (by name)
```

## Flag Enum

```python
from enum import Flag, auto

class Permission(Flag):
    READ = auto()
    WRITE = auto()
    EXECUTE = auto()

perms = Permission.READ | Permission.WRITE
if Permission.READ in perms:
    print("Can read")
```

