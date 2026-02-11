Context managers handle setup and teardown of resources automatically using the `with` statement.

## Basic Usage

```python
with open("file.txt", "r") as f:
    content = f.read()
# File is automatically closed
```

## Class-Based Context Manager

```python
class DatabaseConnection:
    def __enter__(self):
        self.conn = create_connection()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        return False  # Don't suppress exceptions

with DatabaseConnection() as conn:
    conn.execute("SELECT * FROM users")
```

## Using contextlib

```python
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    yield
    end = time.time()
    print(f"Elapsed: {end - start:.2f}s")

with timer():
    do_something()
```

## Multiple Context Managers

```python
with open("input.txt") as infile, open("output.txt", "w") as outfile:
    outfile.write(infile.read())
```

## Async Context Managers

```python
class AsyncResource:
    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()

async with AsyncResource() as resource:
    await resource.do_work()
```

